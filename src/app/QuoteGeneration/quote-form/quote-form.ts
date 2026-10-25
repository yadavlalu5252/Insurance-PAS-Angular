
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService } from '../../quote-service';
import { ProductService } from '../../product-service';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quote-form.html',
  styleUrl: './quote-form.scss'
})
export class QuoteForm implements OnInit {
  private quoteService = inject(QuoteService);
  private productService = inject(ProductService);
  private router = inject(Router);

  products: any[] = [];
  loadingProducts = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  form = {
    customer_id: null as number | null,
    product_id: null as number | null,
    policy_term: 1,
    sum_insured: null as number | null,
    premium_frequency_id: null as number | null
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loadingProducts = true;

    this.productService.getProducts().subscribe({
      next: (res: any) => {
        const items = Array.isArray(res)
          ? res
          : res?.data ?? res?.result ?? res?.items ?? [];

        this.products = items.filter((p: any) =>
          String(p.status ?? p.product_status ?? 'Active')
            .toLowerCase() === 'active'
        );

        this.loadingProducts = false;
      },
      error: (err: any) => {
        console.error('Unable to load products:', err);
        this.errorMessage =
          'Unable to load insurance products. Please check the Product API.';
        this.loadingProducts = false;
      }
    });
  }

  submitQuote(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.customer_id || !this.form.product_id) {
      this.errorMessage =
        'Customer and insurance product selection are required.';
      return;
    }

    if (!this.form.policy_term || this.form.policy_term < 1) {
      this.errorMessage = 'Policy term must be at least 1 year.';
      return;
    }

    if (!this.form.sum_insured || this.form.sum_insured <= 0) {
      this.errorMessage = 'Enter a valid sum insured.';
      return;
    }

    const payload: any = {
      customer_id: this.form.customer_id,
      product_id: this.form.product_id,
      policy_term: this.form.policy_term,
      sum_insured: this.form.sum_insured
    };

    if (this.form.premium_frequency_id !== null) {
      payload.premium_frequency_id = this.form.premium_frequency_id;
    }

    this.saving = true;

    this.quoteService.AddQuote(payload).subscribe({
      next: (res: any) => {
        console.log('Quote created:', res);
        this.saving = false;
        this.router.navigate(['/quotes']);
      },
      error: (err: any) => {
        console.error('Quote creation failed:', err);
        this.saving = false;
        this.errorMessage =
          err?.error?.message ??
          'Unable to create quote. Check the API response.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/quotes']);
  }
}
