
import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Product } from './ProductManagement/product/product';
import { ProductForm } from './ProductManagement/product-form/product-form';

import { Category } from './ProductManagement/category/category';
import { CategoryForm } from './ProductManagement/category-form/category-form';
import { ProductManagement } from './ProductManagement/product-management/product-management';
import { ProductConfiguration } from './ProductManagement/product-configuration/product-configuration';

import { Quote } from './QuoteGeneration/quote/quote';
import { QuoteForm } from './QuoteGeneration/quote-form/quote-form';

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
  { path: '', redirectTo: 'products', pathMatch: 'full' }
];
