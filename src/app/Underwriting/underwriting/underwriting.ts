
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-underwriting-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './underwriting.html'
})
export class UnderwritingCases {
  constructor(private router: Router) {}

  cases: any[] = [];

  searchText = '';
  selectedStatus = 'All';

  loading = false;
  errorMessage = '';

  get filteredCases() {
    return this.cases.filter((item: any) => {
      const caseId = String(
        item.underwritingId ?? item.underwriting_id ?? item.id ?? ''
      ).toLowerCase();

      const quoteId = String(
        item.quoteId ?? item.quote_id ?? ''
      ).toLowerCase();

      const status = String(item.status ?? '').toLowerCase();
      const search = this.searchText.toLowerCase();

      const matchesSearch =
        caseId.includes(search) || quoteId.includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        status === this.selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  get pendingCount() {
    return this.cases.filter(
      (item: any) =>
        String(item.status ?? '').toLowerCase() === 'pending'
    ).length;
  }

  get approvedCount() {
    return this.cases.filter(
      (item: any) =>
        String(item.status ?? '').toLowerCase() === 'approved'
    ).length;
  }

  get rejectedCount() {
    return this.cases.filter(
      (item: any) =>
        String(item.status ?? '').toLowerCase() === 'rejected'
    ).length;
  }

  viewCase(item: any): void {
    const id =
      item.underwritingId ??
      item.underwriting_id ??
      item.id;

    if (id !== null && id !== undefined) {
      this.router.navigate(['/underwriting', id]);
    }
  }
}
