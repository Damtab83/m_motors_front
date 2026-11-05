import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRole, AuthSessionService } from '../services/auth-session-service';

export function roleGuard(requiredRole: AuthRole): CanActivateFn {
  return () => {
    const session = inject(AuthSessionService);
    const router = inject(Router);
    const user = session.getUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (user.role !== requiredRole) {
      return router.createUrlTree([
        user.role === 'Admin' ? '/admin-application-panel' : '/customer-panel',
      ]);
    }

    return true;
  };
}
