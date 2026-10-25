import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

// Authentication
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { TwoFactor } from './features/auth/two-factor/two-factor';
import { TwoFactorSetup } from './features/auth/two-factor-setup/two-factor-setup';

// Reports
import { Reports } from './reports/reports';

// Product Management
import { Product } from './ProductManagement/product/product';
import { ProductForm } from './ProductManagement/product-form/product-form';
import { Category } from './ProductManagement/category/category';
import { CategoryForm } from './ProductManagement/category-form/category-form';
import { ProductManagement } from './ProductManagement/product-management/product-management';
import { ProductConfiguration } from './ProductManagement/product-configuration/product-configuration';

// Quote Generation
import { Quote } from './QuoteGeneration/quote/quote';
import { QuoteForm } from './QuoteGeneration/quote-form/quote-form';
import { EndorsemntReq } from './policy-service/endorsemnt-req/endorsemnt-req';
import { PolicyCancellation } from './policy-service/policy-cancellation/policy-cancellation';
import { PolicyRenewal } from './policy-service/policy-renewal/policy-renewal';
import { ServiceAddress } from './policy-service/service-address/service-address';
import { ServiceContact } from './policy-service/service-contact/service-contact';
import { ServiceCoverage } from './policy-service/service-coverage/service-coverage';
import { ServiceNominee } from './policy-service/service-nominee/service-nominee';
import { ServiceRider } from './policy-service/service-rider/service-rider';

// Claim Management
import { claimRoleGuard } from './core/guards/role-guard';

import { CustomerClaims } from './ClaimManagement/customer/customer-claims/customer-claims';
import { CustomerClaimNew } from './ClaimManagement/customer/customer-claim-new/customer-claim-new';
import { CustomerClaimDetails } from './ClaimManagement/customer/customer-claim-details/customer-claim-details';
import { AdminClaims } from './ClaimManagement/admin/admin-claims/admin-claims';
import { AdminClaimDetails } from './ClaimManagement/admin/admin-claim-details/admin-claim-details';

// New Agent Claim Management Components
import { AgentClaims } from './ClaimManagement/agent/agent-claims/agent-claims';
import { AgentClaimNew } from './ClaimManagement/agent/agent-claim-new/agent-claim-new';
import { AgentClaimDetails } from './ClaimManagement/agent/agent-claim-details/agent-claim-details';

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

  // Default route - Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Authentication routes
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'two-factor', component: TwoFactor },
  { path: 'two-factor-setup', component: TwoFactorSetup },

  // Claim Management: Customer (its own layout comes later)
  {
    path: 'claims/customer',
    canActivate: [claimRoleGuard],
    data: { role: 'customer' },
    children: [
      { path: '', component: CustomerClaims },
      { path: 'new', component: CustomerClaimNew },
      { path: ':id', component: CustomerClaimDetails }
    ]
  },

  // Claim Management: Agent
  {
    path: 'agent/claims',
    canActivate: [claimRoleGuard],
    data: { role: 'agent' },
    children: [
      { path: '', component: AgentClaims },
      { path: 'new', component: AgentClaimNew },
      { path: ':id', component: AgentClaimDetails }
    ]
  },

  // Default route
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  { path: 'policy-service/cancel', component: PolicyCancellation },
  { path: 'policy-service/renewal', component: PolicyRenewal },
  { path: 'policy-service/address', component: ServiceAddress },
  { path: 'policy-service/contact', component: ServiceContact },
  { path: 'policy-service/coverage', component: ServiceCoverage },
  { path: 'policy-service/nominee', component: ServiceNominee },
  { path: 'policy-service/ride', component: ServiceRider }



  // Claim Management: Legacy Agent Route (uses the same screens, with agent links and wording)
  {
    path: 'claims/agent',
    canActivate: [claimRoleGuard],
    data: { role: 'agent' },
    children: [
      { path: '', component: AdminClaims, data: { basePath: '/claims/agent', title: 'Claims', showRegister: true } },
      { path: 'new', component: CustomerClaimNew, data: { basePath: '/claims/agent', remember: false } },
      { path: ':id', component: CustomerClaimDetails, data: { basePath: '/claims/agent' } }
    ]
  },

  // Admin layout and application routes
  {
    path: '',
    component: AdminLayout,
    children: [
      // Dashboard and Reports
      { path: 'reports', component: Reports },

      // Product routes
      { path: 'products', component: Product },
      { path: 'products/add', component: ProductForm },
      { path: 'products/edit/:id', component: ProductForm },

      // Category routes
      { path: 'categories', component: Category },
      { path: 'categories/add', component: CategoryForm },
      { path: 'categories/edit/:id', component: CategoryForm },

      // Product Management routes
      { path: 'product-management', component: ProductManagement },
      { path: 'product-configuration/:id', component: ProductConfiguration },

      // Quote routes
      { path: 'quotes', component: Quote },
      { path: 'quotes/new', component: QuoteForm },

      // Claim Management: Admin
      {
        path: 'claims/admin',
        canActivate: [claimRoleGuard],
        data: { role: 'admin' },
        children: [
          { path: '', component: AdminClaims },
          { path: ':id', component: AdminClaimDetails }
        ]
      }
    ]
  },

  // Redirect unknown routes
  { path: '**', redirectTo: 'login' }
];
