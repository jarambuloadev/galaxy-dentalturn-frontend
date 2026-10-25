import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminUserItem } from '../../../core/models/admin-user.model';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-admin-users-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, HasRoleDirective],
  templateUrl: './admin-users-detail.page.html',
  styleUrl: './admin-users-detail.page.scss',
})
export class AdminUsersDetailPage implements OnInit {
  private readonly adminUserService = inject(AdminUserService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loading = signal(false);
  user = signal<AdminUserItem | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.adminUserService.getById(id).subscribe({
      next: (item) => {
        this.user.set(item);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el usuario');
        this.loading.set(false);
      },
    });
  }
}
