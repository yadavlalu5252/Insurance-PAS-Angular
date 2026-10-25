
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const role = localStorage.getItem('role_name');
  const expectedRole = route.data['role'] as string[];

  if (!role) {
    return router.createUrlTree(['/login']);
  }

  if (expectedRole.includes(role)) {
    return true;
  }

  if (role === 'Customer') {
    return router.createUrlTree(['/customer-dashboard']);
  }

  if (role === 'Admin' || role === 'Agent') {
    return router.createUrlTree(['/dashboard']);
  }

  return router.createUrlTree(['/login']);
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getHomeRoute, getTokenPayload, hasRole, isTokenExpired } from '../../claim-helpers';


// route data: { role: 'admin' | 'agent' | 'customer' }
export const claimRoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const payload = getTokenPayload();

  // no token, or an expired one: go to the login
  if (!payload || isTokenExpired(payload)) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (hasRole(route.data['role'])) {
    return true;
  }

  // logged in, but this is another role's area: send the user to their own page
  return router.createUrlTree([getHomeRoute()]);
};
