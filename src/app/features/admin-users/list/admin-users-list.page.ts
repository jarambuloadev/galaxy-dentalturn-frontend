import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminUserItem } from '../../../core/models/admin-user.model';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-admin-users-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedMaterialModule,
    HasRoleDirective,
    EmptyStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './admin-users-list.page.html',
  styleUrl: './admin-users-list.page.scss',
})
export class AdminUsersListPage implements OnInit {
  private readonly adminUserService = inject(AdminUserService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'name', 'email', 'rol', 'active', 'actions'];
  dataSource = new MatTableDataSource<AdminUserItem>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadAdminUsers();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadAdminUsers();
      });
  }

  loadAdminUsers(): void {
    this.loading.set(true);
    const request = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      search: this.searchControl.value ?? '',
    };
    this.adminUserService.list(request).subscribe({
      next: (response) => {
        this.dataSource.data = response;
        this.totalItems = response.length;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading admin users:', error);
        this.notificationService.error('Error al cargar los usuarios');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAdminUsers();
  }

  editUser(id: number): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  confirmDelete(user: AdminUserItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar usuario',
        message: `¿Estás seguro de eliminar al usuario "${user.name || user.email}"?. Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteUser(user.id);
      }
    });
  }

  private deleteUser(id: number): void {
    this.adminUserService.delete(id).subscribe({
      next: (res) => {
        if (res && res.isSuccess === false) {
          this.notificationService.error(res.message || 'No se pudo eliminar el usuario');
          return;
        }
        this.notificationService.success('Usuario eliminado correctamente');
        this.loadAdminUsers();
      },
      error: () => {
        this.notificationService.error('Error al eliminar el usuario');
      },
    });
  }
}
