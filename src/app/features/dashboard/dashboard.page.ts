import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { Practitioner } from '../../core/models/practitioner.model';
import { Service } from '../../core/models/service.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { PractitionerService } from '../../core/services/practitioner.service';
import { ServiceService } from '../../core/services/service.service';

export interface BarDatum {
  label: string;
  value: number;
  sublabel?: string;
}

export interface StatusDatum {
  status: string;
  label: string;
  value: number;
  color: string;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: '#f59e0b' },
  CONFIRMED: { label: 'Confirmado', color: '#2563eb' },
  CANCELLED: { label: 'Cancelado', color: '#ef4444' },
  COMPLETED: { label: 'Completado', color: '#10b981' },
};

const PRACTITIONER_COLORS = ['#2563eb', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly serviceService = inject(ServiceService);
  private readonly practitionerService = inject(PractitionerService);

  appointments = signal<Appointment[]>([]);
  services = signal<Service[]>([]);
  practitioners = signal<Practitioner[]>([]);
  loading = signal(true);

  readonly yTicks = [4, 3, 2, 1, 0];

  stats = computed(() => {
    const rows = this.appointments();
    const total = rows.length;
    const pending = rows.filter((r) => r.status === 'PENDING').length;
    const confirmed = rows.filter((r) => r.status === 'CONFIRMED').length;
    const cancelled = rows.filter((r) => r.status === 'CANCELLED').length;
    const completed = rows.filter((r) => r.status === 'COMPLETED').length;

    const uniquePatients = new Set(rows.map((r) => r.patientEmail || r.patientName)).size;

    const serviceDurationById = new Map(this.services().map((s) => [s.id, s.durationMin || 30]));
    const totalMinutes = rows
      .filter((r) => r.status !== 'CANCELLED')
      .reduce((acc, r) => acc + (serviceDurationById.get(r.serviceId) ?? 30), 0);

    const activeRate = total > 0 ? Math.round(((confirmed + completed) / total) * 100) : 0;

    return {
      total,
      pending,
      confirmed,
      cancelled,
      completed,
      uniquePatients,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      activePractitioners: this.practitioners().filter((p) => p.active).length,
      activeServices: this.services().length,
      activeRate,
    };
  });

  upcoming7Days = computed<BarDatum[]>(() => {
    const rows = this.appointments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: BarDatum[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;

      const count = rows.filter(
        (r) => r.date === key && (r.status === 'PENDING' || r.status === 'CONFIRMED')
      ).length;

      const dayShort = d
        .toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
        .replace('.', '');
      const label = dayShort.charAt(0).toUpperCase() + dayShort.slice(1);
      result.push({ label, value: count });
    }
    return result;
  });

  upcomingMax = computed(() => {
    const maxVal = Math.max(...this.upcoming7Days().map((d) => d.value), 0);
    return Math.max(4, maxVal);
  });

  statusData = computed<StatusDatum[]>(() => {
    const rows = this.appointments();
    const counts = new Map<string, number>();
    for (const r of rows) {
      counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
    }

    const items: StatusDatum[] = Array.from(counts.entries()).map(([status, value]) => ({
      status,
      label: STATUS_META[status]?.label ?? status,
      value,
      color: STATUS_META[status]?.color ?? '#6366f1',
    }));

    return items.sort((a, b) => b.value - a.value);
  });

  statusMax = computed(() => {
    const maxVal = Math.max(...this.statusData().map((d) => d.value), 0);
    return Math.max(4, maxVal);
  });

  serviceData = computed<BarDatum[]>(() => {
    const rows = this.appointments();
    const counts = new Map<string, number>();
    for (const r of rows) {
      const name = r.serviceName || 'Otro';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  });

  serviceMax = computed(() => {
    const maxVal = Math.max(...this.serviceData().map((d) => d.value), 0);
    return Math.max(4, maxVal);
  });

  practitionerData = computed(() => {
    const rows = this.appointments();
    const counts = new Map<string, number>();

    for (const p of this.practitioners()) {
      counts.set(p.name, 0);
    }
    for (const r of rows) {
      if (r.practitionerName) {
        counts.set(r.practitionerName, (counts.get(r.practitionerName) ?? 0) + 1);
      }
    }

    const total = Math.max(1, rows.length);
    return Array.from(counts.entries())
      .map(([label, value], index) => ({
        label,
        value,
        percent: Math.round((value / total) * 100),
        color: PRACTITIONER_COLORS[index % PRACTITIONER_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  });

  practitionerMax = computed(() => {
    const maxVal = Math.max(...this.practitionerData().map((d) => d.value), 0);
    return Math.max(4, maxVal);
  });

  timeSlotDistribution = computed<BarDatum[]>(() => {
    const rows = this.appointments().filter((r) => r.status !== 'CANCELLED');
    let morning = 0; // 08:00 - 11:59
    let midday = 0; // 12:00 - 14:59
    let afternoon = 0; // 15:00 - 19:00

    for (const r of rows) {
      const hour = Number((r.timeLabel || '09:00').split(':')[0]);
      if (hour < 12) morning++;
      else if (hour < 15) midday++;
      else afternoon++;
    }

    return [
      { label: 'Mañana (09:00 - 11:59)', value: morning, sublabel: 'Franja matutina' },
      { label: 'Mediodía (12:00 - 14:59)', value: midday, sublabel: 'Franja central' },
      { label: 'Tarde (15:00 - 18:00)', value: afternoon, sublabel: 'Franja vespertina' },
    ];
  });

  timeSlotMax = computed(() => {
    const maxVal = Math.max(...this.timeSlotDistribution().map((d) => d.value), 0);
    return Math.max(4, maxVal);
  });

  ngOnInit(): void {
    forkJoin({
      appointments: this.appointmentService.list({}),
      services: this.serviceService.list({ pageNumber: 1, pageSize: 100, search: '' }),
      practitioners: this.practitionerService.list({ pageNumber: 1, pageSize: 100, search: '' }),
    }).subscribe({
      next: ({ appointments, services, practitioners }) => {
        this.appointments.set(appointments);
        this.services.set(services);
        this.practitioners.set(practitioners);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getAxisTicks(maxVal: number): number[] {
    const step = Math.max(1, Math.ceil(maxVal / 4));
    return [0, step, step * 2, step * 3, step * 4];
  }
}
