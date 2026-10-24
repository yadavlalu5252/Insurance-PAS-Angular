import { Routes } from '@angular/router';

export const CLAIM_ROUTES: Routes = [
  {
    path: 'customer',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./customer/customer-claims/customer-claims').then((m) => m.CustomerClaims),
      },
      // 'new' must stay above ':id'
      {
        path: 'new',
        loadComponent: () =>
          import('./customer/customer-claim-new/customer-claim-new').then((m) => m.CustomerClaimNew),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./customer/customer-claim-details/customer-claim-details').then((m) => m.CustomerClaimDetails),
      },
    ],
  },
  {
    path: 'admin',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/admin-claims/admin-claims').then((m) => m.AdminClaims),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./admin/admin-claim-details/admin-claim-details').then((m) => m.AdminClaimDetails),
      },
    ],
  },
  {
    // the Agent uses the same screens, with agent links and wording
    path: 'agent',
    children: [
      {
        path: '',
        data: { basePath: '/claims/agent', title: 'Claims', showRegister: true },
        loadComponent: () =>
          import('./admin/admin-claims/admin-claims').then((m) => m.AdminClaims),
      },
      {
        path: 'new',
        data: { basePath: '/claims/agent', remember: false },
        loadComponent: () =>
          import('./customer/customer-claim-new/customer-claim-new').then((m) => m.CustomerClaimNew),
      },
      {
        path: ':id',
        data: { basePath: '/claims/agent' },
        loadComponent: () =>
          import('./customer/customer-claim-details/customer-claim-details').then((m) => m.CustomerClaimDetails),
      },
    ],
  },
];