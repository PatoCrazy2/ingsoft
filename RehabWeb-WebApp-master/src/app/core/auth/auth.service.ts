import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, withApiBase } from '../http/api-base-url';

const STORAGE_KEY = 'rehabweb_token';
const ROLE_KEY = 'rehabweb_role';

/** Cuentas demo del `seed_demo` del API. */
export const DEMO_CREDENTIALS = {
  Terapeuta: { email: 'terapeuta@demo.rehab', password: 'demo12345', role: 'Terapeuta' },
  Admin: { email: 'admin@demo.rehab', password: 'demo12345', role: 'Admin' },
  Paciente: { email: 'paciente@demo.rehab', password: 'demo12345', role: 'Paciente' }
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

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const savedToken = localStorage.getItem(STORAGE_KEY);
      const savedRole = localStorage.getItem(ROLE_KEY);
      
      if (savedToken) {
        this._token.set(savedToken);
        this._role.set(savedRole);
        this.ready.set(true);
      } else if (isPlatformBrowser(this.platformId)) {
        // Inicialización automática para evitar 401 en el primer arranque
        void this.loginByRole('Terapeuta').then(() => this.ready.set(true));
      } else {
        this.ready.set(true);
      }
    } else {
      this.ready.set(true);
    }
  }

  /**
   * Garantiza token demo antes de llamar al API.
   */
  asegurarTokenDemo(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this._token()) {
      return Promise.resolve();
    }
    
    return this.loginByRole('Terapeuta');
  }

  /**
   * Login simulado por rol para la pantalla de entrada.
   */
  async loginByRole(roleName: 'Terapeuta' | 'Admin' | 'Paciente'): Promise<void> {
    if (this.demoLoginEnCurso) return this.demoLoginEnCurso;
    
    const creds = DEMO_CREDENTIALS[roleName];
    this.demoLoginEnCurso = (async () => {
      try {
        await firstValueFrom(this.login(creds.email, creds.password));
        this.setRole(creds.role);
      } catch (e) {
        console.warn('API no disponible, usando modo demo offline');
        this.setToken('mock_token_' + roleName.toLowerCase());
        this.setRole(creds.role);
        this.sesionLista$.next();
      } finally {
        this.demoLoginEnCurso = null;
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
    if (typeof localStorage !== 'undefined') {
      if (token && !token.startsWith('mock_token_')) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    this._token.set(token);
  }

  setRole(role: string | null): void {
    if (typeof localStorage !== 'undefined') {
      if (role) {
        localStorage.setItem(ROLE_KEY, role);
      } else {
        localStorage.removeItem(ROLE_KEY);
      }
    }
    this._role.set(role);
  }
}
