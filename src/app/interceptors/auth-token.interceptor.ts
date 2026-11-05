import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../services/auth-session-service';

const publicAuthenticationPaths = [
  '/authentification/connexion',
  '/authentification/inscription',
];

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthSessionService).getToken();
  const isApiRequest =
    request.url === environment.apiUrl ||
    request.url.startsWith(`${environment.apiUrl}/`);
  const isPublicAuthenticationRequest = publicAuthenticationPaths.some((path) =>
    request.url.startsWith(`${environment.apiUrl}${path}`),
  );

  if (!token || !isApiRequest || isPublicAuthenticationRequest) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
