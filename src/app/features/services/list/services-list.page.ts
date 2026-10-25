import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { ServiceService } from '../../../core/services/service.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Service } from '../../../core/models/service.model';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-services-list-page',
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
  templateUrl: './services-list.page.html',
  styleUrl: './services-list.page.scss',
})
export class ServicesListPage implements OnInit {
 
  private readonly serviceService = inject(ServiceService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'name', 'description', 'durationMin', 'actions'];
  dataSource= new MatTableDataSource<Service>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  searchControl = new FormControl('');

   ngOnInit(): void {
    this.loadServices();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadServices();
      });
  }

  loadServices(): void {
    this.loading.set(true);
    const request = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      search: this.searchControl.value ?? '',
    };
    this.serviceService.list(request).subscribe({
      next: (response) => {
        this.dataSource.data = response;
        this.totalItems = response.length; // Update totalItems based on the response
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.notificationService.error('Error loading services');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadServices();
  }

  editService(id: number): void {
    this.router.navigate(['/services', id, 'edit']);
  }

  confirmDelete(service: Service): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar service',
        message: `¿Estás seguro de eliminar "${service.name}"?. Esta acción no se deshacer.`,
        confirmLabel: 'Eliminar'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteService(service.id);
      }
    })
  }

  private deleteService(id: number): void {
    this.serviceService.delete(id).subscribe({
      next: () => {
        this.notificationService.success("Servicio eliminado correctamente");
        this.loadServices();
      },
      error: () => {
        this.notificationService.error("Error al eliminar el servicio");
      }
    });
  }

}
