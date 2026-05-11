import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
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
    ]
  },
  { path: 'login', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'landing' },
];
