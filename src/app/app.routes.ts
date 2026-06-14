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
    loadComponent: () =>
      import('./features/dashboard/dashboard-mural').then(m => m.DashboardMural),
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
    path: 'checklists',
    loadComponent: () =>
      import('./features/services/service-checklist/service-checklist').then(m => m.ServiceChecklist),
    canActivate: [authGuard],
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/whatsapp-report/whatsapp-report').then(m => m.WhatsappReport),
    canActivate: [authGuard],
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/agenda/agenda').then(m => m.Agenda),
    canActivate: [authGuard],
  },
  {
    path: 'meu-perfil',
    loadComponent: () =>
      import('./features/meu-perfil/meu-perfil').then(m => m.MeuPerfil),
    canActivate: [authGuard],
  },
  {
    path: 'escala',
    loadComponent: () =>
      import('./features/escala/escala').then(m => m.Escala),
    canActivate: [authGuard],
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./features/contacts/contacts').then(m => m.Contacts),
    canActivate: [authGuard],
  },
  {
    path: 'modules/:id',
    loadComponent: () =>
      import('./features/modules/module-placeholder/module-placeholder').then(
        m => m.ModulePlaceholder,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
