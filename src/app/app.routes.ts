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

export const routes: Routes = [
  // Default route - Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Authentication routes
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'two-factor', component: TwoFactor },
  { path: 'two-factor-setup', component: TwoFactorSetup },

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
      { path: 'quotes/new', component: QuoteForm }
    ]
  },

  // Redirect unknown routes
  { path: '**', redirectTo: 'login' }
];