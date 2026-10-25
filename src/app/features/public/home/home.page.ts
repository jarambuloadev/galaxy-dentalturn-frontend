import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Service } from '../../../core/models/service.model';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceService } from '../../../core/services/service.service';
import { getServiceVisual, ServiceVisual } from '../../../core/utils/service-visuals';

interface HighlightItem {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly serviceService = inject(ServiceService);
  private readonly auth = inject(AuthService);

  services = signal<Service[]>([]);

  readonly highlights: HighlightItem[] = [
    { icon: 'event_available', text: 'Reserva en menos de 2 minutos, sin llamadas' },
    { icon: 'verified_user', text: 'Confirmación y estado del turno siempre visibles' },
    { icon: 'auto_awesome', text: 'Elige el odontólogo según el servicio que necesitas' },
  ];

  get adminRoute(): string {
    return this.auth.isAuthenticated() ? '/dashboard' : '/login';
  }

  ngOnInit(): void {
    this.serviceService.list({ pageNumber: 1, pageSize: 50, search: '' }).subscribe({
      next: (items) => {
        const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
        this.services.set(sorted);
      },
    });
  }

  getVisual(serviceName: string): ServiceVisual {
    return getServiceVisual(serviceName);
  }
}
