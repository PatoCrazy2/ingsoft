import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, withApiBase } from '../http/api-base-url';

const STORAGE_KEY = 'rehabweb_token';

/** Cuenta demo del `seed_demo` del API (terapeuta con pacientes asignados). */
export const DEMO_TERAPEUTA_EMAIL = 'terapeuta@demo.rehab';
export const DEMO_TERAPEUTA_PASSWORD = 'demo12345';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _token = signal<string | null>(null);
  /** Emite cuando el usuario obtiene un token (login o restauración manual). */
  readonly sesionLista$ = new Subject<void>();

  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  private demoLoginEnCurso: Promise<void> | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this._token.set(localStorage.getItem(STORAGE_KEY));
    }
  }

  /**
   * Garantiza token demo antes de llamar al API (evita carrera con el arranque de la app).
   * En SSR no hace peticiones. Si el API no está, continúa sin token.
   */
  asegurarTokenDemo(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    if (this._token()) {
      return Promise.resolve();
    }
    if (!this.demoLoginEnCurso) {
      this.demoLoginEnCurso = firstValueFrom(
        this.login(DEMO_TERAPEUTA_EMAIL, DEMO_TERAPEUTA_PASSWORD),
      )
        .then(() => undefined)
        .catch(() => undefined)
        .finally(() => {
          this.demoLoginEnCurso = null;
        });
    }
    return this.demoLoginEnCurso;
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        withApiBase(this.apiBase, '/api/auth/token/'),
        { username: email, password },
      )
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this.sesionLista$.next();
        }),
      );
  }

  logout(): void {
    this.setToken(null);
  }

  setToken(token: string | null): void {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    this._token.set(token);
  }
}
