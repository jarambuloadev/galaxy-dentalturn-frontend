import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatientItem } from '../../../core/models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PatientService } from '../../../core/services/patient.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { HasRoleDirective } from '../../../shared/directives/has-role-directive';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  selector: 'app-patients-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, HasRoleDirective],
  templateUrl: './patients-detail.page.html',
  styleUrl: './patients-detail.page.scss',
})
export class PatientsDetailPage implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loading = signal(false);
  patient = signal<PatientItem | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.patientService.getById(id).subscribe({
      next: (item) => {
        this.patient.set(item);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el paciente');
        this.loading.set(false);
      },
    });
  }
}
