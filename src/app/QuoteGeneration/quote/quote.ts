
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService } from '../../quote-service';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quote.html',
  styleUrl: './quote.scss'
})
export class Quote {
  service = inject(QuoteService);
  router = inject(Router);

  quotes: any[] = [];
  searchText = '';
  selectedStatus = 'All';
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.getQuotes();
  }

  getQuotes() {
    this.loading = true;
    this.errorMessage = '';

    this.service.getQuotes().subscribe({
      next: (res: any) => {
        console.log('Quotes API response:', res);

        // Handles both a direct array and a wrapped API response.
        this.quotes = Array.isArray(res)
          ? res
          : res?.data ?? res?.result ?? [];

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading quotes:', err);
        this.errorMessage = 'Unable to load quotes. Check the API and login.';
        this.loading = false;
      }
    });
  }

  get filteredQuotes() {
    return this.quotes.filter((q: any) => {
      const number = String(q.quote_number ?? q.quoteNumber ?? '');
      const customer = String(q.customer_id ?? q.customerId ?? '');
      const status = String(q.quote_status ?? q.quoteStatus ?? '');

      const matchesSearch =
        number.toLowerCase().includes(this.searchText.toLowerCase()) ||
        customer.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus =
        this.selectedStatus === 'All' ||
        status.toLowerCase() === this.selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  get pendingCount() {
    return this.quotes.filter(
      (q: any) =>
        String(q.quote_status ?? q.quoteStatus ?? '').toLowerCase() === 'pending'
    ).length;
  }

  get approvedCount() {
    return this.quotes.filter(
      (q: any) =>
        String(q.quote_status ?? q.quoteStatus ?? '').toLowerCase() === 'approved'
    ).length;
  }

  get rejectedCount() {
    return this.quotes.filter(
      (q: any) =>
        String(q.quote_status ?? q.quoteStatus ?? '').toLowerCase() === 'rejected'
    ).length;
  }

  createQuote() {
    this.router.navigate(['/quotes/new']);
  }
}
