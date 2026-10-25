import { Routes } from '@angular/router';

import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { Reports } from './reports/reports';

import { Product } from './ProductManagement/product/product';
import { ProductForm } from './ProductManagement/product-form/product-form';
import { Category } from './ProductManagement/category/category';
import { CategoryForm } from './ProductManagement/category-form/category-form';
import { ProductManagement } from './ProductManagement/product-management/product-management';
import { ProductConfiguration } from './ProductManagement/product-configuration/product-configuration';

import { Quote } from './QuoteGeneration/quote/quote';
import { QuoteForm } from './QuoteGeneration/quote-form/quote-form';

import { Policies } from './features/policies/policies';
import { Endorsements } from './features/endorsements/endorsements';
import { PolicyClosureComponent } from './features/policy-closure/policy-closure';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },

      // Reports
      { path: 'reports', component: Reports },

      // Products
      { path: 'products', component: Product },
      { path: 'products/add', component: ProductForm },
      { path: 'products/edit/:id', component: ProductForm },

      // Categories
      { path: 'categories', component: Category },
      { path: 'categories/add', component: CategoryForm },
      { path: 'categories/edit/:id', component: CategoryForm },

      // Product management
      { path: 'product-management', component: ProductManagement },
      { path: 'product-configuration/:id', component: ProductConfiguration },

      // Quotes
      { path: 'quotes', component: Quote },
      { path: 'quotes/new', component: QuoteForm },

      // Policies
      { path: 'admin/policies', component: Policies },
      { path: 'agent/policies', component: Policies },
      { path: 'customer/policies', component: Policies },

      // Endorsements
      { path: 'admin/endorsements', component: Endorsements },
      { path: 'agent/endorsements', component: Endorsements },
      { path: 'customer/endorsements', component: Endorsements },

      // Policy closure
      { path: 'admin/policy-closure', component: PolicyClosureComponent },
      { path: 'agent/policy-closure', component: PolicyClosureComponent },
      { path: 'customer/policy-closure', component: PolicyClosureComponent }
    ]
  },

  { path: '**', redirectTo: 'reports' }
];