import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import {
  getHomeRoute,
  getTokenPayload,
  hasRole,
  isTokenExpired
} from '../../claim-helpers';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const role = localStorage.getItem('role_name');
  const expectedRole = route.data['role'] as string[] | undefined;

  if (!role) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const normalizedRole = role.toLowerCase();

  const normalizedExpectedRoles = (expectedRole ?? []).map(
    expected => expected.toLowerCase()
  );

  if (normalizedExpectedRoles.includes(normalizedRole)) {
    return true;
  }

  if (normalizedRole === 'admin') {
    return router.createUrlTree(['/admin']);
  }

  if (normalizedRole === 'customer') {
    return router.createUrlTree(['/customer']);
  }

  if (normalizedRole === 'agent') {
    return router.createUrlTree(['/agent']);
  }

  return router.createUrlTree(['/login']);
};

// route data: { role: 'admin' | 'agent' | 'customer' }
export const claimRoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const payload = getTokenPayload();

  // No token or expired token: redirect to login.
  if (!payload || isTokenExpired(payload)) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // Allow access only to the required role.
  if (hasRole(route.data['role'])) {
    return true;
  }

  // Redirect the authenticated user to their own role-based area.
  return router.createUrlTree([getHomeRoute()]);
};
