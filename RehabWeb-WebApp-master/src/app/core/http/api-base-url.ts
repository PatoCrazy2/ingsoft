import { isPlatformBrowser } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';

/**
 * Base del API Django. En el navegador se deja vacío para usar rutas `/api/...` (proxy de `ng serve`).
 * En Node (SSR) el proxy no aplica: hay que llamar al host real del backend.
 *
 * Sobrescribe con `INGSOFT_API_ORIGIN` (p. ej. `http://host.docker.internal:8002` si Node corre en Docker).
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    if (isPlatformBrowser(platformId)) {
      return '';
    }
    const env =
      typeof process !== 'undefined' && process.env['INGSOFT_API_ORIGIN']
        ? String(process.env['INGSOFT_API_ORIGIN']).trim().replace(/\/$/, '')
        : '';
    return env || 'http://127.0.0.1:8002';
  },
});

/** Une `API_BASE_URL` con una ruta que empieza por `/api/...`. */
export function withApiBase(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) {
    return p;
  }
  return `${base.replace(/\/$/, '')}${p}`;
}
