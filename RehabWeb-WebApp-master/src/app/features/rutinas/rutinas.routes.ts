import { Routes } from '@angular/router';

export const RUTINAS_ROUTES: Routes = [
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/nueva-rutina/nueva-rutina').then((m) => m.NuevaRutinaPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'nueva' },
];
