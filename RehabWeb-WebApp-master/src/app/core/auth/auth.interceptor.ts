import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Break circular dependency: Omit token header for login requests
  // This allows AuthService constructor to call login() without triggering its own injection
  if (req.url.includes('/api/auth/token/')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.token();
  
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Token ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        console.warn('[AuthInterceptor] 401 detected, clearing session');
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
