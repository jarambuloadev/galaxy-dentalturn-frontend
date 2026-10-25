import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Practitioner } from '../../../core/models/practitioner.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PractitionerService } from '../../../core/services/practitioner.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-practitioners-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, HasRoleDirective],
  templateUrl: './practitioners-detail.page.html',
  styleUrl: './practitioners-detail.page.scss',
})
export class PractitionersDetailPage implements OnInit {
  private readonly practitionerService = inject(PractitionerService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loading = signal(false);
  practitioner = signal<Practitioner | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.practitionerService.getById(id).subscribe({
      next: (item) => {
        this.practitioner.set(item);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el odontólogo');
        this.loading.set(false);
      },
    });
  }
}
