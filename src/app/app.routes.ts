import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
//import { LoginPage } from './features/auth/login/login.page';

export const routes: Routes = [
    //{ path: '', redirectTo: 'login' , pathMatch: 'full'},
    //Rutas publicas (sin autenticacion)
    {
        path: 'login',
        loadComponent: () => 
            import('./features/auth/login/login.page').then((m)=> m.LoginPage),
    },
    {
        path: '403',
        loadComponent: () => import('./features/errors/forbidden/forbidden').then((m)=> m.Forbidden),
    },
    {
        path: '404',
        loadComponent: () => import('./features/errors/not-found/not-found').then((m)=> m.NotFound),
    },

    //rutas protegidas (con autenticacion)
    {
        path: '',
        component: ShellComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => 
                    import('./features/dashboard/dashboard.page').then((m)=> m.DashboardPage),

            },
            {
                path: 'services',
                loadChildren: () => 
                    import('./features/services/services.routes').then((m)=> m.SERVICES_ROUTES),

            },
            {
                path: 'availability',
                loadComponent: () =>
                    import('./features/availability/availability.page').then((m) => m.AvailabilityPage),
            },
            {
                path: 'disponibilidad',
                redirectTo: 'availability',
                pathMatch: 'full',
            },
            { path: '', redirectTo: 'dashboard' , pathMatch: 'full'},
        ]
       
    },

    //catch all route
    { path: '**',
        loadComponent: () => import('./features/errors/not-found/not-found').then((m)=> m.NotFound),  

    }


];
