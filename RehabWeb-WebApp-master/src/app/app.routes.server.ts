import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Rutas con parámetros dinámicos no pueden prerenderizarse sin `getPrerenderParams`.
 * `ejercicios/**` incluye `admin/:id/editar`, `admin/:id/validaciones`, etc.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'ejercicios/**', renderMode: RenderMode.Server },
  { path: 'rutinas/**', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
