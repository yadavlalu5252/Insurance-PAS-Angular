
import { Routes } from '@angular/router';
import { Reports } from './reports/reports';

export const routes: Routes = [
  { path: '', component: Reports },
  { path: '**', redirectTo: '' }
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Product } from './ProductManagement/product/product';
import { ProductForm } from './ProductManagement/product-form/product-form';

import { Category } from './ProductManagement/category/category';
import { CategoryForm } from './ProductManagement/category-form/category-form';
import { ProductManagement } from './ProductManagement/product-management/product-management';
import { ProductConfiguration } from './ProductManagement/product-configuration/product-configuration';

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

export const routes: Routes = [
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

  // Default route
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  { path: 'policy-service/cancel', component: PolicyCancellation },
  { path: 'policy-service/renewal', component: PolicyRenewal },
  { path: 'policy-service/address', component: ServiceAddress },
  { path: 'policy-service/contact', component: ServiceContact },
  { path: 'policy-service/coverage', component: ServiceCoverage },
  { path: 'policy-service/nominee', component: ServiceNominee },
  { path: 'policy-service/ride', component: ServiceRider }



];
