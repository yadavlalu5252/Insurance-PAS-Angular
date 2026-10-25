
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
