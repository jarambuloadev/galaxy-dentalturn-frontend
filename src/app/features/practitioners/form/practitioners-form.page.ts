import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Service } from '../../../core/models/service.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PractitionerService } from '../../../core/services/practitioner.service';
import { ServiceService } from '../../../core/services/service.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-practitioners-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    PageHeaderComponent,
  ],
  templateUrl: './practitioners-form.page.html',
  styleUrl: './practitioners-form.page.scss',
})
export class PractitionersFormPage implements OnInit {
  private readonly practitionerService = inject(PractitionerService);
  private readonly serviceService = inject(ServiceService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEditMode = false;
  practitionerId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);
  availableServices = signal<Service[]>([]);
  selectedServiceIds = signal<number[]>([]);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    active: [true],
  });

  get title(): string {
    return this.isEditMode ? 'Editar odontólogo' : 'Nuevo odontólogo';
  }

  get description(): string {
    return this.isEditMode
      ? 'Modifica los datos del profesional y los servicios que atiende'
      : 'Completa los datos del nuevo odontólogo y selecciona sus especialidades';
  }

  ngOnInit(): void {
    this.loadAvailableServices();
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode = true;
      this.practitionerId = Number(id);
      this.loadPractitioner(this.practitionerId);
    }
  }

  private loadAvailableServices(): void {
    this.serviceService.list({ pageNumber: 1, pageSize: 100, search: '' }).subscribe({
      next: (services) => {
        this.availableServices.set(services);
      },
      error: () => {
        this.notification.error('Error al cargar el catálogo de servicios');
      },
    });
  }

  private loadPractitioner(id: number): void {
    this.loadingData.set(true);
    this.practitionerService.getById(id).subscribe({
      next: (practitioner) => {
        this.form.patchValue({
          name: practitioner.name,
          active: practitioner.active,
        });
        this.selectedServiceIds.set(practitioner.serviceIds ?? []);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el odontólogo');
        this.loadingData.set(false);
      },
    });
  }

  isActive(): boolean {
    return !!this.form.get('active')?.value;
  }

  toggleActive(): void {
    const current = this.isActive();
    this.form.patchValue({ active: !current });
  }

  isServiceSelected(serviceId: number): boolean {
    return this.selectedServiceIds().includes(serviceId);
  }

  toggleService(serviceId: number): void {
    const current = this.selectedServiceIds();
    if (current.includes(serviceId)) {
      this.selectedServiceIds.set(current.filter((id) => id !== serviceId));
    } else {
      this.selectedServiceIds.set([...current, serviceId]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      name: value.name!,
      active: !!value.active,
      serviceIds: this.selectedServiceIds(),
    };

    this.loading.set(true);

    const operation$ = this.isEditMode
      ? this.practitionerService.update(this.practitionerId!, request)
      : this.practitionerService.create(request);

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode
            ? 'Odontólogo actualizado correctamente'
            : 'Odontólogo creado correctamente'
        );
        this.router.navigate(['/practitioners']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Error al guardar el odontólogo';
        this.notification.error(msg);
      },
    });
  }
}
