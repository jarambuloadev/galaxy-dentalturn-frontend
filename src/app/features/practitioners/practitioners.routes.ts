import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PRACTITIONERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/practitioners-list.page').then((m) => m.PractitionersListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/practitioners-form.page').then((m) => m.PractitionersFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/practitioners-form.page').then((m) => m.PractitionersFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/practitioners-detail.page').then((m) => m.PractitionersDetailPage),
  },
];
