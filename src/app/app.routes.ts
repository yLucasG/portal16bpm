import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/services').then(m => m.Services),
    canActivate: [authGuard],
  },
  {
    path: 'services/:id',
    loadComponent: () =>
      import('./features/services/service-detail/service-detail').then(m => m.ServiceDetail),
    canActivate: [authGuard],
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/whatsapp-report/whatsapp-report').then(m => m.WhatsappReport),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
