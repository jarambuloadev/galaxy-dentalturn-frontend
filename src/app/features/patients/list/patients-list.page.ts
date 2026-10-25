import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PatientItem } from '../../../core/models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-patients-list-page',
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
  templateUrl: './patients-list.page.html',
  styleUrl: './patients-list.page.scss',
})
export class PatientsListPage implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'active', 'actions'];
  dataSource = new MatTableDataSource<PatientItem>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadPatients();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadPatients();
      });
  }

  loadPatients(): void {
    this.loading.set(true);
    const request = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      search: this.searchControl.value ?? '',
    };
    this.patientService.list(request).subscribe({
      next: (response) => {
        this.dataSource.data = response;
        this.totalItems = response.length;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.notificationService.error('Error al cargar los pacientes');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPatients();
  }

  editPatient(id: number): void {
    this.router.navigate(['/patients', id, 'edit']);
  }

  confirmDelete(patient: PatientItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar paciente',
        message: `¿Estás seguro de eliminar al paciente "${patient.name}"?. Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deletePatient(patient.id);
      }
    });
  }

  private deletePatient(id: number): void {
    this.patientService.delete(id).subscribe({
      next: (res) => {
        if (res && res.isSuccess === false) {
          this.notificationService.error(res.message || 'No se pudo eliminar el paciente');
          return;
        }
        this.notificationService.success('Paciente eliminado correctamente');
        this.loadPatients();
      },
      error: () => {
        this.notificationService.error('Error al eliminar el paciente');
      },
    });
  }
}
