import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

let refreshRequest$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  if (isAuthRequest) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  const requestWithToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requestWithToken).pipe(
    catchError((error) => {
      if (error.status !== 401 || !refreshToken) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = authService.refreshToken(refreshToken).pipe(
          map((res) => {
            authService.persistSession(res.data);
            return res.data.accessToken;
          }),
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay(1),
        );
      }

      return refreshRequest$.pipe(
        switchMap((newToken) => {
          const retryRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryRequest);
        }),
        catchError((refreshError) => {
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

export const resetRefreshInterceptorState = (): void => {
  refreshRequest$ = null;
};