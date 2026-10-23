import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login.page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {

  private readonly authService =  inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);
  
  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  loading = false;
  hidePassword = true;
  sessionExpiredMessage = false;

  ngOnInit(): void {
    //Detectar redireccion por sesion expirada
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired']) {
        this.sessionExpiredMessage = params['expired'] === 'true';
      }
    });

    //Redireccionar si ya esta logueado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }


  submit(): void {
    if (this.form.invalid) {
      this.notification.error('Por favor complete todos los campos requeridos.');
      return;
    }
    
    this.loading = true;
    const { username, password } = this.form.value;
    this.authService.login({ email: username!, password: password! }).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        const message =
          error.error?.message ||
          (error.status === 400 || error.status === 401 ?
          'Credenciales Incorrectas. Por favor, verifique su nombre de usuario y contraseña.' :
          'Error al conectar con el servidor. Por favor, inténtelo nuevamente más tarde.'); 
        this.notification.error(message);
      }
    });
  }


}
