import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/patients-list.page').then((m) => m.PatientsListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/patients-form.page').then((m) => m.PatientsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/patients-form.page').then((m) => m.PatientsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/patients-detail.page').then((m) => m.PatientsDetailPage),
  },
];
