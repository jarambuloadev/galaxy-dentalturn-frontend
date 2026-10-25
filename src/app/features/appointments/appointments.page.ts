import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { Practitioner } from '../../core/models/practitioner.model';
import { Service } from '../../core/models/service.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { NotificationService } from '../../core/services/notification.service';
import { PractitionerService } from '../../core/services/practitioner.service';
import { ServiceService } from '../../core/services/service.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './appointments.page.html',
  styleUrl: './appointments.page.scss',
})
export class AppointmentsPage implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly serviceService = inject(ServiceService);
  private readonly practitionerService = inject(PractitionerService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  appointments = signal<Appointment[]>([]);
  services = signal<Service[]>([]);
  practitioners = signal<Practitioner[]>([]);
  loading = signal(false);

  filterDate = '';
  filterServiceId: number | null = null;
  filterPractitionerId: number | null = null;
  filterStatus: AppointmentStatus | '' = '';

  stats = computed(() => {
    const rows = this.appointments();
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === 'PENDING').length,
      confirmed: rows.filter((r) => r.status === 'CONFIRMED').length,
      cancelled: rows.filter((r) => r.status === 'CANCELLED').length,
    };
  });

  get hasFilters(): boolean {
    return !!(this.filterDate || this.filterServiceId || this.filterPractitionerId || this.filterStatus);
  }

  ngOnInit(): void {
    forkJoin({
      services: this.serviceService.list({ pageNumber: 1, pageSize: 100, search: '' }),
      practitioners: this.practitionerService.list({ pageNumber: 1, pageSize: 100, search: '' }),
    }).subscribe({
      next: ({ services, practitioners }) => {
        this.services.set(services);
        this.practitioners.set(practitioners);
      },
    });
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService
      .list({
        date: this.filterDate || undefined,
        serviceId: this.filterServiceId || undefined,
        practitionerId: this.filterPractitionerId || undefined,
        status: this.filterStatus || undefined,
      })
      .subscribe({
        next: (rows) => {
          this.appointments.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('Error al cargar los turnos');
          this.loading.set(false);
        },
      });
  }

  clearFilters(): void {
    this.filterDate = '';
    this.filterServiceId = null;
    this.filterPractitionerId = null;
    this.filterStatus = '';
    this.loadAppointments();
  }

  updateStatus(appt: Appointment, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(appt.id, status).subscribe({
      next: () => {
        this.notification.success('Estado del turno actualizado');
        this.loadAppointments();
      },
      error: () => {
        this.notification.error('No se pudo actualizar el turno');
      },
    });
  }

  confirmCancel(appt: Appointment): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Cancelar este turno?',
        message: `Se cancelará el turno de ${appt.patientName} (${appt.serviceName}, ${appt.dateLabel} ${appt.timeLabel}). Esta acción libera el horario para otros pacientes.`,
        confirmLabel: 'Sí, cancelar turno',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.updateStatus(appt, 'CANCELLED');
      }
    });
  }

  getStatusLabel(status: AppointmentStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Completado';
    }
  }
}
