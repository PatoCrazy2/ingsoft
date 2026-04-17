import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'ejercicios',
    loadChildren: () => import('./features/ejercicios/ejercicios.routes').then(m => m.EJERCICIOS_ROUTES)
  },
  { path: '**', redirectTo: 'landing' },
];
