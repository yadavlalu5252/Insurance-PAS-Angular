
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-quotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-quotes.html'
  
})
export class CustomerQuotes {
  quotes: any[] = [];

  searchText = '';
  selectedStatus = 'All';

  loading = false;
  errorMessage = '';

  get filteredQuotes() {
    return this.quotes.filter((quote: any) => {
      const quoteNumber = String(
        quote.quote_number ?? quote.quoteNumber ?? ''
      ).toLowerCase();

      const status = String(
        quote.quote_status ?? quote.quoteStatus ?? ''
      );

      const matchesSearch = quoteNumber.includes(
        this.searchText.toLowerCase()
      );

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
}
