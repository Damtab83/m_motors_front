import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../services/auth-session-service';

const publicAuthenticationPaths = [
  '/authentification/connexion',
  '/authentification/inscription',
];

const publicReadPaths = ['/client', '/voiture'];

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthSessionService).getToken();
  const isApiRequest =
    request.url === environment.apiUrl ||
    request.url.startsWith(`${environment.apiUrl}/`);
  const isPublicAuthenticationRequest = publicAuthenticationPaths.some((path) =>
    request.url.startsWith(`${environment.apiUrl}${path}`),
  );
  const apiPath = isApiRequest ? request.url.slice(environment.apiUrl.length) : '';
  const isPublicReadRequest =
    request.method === 'GET' &&
    publicReadPaths.some((path) => apiPath === path || apiPath.startsWith(`${path}/`));

  if (!token || !isApiRequest || isPublicAuthenticationRequest || isPublicReadRequest) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
