import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../../models/types';
import { ToastService } from '../../shared/toast/toast.service';

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

  return next(req).pipe(
    catchError((error: unknown) => {
      // 401s are owned by authInterceptor (silent refresh/retry or redirect-to-login);
      // surfacing a toast here too would fire on the transparent-refresh path.
      if (error instanceof HttpErrorResponse && error.status !== 401) {
        const message = isErrorResponse(error.error)
          ? error.error.message
          : 'An unexpected error occurred. Please try again.';
        toastService.error(message);
      }
      return throwError(() => error);
    }),
  );
};
