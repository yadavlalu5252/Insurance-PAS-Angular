
import { Routes } from '@angular/router';

// Layouts
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AgentLayout } from './layouts/agent-layout/agent-layout';
import { CustomerLayout } from './layouts/customer-layout/customer-layout';

// Authentication
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { TwoFactor } from './features/auth/two-factor/two-factor';
import { TwoFactorSetup } from './features/auth/two-factor-setup/two-factor-setup';

// Guards
import { authGuard } from './core/guards/auth-guard';
import { claimRoleGuard, roleGuard } from './core/guards/role-guard';

// Dashboard and Reports
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

// Policy Services
import { EndorsemntReq } from './policy-service/endorsemnt-req/endorsemnt-req';
import { PolicyCancellation } from './policy-service/policy-cancellation/policy-cancellation';
import { PolicyRenewal } from './policy-service/policy-renewal/policy-renewal';
import { ServiceAddress } from './policy-service/service-address/service-address';
import { ServiceContact } from './policy-service/service-contact/service-contact';
import { ServiceCoverage } from './policy-service/service-coverage/service-coverage';
import { ServiceNominee } from './policy-service/service-nominee/service-nominee';
import { ServiceRider } from './policy-service/service-rider/service-rider';

// Claim Management
import { CustomerClaims } from './ClaimManagement/customer/customer-claims/customer-claims';
import { CustomerClaimNew } from './ClaimManagement/customer/customer-claim-new/customer-claim-new';
import { CustomerClaimDetails } from './ClaimManagement/customer/customer-claim-details/customer-claim-details';
import { AdminClaims } from './ClaimManagement/admin/admin-claims/admin-claims';
import { AdminClaimDetails } from './ClaimManagement/admin/admin-claim-details/admin-claim-details';
import { AdminInvestigations } from './ClaimManagement/admin/admin-investigations/admin-investigations';

// New Agent Claim Management Components
import { AgentClaims } from './ClaimManagement/agent/agent-claims/agent-claims';
import { AgentClaimNew } from './ClaimManagement/agent/agent-claim-new/agent-claim-new';
import { AgentClaimDetails } from './ClaimManagement/agent/agent-claim-details/agent-claim-details';

// Policy Management
import { Policies } from './features/policies/policies';
import { Endorsements } from './features/endorsements/endorsements';
import { PolicyClosureComponent } from './features/policy-closure/policy-closure';

export const routes: Routes = [
  // Default: always show login first
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Authentication routes must be public
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'two-factor', component: TwoFactor },
  { path: 'two-factor-setup', component: TwoFactorSetup },

  // Admin application
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: ['Admin', 'admin'] },
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'dashboard', component: Reports },
      { path: 'reports', component: Reports },

      { path: 'products', component: Product },
      { path: 'products/add', component: ProductForm },
      { path: 'products/edit/:id', component: ProductForm },

      { path: 'categories', component: Category },
      { path: 'categories/add', component: CategoryForm },
      { path: 'categories/edit/:id', component: CategoryForm },

      { path: 'product-management', component: ProductManagement },
      { path: 'product-configuration/:id', component: ProductConfiguration },

      { path: 'quotes', component: Quote },
      { path: 'quotes/new', component: QuoteForm },

      { path: 'policies', component: Policies },
      { path: 'endorsements', component: Endorsements },
      { path: 'policy-closure', component: PolicyClosureComponent },

      { path: 'policy-service/endorsement-request', component: EndorsemntReq },
      { path: 'policy-service/cancel', component: PolicyCancellation },
      { path: 'policy-service/renewal', component: PolicyRenewal },
      { path: 'policy-service/address', component: ServiceAddress },
      { path: 'policy-service/contact', component: ServiceContact },
      { path: 'policy-service/coverage', component: ServiceCoverage },
      { path: 'policy-service/nominee', component: ServiceNominee },
      { path: 'policy-service/rider', component: ServiceRider },

      {
        path: 'claims',
        canActivate: [claimRoleGuard],
        data: { role: 'admin' },
        children: [
          { path: '', component: AdminClaims },
          { path: 'investigations', component: AdminInvestigations }, // must stay above ':id'
          { path: ':id', component: AdminClaimDetails }
        ]
      }
    ]
  },

  // Agent application
  {
    path: 'agent',
    component: AgentLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: ['Agent', 'agent'] },
    children: [
      { path: '', redirectTo: 'policies', pathMatch: 'full' },
      { path: 'dashboard', component: Reports },

      { path: 'policies', component: Policies },
      { path: 'endorsements', component: Endorsements },
      { path: 'policy-closure', component: PolicyClosureComponent },

      { path: 'products', component: Product },
      { path: 'quotes', component: Quote },

      {
        path: 'claims',
        canActivate: [claimRoleGuard],
        data: { role: 'agent' },
        children: [
          { path: '', component: AgentClaims },
          { path: 'new', component: AgentClaimNew },
          { path: ':id', component: AgentClaimDetails }
        ]
      },

      { path: 'policy-service/endorsement-request', component: EndorsemntReq },
      { path: 'policy-service/cancel', component: PolicyCancellation },
      { path: 'policy-service/renewal', component: PolicyRenewal },
      { path: 'policy-service/address', component: ServiceAddress },
      { path: 'policy-service/contact', component: ServiceContact },
      { path: 'policy-service/coverage', component: ServiceCoverage },
      { path: 'policy-service/nominee', component: ServiceNominee },
      { path: 'policy-service/rider', component: ServiceRider }
    ]
  },

  // Customer application
  {
    path: 'customer',
    component: CustomerLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: ['Customer', 'customer'] },
    children: [
      { path: '', redirectTo: 'policies', pathMatch: 'full' },

      { path: 'policies', component: Policies },
      { path: 'endorsements', component: Endorsements },
      { path: 'policy-closure', component: PolicyClosureComponent },

      {
        path: 'claims',
        canActivate: [claimRoleGuard],
        data: { role: 'customer' },
        children: [
          { path: '', component: CustomerClaims },
          { path: 'new', component: CustomerClaimNew },
          { path: ':id', component: CustomerClaimDetails }
        ]
      },

      { path: 'policy-service/endorsement-request', component: EndorsemntReq },
      { path: 'policy-service/cancel', component: PolicyCancellation },
      { path: 'policy-service/renewal', component: PolicyRenewal },
      { path: 'policy-service/address', component: ServiceAddress },
      { path: 'policy-service/contact', component: ServiceContact },
      { path: 'policy-service/coverage', component: ServiceCoverage },
      { path: 'policy-service/nominee', component: ServiceNominee },
      { path: 'policy-service/rider', component: ServiceRider }
    ]
  },

  // Legacy routes kept for existing claim links
  {
    path: 'claims/customer',
    canActivate: [authGuard, claimRoleGuard],
    data: { role: 'customer' },
    children: [
      { path: '', component: CustomerClaims },
      { path: 'new', component: CustomerClaimNew },
      { path: ':id', component: CustomerClaimDetails }
    ]
  },

  {
    path: 'claims/agent',
    canActivate: [authGuard, claimRoleGuard],
    data: { role: 'agent' },
    children: [
      { path: '', component: AgentClaims },
      { path: 'new', component: AgentClaimNew },
      { path: ':id', component: AgentClaimDetails }
    ]
  },

  {
    path: 'claims/admin',
    canActivate: [authGuard, claimRoleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', component: AdminClaims },
      { path: ':id', component: AdminClaimDetails }
    ]
  },

  // Unknown routes return to login
  { path: '**', redirectTo: 'login' }
];