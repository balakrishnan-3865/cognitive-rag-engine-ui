import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../../models/types';
import { ToastService } from '../../shared/toast/toast.service';

const PUBLIC_AUTH_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];

function isErrorResponse(body: unknown): body is ErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    'status' in body
  );
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const isPublicAuthCall = PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));

  return next(req).pipe(
    catchError((error: unknown) => {
      // 401s on authenticated requests are owned by authInterceptor (silent refresh/retry
      // or redirect-to-login); surfacing a toast here too would fire on the transparent-
      // refresh path. Public auth calls (e.g. bad login credentials) never go through that
      // flow, so their 401s still need to toast here.
      const isOwnedByAuthInterceptor =
        error instanceof HttpErrorResponse && error.status === 401 && !isPublicAuthCall;

      if (error instanceof HttpErrorResponse && !isOwnedByAuthInterceptor) {
        const message = isErrorResponse(error.error)
          ? error.error.message
          : 'An unexpected error occurred. Please try again.';
        toastService.error(message);
      }
      return throwError(() => error);
    }),
  );
};
