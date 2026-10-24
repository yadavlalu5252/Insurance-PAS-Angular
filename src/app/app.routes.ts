
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
    path: 'two-factor',
    component: TwoFactor
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
