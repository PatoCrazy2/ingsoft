import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';

const STORAGE_KEY = 'rehabweb_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _token = signal<string | null>(null);
  /** Emite cuando el usuario obtiene un token (login o restauración manual). */
  readonly sesionLista$ = new Subject<void>();

  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this._token.set(localStorage.getItem(STORAGE_KEY));
    }
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>('/api/auth/token/', { username: email, password })
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
