import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-patients-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    PageHeaderComponent,
  ],
  templateUrl: './patients-form.page.html',
  styleUrl: './patients-form.page.scss',
})
export class PatientsFormPage implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEditMode = false;
  patientId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
  });

  get title(): string {
    return this.isEditMode ? 'Editar paciente' : 'Nuevo paciente';
  }

  get description(): string {
    return this.isEditMode
      ? 'Modifica los datos personales y de contacto del paciente'
      : 'Completa los datos para registrar un nuevo paciente en el consultorio';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode = true;
      this.patientId = Number(id);
      this.loadPatient(this.patientId);
    }
  }

  private loadPatient(id: number): void {
    this.loadingData.set(true);
    this.patientService.getById(id).subscribe({
      next: (patient) => {
        this.form.patchValue({
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el paciente');
        this.loadingData.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      name: value.name!,
      email: value.email!,
      phone: value.phone!,
    };

    this.loading.set(true);

    const operation$ = this.isEditMode
      ? this.patientService.update(this.patientId!, request)
      : this.patientService.create(request);

    operation$.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res && res.isSuccess === false) {
          this.notification.error(res.message || 'Error al guardar el paciente');
          return;
        }
        this.notification.success(
          this.isEditMode
            ? 'Paciente actualizado correctamente'
            : 'Paciente creado correctamente'
        );
        this.router.navigate(['/patients']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Error al guardar el paciente';
        this.notification.error(msg);
      },
    });
  }
}
