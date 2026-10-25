import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClaimService, ClaimItem } from '../../../claim-service';
import {
  CLAIM_STATUSES, clearCustomerId, getErrorMessage, getSavedCustomerId,
  getStatusBadge, saveCustomerId, unwrapList
} from '../../../claim-helpers';

@Component({
  selector: 'app-customer-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-claims.html',
  styleUrl: './customer-claims.scss',
})
export class CustomerClaims implements OnInit {
  private claimService = inject(ClaimService);
  private cd = inject(ChangeDetectorRef);

  statuses = CLAIM_STATUSES;

  allClaims: ClaimItem[] = [];
  filteredClaims: ClaimItem[] = [];
  claims: ClaimItem[] = [];

  loading = false;
  errorMessage = '';

  customerId: number | null = null;
  customerIdInput: number | null = null;

  searchText = '';
  selectedStatus = '';

  currentPage = 1;
  pageSize = 8;
  totalPages = 1;

  totalCount = 0;
  inProgressCount = 0;
  doneCount = 0;
  closedCount = 0;

  ngOnInit(): void {
    this.customerId = getSavedCustomerId();
    this.customerIdInput = this.customerId;
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cd.detectChanges();

    this.claimService
      .getClaims()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.allClaims = unwrapList(response);
          this.applyFilters();
        },
        error: (error: any) => {
          console.error('Unable to load claims:', error);
          this.allClaims = [];
          this.applyFilters();
          this.errorMessage = getErrorMessage(error, 'Claims could not be loaded.');
          this.cd.detectChanges();
        },
      });
  }

  saveCustomer(): void {
    if (!this.customerIdInput || this.customerIdInput < 1) {
      return;
    }

    saveCustomerId(this.customerIdInput);
    this.customerId = this.customerIdInput;
    this.applyFilters();
  }

  changeCustomer(): void {
    clearCustomerId();
    this.customerId = null;
    this.applyFilters();
  }

  applyFilters(resetPage: boolean = true): void {
    const mine = this.customerId === null
      ? []
      : this.allClaims.filter((claim: any) => Number(claim.customer_id) === this.customerId);

    this.totalCount = mine.length;
    this.inProgressCount = mine.filter((claim: any) =>
      ['Registered', 'Pending Verification', 'Under Survey', 'Under Investigation'].includes(claim.claim_status)).length;
    this.doneCount = mine.filter((claim: any) =>
      claim.claim_status === 'Approved' || claim.claim_status === 'Settled').length;
    this.closedCount = mine.filter((claim: any) =>
      claim.claim_status === 'Rejected' || claim.claim_status === 'Cancelled').length;

    const text = this.searchText.trim().toLowerCase();

    this.filteredClaims = mine.filter((claim: any) =>
      (!text || claim.claim_number.toLowerCase().includes(text)) &&
      (!this.selectedStatus || claim.claim_status === this.selectedStatus));

    this.totalPages = Math.max(Math.ceil(this.filteredClaims.length / this.pageSize), 1);

    if (resetPage || this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.claims = this.filteredClaims.slice(start, start + this.pageSize);

    this.cd.detectChanges();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.applyFilters(false);
  }

  getStatusBadge(status: string): string {
    return getStatusBadge(status);
  }

  trackByClaimId(index: number, claim: ClaimItem): number {
    return claim.claim_id;
  }
}
