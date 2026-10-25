import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-admin-users-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    PageHeaderComponent,
  ],
  templateUrl: './admin-users-form.page.html',
  styleUrl: './admin-users-form.page.scss',
})
export class AdminUsersFormPage implements OnInit {
  private readonly adminUserService = inject(AdminUserService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEditMode = false;
  userId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);

  roles = [
    { value: 'admin', label: 'Administrador', hint: 'Acceso total a configuración, servicios, odontólogos, disponibilidad y usuarios.' },
    { value: 'user', label: 'Recepción / Operador', hint: 'Acceso de consulta y gestión operativa de turnos.' },
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    rol: ['admin', [Validators.required]],
    passwordHash: ['', [Validators.minLength(6), Validators.maxLength(80)]],
  });

  get title(): string {
    return this.isEditMode ? 'Editar usuario' : 'Nuevo usuario';
  }

  get description(): string {
    return this.isEditMode
      ? 'Modifica los datos de acceso y el rol del usuario administrativo'
      : 'Completa los datos para registrar un nuevo usuario en el panel del consultorio';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode = true;
      this.userId = Number(id);
      this.form.get('passwordHash')?.setValidators([Validators.minLength(6), Validators.maxLength(80)]);
      this.form.get('passwordHash')?.updateValueAndValidity();
      this.loadUser(this.userId);
    } else {
      this.form.get('passwordHash')?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(80),
      ]);
      this.form.get('passwordHash')?.updateValueAndValidity();
    }
  }

  private loadUser(id: number): void {
    this.loadingData.set(true);
    this.adminUserService.getById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          rol: user.rol || 'admin',
          passwordHash: '',
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el usuario');
        this.loadingData.set(false);
      },
    });
  }

  selectRole(roleValue: string): void {
    this.form.patchValue({ rol: roleValue });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.loading.set(true);

    const operation$ = this.isEditMode
      ? this.adminUserService.update(this.userId!, {
          name: value.name!,
          email: value.email!,
          rol: value.rol || 'admin',
          passwordHash: value.passwordHash ? value.passwordHash : undefined,
        })
      : this.adminUserService.create({
          name: value.name!,
          email: value.email!,
          rol: value.rol || 'admin',
          passwordHash: value.passwordHash!,
        });

    operation$.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res && res.isSuccess === false) {
          this.notification.error(res.message || 'Error al guardar el usuario');
          return;
        }
        this.notification.success(
          this.isEditMode
            ? 'Usuario actualizado correctamente'
            : 'Usuario creado correctamente'
        );
        this.router.navigate(['/users']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Error al guardar el usuario';
        this.notification.error(msg);
      },
    });
  }
}
