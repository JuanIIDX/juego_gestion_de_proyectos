import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app-shell').then(m => m.AppShell),
  },
  {
    path: 'old',
    loadComponent: () => import('./old-shell').then(m => m.OldShell),
  },
  {
    path: 'debug/ia',
    loadComponent: () => import('./screens/debug-ia/debug-ia').then(m => m.DebugIa),
  },
  { path: '**', redirectTo: '' },
];
