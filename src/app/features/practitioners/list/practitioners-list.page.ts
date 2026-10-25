import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Practitioner } from '../../../core/models/practitioner.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PractitionerService } from '../../../core/services/practitioner.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-practitioners-list-page',
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
  templateUrl: './practitioners-list.page.html',
  styleUrl: './practitioners-list.page.scss',
})
export class PractitionersListPage implements OnInit {
  private readonly practitionerService = inject(PractitionerService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'name', 'services', 'active', 'actions'];
  dataSource = new MatTableDataSource<Practitioner>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadPractitioners();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadPractitioners();
      });
  }

  loadPractitioners(): void {
    this.loading.set(true);
    const request = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      search: this.searchControl.value ?? '',
    };
    this.practitionerService.list(request).subscribe({
      next: (response) => {
        this.dataSource.data = response;
        this.totalItems = response.length;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading practitioners:', error);
        this.notificationService.error('Error al cargar los odontólogos');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPractitioners();
  }

  editPractitioner(id: number): void {
    this.router.navigate(['/practitioners', id, 'edit']);
  }

  confirmDelete(practitioner: Practitioner): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar odontólogo',
        message: `¿Estás seguro de eliminar a "${practitioner.name}"?. Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deletePractitioner(practitioner.id);
      }
    });
  }

  private deletePractitioner(id: number): void {
    this.practitionerService.delete(id).subscribe({
      next: () => {
        this.notificationService.success('Odontólogo eliminado correctamente');
        this.loadPractitioners();
      },
      error: () => {
        this.notificationService.error('Error al eliminar el odontólogo');
      },
    });
  }
}
