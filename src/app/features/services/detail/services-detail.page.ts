import { Component, inject, OnInit, signal } from '@angular/core';
import { ServiceService } from '../../../core/services/service.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Service } from '../../../core/models/service.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';

@Component({
  selector: 'app-services-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, HasRoleDirective],
  templateUrl: './services-detail.page.html',
  styleUrl: './services-detail.page.scss',
})
export class ServicesDetailPage implements OnInit {

  private readonly serviceService = inject(ServiceService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loading = signal(false);
  service = signal<Service | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.serviceService.getById(id).subscribe({
      next: (srv) => {
        this.service.set(srv);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el servicio');
        this.loading.set(false);
      }
    });
  }
}
