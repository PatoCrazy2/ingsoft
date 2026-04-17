import { Routes } from '@angular/router';
import { BibliotecaEjerciciosPage } from './pages/biblioteca-ejercicios/biblioteca-ejercicios.component';
import { AdminEjerciciosPage } from './pages/admin-ejercicios/admin-ejercicios.component';
import { EjercicioEditPage } from './pages/ejercicio-edit/ejercicio-edit.component';
import { EjercicioDetailPage } from './pages/ejercicio-detail/ejercicio-detail.component';
import { EjercicioValidationPage } from './pages/ejercicio-validation/ejercicio-validation.component';

export const EJERCICIOS_ROUTES: Routes = [
  {
    path: '',
    component: BibliotecaEjerciciosPage,
    // canActivate: [RoleGuard], data: { roles: ['Terapeuta', 'Admin'] }
  },
  {
    path: 'admin',
    children: [
      {
        path: '',
        component: AdminEjerciciosPage,
        // canActivate: [RoleGuard], data: { roles: ['Admin'] }
      },
      {
        path: 'nuevo',
        component: EjercicioEditPage,
      },
      {
        path: ':id/editar',
        component: EjercicioEditPage,
      },
      {
        path: ':id/preview',
        component: EjercicioDetailPage,
      },
      {
        path: ':id/validaciones',
        component: EjercicioValidationPage,
      }
    ]
  }
];
