
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
