import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AvailableSlot } from '../../../core/models/appointment.model';
import { BusinessHours, DayOfWeek } from '../../../core/models/business-hours.model';
import { Practitioner } from '../../../core/models/practitioner.model';
import { Service } from '../../../core/models/service.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { BusinessHoursService } from '../../../core/services/business-hours.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PractitionerService } from '../../../core/services/practitioner.service';
import { ServiceService } from '../../../core/services/service.service';
import { getServiceVisual, ServiceVisual } from '../../../core/utils/service-visuals';

const AVATAR_GRADIENTS = [
  'avatar-grad--0',
  'avatar-grad--1',
  'avatar-grad--2',
  'avatar-grad--3',
];

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './booking.page.html',
  styleUrl: './booking.page.scss',
})
export class BookingPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly serviceService = inject(ServiceService);
  private readonly practitionerService = inject(PractitionerService);
  private readonly businessHoursService = inject(BusinessHoursService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  services = signal<Service[]>([]);
  practitioners = signal<Practitioner[]>([]);
  businessHours = signal<BusinessHours[]>([]);
  slots = signal<AvailableSlot[]>([]);
  loadingSlots = signal(false);
  submitting = signal(false);

  selectedServiceId = signal<number | null>(null);
  selectedPractitionerId = signal<number | null>(null);
  selectedDate = signal<string>('');
  selectedSlot = signal<AvailableSlot | null>(null);

  readonly minDate = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
  });

  availablePractitioners = computed(() => {
    const srvId = this.selectedServiceId();
    if (!srvId) return [];
    return this.practitioners().filter(
      (p) => p.active && p.serviceIds && p.serviceIds.includes(srvId)
    );
  });

  selectedService = computed(() =>
    this.services().find((s) => s.id === this.selectedServiceId())
  );

  selectedPractitioner = computed(() =>
    this.practitioners().find((p) => p.id === this.selectedPractitionerId())
  );

  completedSteps = computed(() => {
    let count = 0;
    if (this.selectedServiceId()) count++;
    if (this.selectedPractitionerId()) count++;
    if (this.selectedDate()) count++;
    if (this.selectedSlot()) count++;
    return count;
  });

  progressPercent = computed(() => Math.round((this.completedSteps() / 4) * 100));

  ngOnInit(): void {
    forkJoin({
      services: this.serviceService.list({ pageNumber: 1, pageSize: 100, search: '' }),
      practitioners: this.practitionerService.list({ pageNumber: 1, pageSize: 100, search: '' }),
      hours: this.businessHoursService.list(),
    }).subscribe({
      next: ({ services, practitioners, hours }) => {
        const sortedServices = [...services].sort((a, b) => a.name.localeCompare(b.name));
        this.services.set(sortedServices);
        this.practitioners.set(practitioners);
        this.businessHours.set(hours);

        const preselectedService = Number(this.route.snapshot.queryParamMap.get('serviceId'));
        if (preselectedService && sortedServices.some((s) => s.id === preselectedService)) {
          this.selectService(preselectedService);
        }
      },
    });
  }

  getVisual(serviceName: string): ServiceVisual {
    return getServiceVisual(serviceName);
  }

  getAvatarClass(index: number): string {
    return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  }

  getInitials(name: string): string {
    const clean = name.replace(/^(Dr\.|Dra\.)\s*/i, '');
    const parts = clean.split(' ').filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  selectService(id: number): void {
    this.selectedServiceId.set(id);
    this.selectedPractitionerId.set(null);
    this.selectedDate.set('');
    this.selectedSlot.set(null);
    this.slots.set([]);
  }

  selectPractitioner(id: number): void {
    this.selectedPractitionerId.set(id);
    this.selectedDate.set('');
    this.selectedSlot.set(null);
    this.slots.set([]);
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const dateVal = input.value;
    this.selectedDate.set(dateVal);
    this.selectedSlot.set(null);

    if (!dateVal) {
      this.slots.set([]);
      return;
    }

    const [y, m, d] = dateVal.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay() as DayOfWeek;
    const hours = this.businessHours().find((h) => h.dayOfWeek === dayOfWeek);
    if (hours && !hours.isOpen) {
      this.slots.set([]);
      return;
    }

    this.fetchSlots();
  }

  private fetchSlots(): void {
    const date = this.selectedDate();
    const serviceId = this.selectedServiceId();
    const practitionerId = this.selectedPractitionerId();

    if (!date || !serviceId || !practitionerId) return;

    this.loadingSlots.set(true);
    this.appointmentService.getAvailableSlots(date, serviceId, practitionerId).subscribe({
      next: (items) => {
        this.slots.set(items);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.loadingSlots.set(false);
      },
    });
  }

  selectSlot(slot: AvailableSlot): void {
    this.selectedSlot.set(slot);
  }

  formatDateSummary(dateStr: string): string {
    if (!dateStr) return 'Pendiente';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (
      this.form.invalid ||
      !this.selectedServiceId() ||
      !this.selectedPractitionerId() ||
      !this.selectedDate() ||
      !this.selectedSlot()
    ) {
      this.notification.error('Por favor completa todos los pasos para confirmar tu turno.');
      return;
    }

    const val = this.form.value;
    this.submitting.set(true);

    this.appointmentService
      .create({
        name: val.name!,
        email: val.email!,
        phone: val.phone!,
        serviceId: this.selectedServiceId()!,
        practitionerId: this.selectedPractitionerId()!,
        date: this.selectedDate(),
        startTime: this.selectedSlot()!.label,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.isFailure || !res.value) {
            this.notification.error(res.message || 'No se pudo reservar el turno.');
            return;
          }
          this.router.navigate(['/reservar/confirmacion', res.value.id]);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          const msg =
            err.error?.message ||
            err.error?.errors?.[0] ||
            'Ese horario ya no está disponible. Elige otro horario.';
          this.notification.error(msg);
        },
      });
  }
}
