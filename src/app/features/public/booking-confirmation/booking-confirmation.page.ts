import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-booking-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-confirmation.page.html',
  styleUrl: './booking-confirmation.page.scss',
})
export class BookingConfirmationPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly appointmentService = inject(AppointmentService);
  private readonly notification = inject(NotificationService);

  appointment = signal<Appointment | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.appointmentService.getById(id).subscribe({
      next: (appt) => {
        this.appointment.set(appt);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se encontró la reserva solicitada');
        this.loading.set(false);
      },
    });
  }
}
