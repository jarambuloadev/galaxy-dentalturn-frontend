import { Component, inject, OnInit, signal } from '@angular/core';
import { ServiceService } from '../../../core/services/service.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-services-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './services-form.page.html',
  styleUrl: './services-form.page.scss',
})
export class ServicesFormPage implements OnInit {

  private readonly serviceService = inject(ServiceService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEditMode = false;
  serviceId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(250)]],
    durationMin: [30, [Validators.required, Validators.min(5)]],
  });

  get title(): string {
    return this.isEditMode ? 'Editar servicio' : 'Nuevo servicio';
  }

  get description(): string {
    return this.isEditMode
      ? 'Modifica los datos del servicio odontológico'
      : 'Completa los datos del nuevo servicio odontológico';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode = true;
      this.serviceId = Number(id);
      this.loadService(this.serviceId);
    }
  }

  private loadService(id: number): void {
    this.loadingData.set(true);
    this.serviceService.getById(id).subscribe({
      next: (service) => {
        this.form.patchValue({
          name: service.name,
          description: service.description,
          durationMin: service.durationMin,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el servicio');
        this.loadingData.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const value = this.form.value;
    const request = {
      name: value.name!,
      description: value.description ?? '',
      durationMin: Number(value.durationMin),
    };

    this.loading.set(true);

    const operation$ = this.isEditMode
      ? this.serviceService.update(this.serviceId!, request)
      : this.serviceService.create(request);

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode
            ? 'Servicio actualizado correctamente'
            : 'Servicio creado correctamente'
        );
        this.router.navigate(['/services']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Error al guardar el servicio';
        this.notification.error(msg);
      }
    });
  }
}
