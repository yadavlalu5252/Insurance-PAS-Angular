
import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { TwoFactor } from './features/auth/two-factor/two-factor';
import { Dashboard } from './features/dashboard/dashboard/dashboard';

import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AgentLayout } from './layouts/agent-layout/agent-layout';
import { CustomerLayout } from './layouts/customer-layout/customer-layout';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'two-factor', component: TwoFactor },
  { path: 'register', component: Register },

  // Admin Dashboard
  {
    path: 'dashboard',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: ['Admin'] }
  },

  // Agent Dashboard
  {
    path: 'agent-dashboard',
    component: AgentLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: ['Agent'] },
    children: [
      {
        path: '',
        component: Dashboard
      }
    ]
  },

  // Customer Dashboard
  {
    path: 'customer-dashboard',
    component: CustomerLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: ['Customer'] }
  },

  { path: '**', redirectTo: 'login' }
];
