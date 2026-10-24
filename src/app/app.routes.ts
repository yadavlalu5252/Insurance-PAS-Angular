import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { TwoFactor } from './features/auth/two-factor/two-factor';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { TwoFactorSetup } from './features/auth/two-factor-setup/two-factor-setup';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'two-factor',
    component: TwoFactor
  },
  {
    path: 'two-factor-setup',
    component: TwoFactorSetup,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: Dashboard
      },
      // {
      //   path: 'users',
      //   loadComponent: () => import('./layouts/admin-layout/admin-users/admin-users').then(m => m.AdminUsers)
      // },
      // {
      //   path: 'roles',
      //   loadComponent: () => import('./layouts/admin-layout/admin-roles/admin-roles').then(m => m.AdminRoles)
      // },
      // {
      //   path: 'masters',
      //   loadComponent: () => import('./layouts/admin-layout/admin-masters/admin-masters').then(m => m.AdminMasters)
      // },
      // {
      //   path: 'policies',
      //   loadComponent: () => import('./layouts/admin-layout/admin-policies/admin-policies').then(m => m.AdminPolicies)
      // },
      // {
      //   path: 'claims',
      //   loadComponent: () => import('./layouts/admin-layout/admin-claims/admin-claims').then(m => m.AdminClaims)
      // },
      // {
      //   path: 'reports',
      //   loadComponent: () => import('./layouts/admin-layout/admin-reports/admin-reports').then(m => m.AdminReports)
      // }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];