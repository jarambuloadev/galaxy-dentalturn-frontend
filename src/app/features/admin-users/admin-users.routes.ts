import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/admin-users-list.page').then((m) => m.AdminUsersListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/admin-users-form.page').then((m) => m.AdminUsersFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/admin-users-form.page').then((m) => m.AdminUsersFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/admin-users-detail.page').then((m) => m.AdminUsersDetailPage),
  },
];
