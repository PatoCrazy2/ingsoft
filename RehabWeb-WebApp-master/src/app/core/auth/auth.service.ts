import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, withApiBase } from '../http/api-base-url';

const STORAGE_KEY = 'rehabweb_token';
const ROLE_KEY = 'rehabweb_role';

/** Cuentas demo del `seed_demo` del API. */
export type DemoRole = 'Terapeuta' | 'Admin' | 'Paciente';

export const DEMO_CREDENTIALS: Record<
  DemoRole,
  { email: string; password: string; role: DemoRole }
> = {
  Terapeuta: { email: 'terapeuta@demo.rehab', password: 'demo12345', role: 'Terapeuta' },
  Admin: { email: 'admin@demo.rehab', password: 'demo12345', role: 'Admin' },
  /** Cuenta del seed_demo (paciente1@demo.rehab). */
  Paciente: { email: 'paciente1@demo.rehab', password: 'demo12345', role: 'Paciente' },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly platformId = inject(PLATFORM_ID);
  
  private readonly _token = signal<string | null>(null);
  private readonly _role = signal<string | null>(null);

  /** Emite cuando el usuario obtiene un token (login o restauración manual). */
  readonly sesionLista$ = new Subject<void>();

  readonly token = this._token.asReadonly();
  readonly role = this._role.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly ready = signal(false);

  private demoLoginEnCurso: Promise<void> | null = null;
  private demoLoginRol: DemoRole | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      this.ready.set(true);
      return;
    }
    const savedToken = localStorage.getItem(STORAGE_KEY);
    const savedRole = localStorage.getItem(ROLE_KEY) as DemoRole | null;
    if (savedToken) {
      this._token.set(savedToken);
      this._role.set(savedRole);
    }
    this.ready.set(true);
  }

  /**
   * Garantiza sesión sin cambiar el rol elegido en landing.
   * Si hay rol guardado, reautentica con esa cuenta; nunca fuerza Terapeuta.
   */
  asegurarSesion(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this._token()) {
      return Promise.resolve();
    }

    const savedRole = localStorage.getItem(ROLE_KEY) as DemoRole | null;
    if (savedRole && savedRole in DEMO_CREDENTIALS) {
      return this.loginByRole(savedRole);
    }

    return Promise.resolve();
  }

  /** @deprecated Usar {@link asegurarSesion} para no sobrescribir el rol Paciente. */
  asegurarTokenDemo(): Promise<void> {
    return this.asegurarSesion();
  }

  /**
   * Login simulado por rol para la pantalla de entrada.
   */
  async loginByRole(roleName: DemoRole): Promise<void> {
    if (this.demoLoginEnCurso && this.demoLoginRol === roleName) {
      return this.demoLoginEnCurso;
    }

    const creds = DEMO_CREDENTIALS[roleName];
    this.setRole(creds.role);
    this.demoLoginRol = roleName;
    this.demoLoginEnCurso = (async () => {
      try {
        await firstValueFrom(this.login(creds.email, creds.password));
        this.setRole(creds.role);
      } catch {
        console.warn('API no disponible, usando modo demo offline');
        this.setToken('mock_token_' + roleName.toLowerCase());
        this.setRole(creds.role);
        this.sesionLista$.next();
      } finally {
        this.demoLoginEnCurso = null;
        this.demoLoginRol = null;
      }
    })();

    return this.demoLoginEnCurso;
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        withApiBase(this.apiBase, '/api/auth/token/'),
        { username: email, password },
      )
      .pipe(
        tap({
          next: (res) => {
            console.log('[AuthService] Login exitoso');
            this.setToken(res.token);
            this.sesionLista$.next();
          },
          error: (err) => {
            console.error('[AuthService] Error en login:', err);
          }
        })
      );
  }

  logout(): void {
    this.setToken(null);
    this.setRole(null);
  }

  setToken(token: string | null): void {
    if (isPlatformBrowser(this.platformId)) {
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    this._token.set(token);
  }

  setRole(role: string | null): void {
    if (isPlatformBrowser(this.platformId)) {
      if (role) {
        localStorage.setItem(ROLE_KEY, role);
      } else {
        localStorage.removeItem(ROLE_KEY);
      }
    }
    this._role.set(role);
  }
}
