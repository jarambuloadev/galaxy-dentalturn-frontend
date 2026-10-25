import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './features/public/public-layout.component';

export const routes: Routes = [
  // Rutas públicas con layout público (Landing page al iniciar y Reserva de turnos)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.page').then((m) => m.HomePage),
        pathMatch: 'full',
      },
      {
        path: 'reservar',
        loadComponent: () =>
          import('./features/public/booking/booking.page').then((m) => m.BookingPage),
      },
      {
        path: 'reservar/confirmacion/:id',
        loadComponent: () =>
          import('./features/public/booking-confirmation/booking-confirmation.page').then(
            (m) => m.BookingConfirmationPage
          ),
      },
    ],
  },

  // Rutas públicas sin layout
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/errors/forbidden/forbidden').then((m) => m.Forbidden),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/errors/not-found/not-found').then((m) => m.NotFound),
  },

  // Rutas protegidas (con autenticación - Panel Admin)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./features/services/services.routes').then((m) => m.SERVICES_ROUTES),
      },
      {
        path: 'practitioners',
        loadChildren: () =>
          import('./features/practitioners/practitioners.routes').then(
            (m) => m.PRACTITIONERS_ROUTES
          ),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.routes').then(
            (m) => m.PATIENTS_ROUTES
          ),
      },
      {
        path: 'pacientes',
        redirectTo: 'patients',
        pathMatch: 'full',
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointments.page').then(
            (m) => m.AppointmentsPage
          ),
      },
      {
        path: 'availability',
        loadComponent: () =>
          import('./features/availability/availability.page').then(
            (m) => m.AvailabilityPage
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/admin-users/admin-users.routes').then(
            (m) => m.ADMIN_USERS_ROUTES
          ),
      },
      {
        path: 'usuarios',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'disponibilidad',
        redirectTo: 'availability',
        pathMatch: 'full',
      },
    ],
  },

  // Catch all route
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found/not-found').then((m) => m.NotFound),
  },
];
