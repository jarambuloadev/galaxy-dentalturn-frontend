import { Routes } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";

export const SERVICES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./list/services-list.page').then((m) => m.ServicesListPage),
    },
    {
        path: 'new',
        loadComponent: () => import('./form/services-form.page').then((m) => m.ServicesFormPage),
        canActivate: [roleGuard('admin')],
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./form/services-form.page').then((m) => m.ServicesFormPage),
        canActivate: [roleGuard('admin')],
    },
    { path: ':id', 
        loadComponent: () => import('./detail/services-detail.page').then((m) => m.ServicesDetailPage) } 

];