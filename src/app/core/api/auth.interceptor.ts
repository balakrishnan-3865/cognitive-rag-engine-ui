import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenPairResponse } from '../../models/types';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/toast/toast.service';

const PUBLIC_AUTH_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const http = inject(HttpClient);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const isPublicAuthCall = PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));
  const accessToken = authService.accessToken();

  const authedReq =
    !isPublicAuthCall && accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const refreshToken = authService.refreshToken();

      if (!isUnauthorized || isPublicAuthCall || !refreshToken) {
        return throwError(() => error);
      }

      return http
        .post<TokenPairResponse>(`${environment.apiBaseUrl}/api/v1/auth/refresh`, {
          refreshToken,
        })
        .pipe(
          switchMap((tokens) => {
            authService.setSession(tokens);
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            return next(retriedReq);
          }),
          catchError((refreshError: unknown) => {
            authService.clearSession();
            toastService.error('Your session has expired. Please log in again.');
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
    }),
  );
};
