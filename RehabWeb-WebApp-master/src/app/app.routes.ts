import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./screens/login/login').then((m) => m.LoginPlaceholderComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./screens/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'ejercicios',
    loadChildren: () => import('./features/ejercicios/ejercicios.routes').then(m => m.EJERCICIOS_ROUTES)
  },
  {
    path: 'rutinas',
    loadChildren: () => import('./features/rutinas/rutinas.routes').then((m) => m.RUTINAS_ROUTES),
  },
  { path: '**', redirectTo: 'landing' },
];
