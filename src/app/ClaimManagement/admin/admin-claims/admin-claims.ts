import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClaimService, ClaimItem } from '../../../claim-service';
import { CLAIM_STATUSES, CLAIM_TYPES, getErrorMessage, getStatusBadge, unwrapList } from '../../../claim-helpers';

@Component({
  selector: 'app-admin-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-claims.html',
  styleUrl: './admin-claims.scss',
})
export class AdminClaims implements OnInit {
  private claimService = inject(ClaimService);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  // the Admin and Agent routes use this same screen. The route data decides the links and the title.
  basePath: string = this.route.snapshot.data['basePath'] ?? '/claims/admin';
  title: string = this.route.snapshot.data['title'] ?? 'All Claims';
  showRegister: boolean = this.route.snapshot.data['showRegister'] ?? false;

  statuses = CLAIM_STATUSES;
  types = CLAIM_TYPES;

  allClaims: ClaimItem[] = [];
  filteredClaims: ClaimItem[] = [];
  claims: ClaimItem[] = [];

  loading = false;
  errorMessage = '';

  searchText = '';
  selectedStatus = '';
  selectedType = '';
  customerFilter: number | null = null;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  totalCount = 0;
  pendingCount = 0;
  surveyCount = 0;
  investigationCount = 0;
  approvedCount = 0;

  ngOnInit(): void {
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
          this.applyFilters(false);
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

  private countStatus(status: string): number {
    return this.allClaims.filter((claim: any) => claim.claim_status === status).length;
  }

  applyFilters(resetPage: boolean = true): void {
    this.totalCount = this.allClaims.length;
    this.pendingCount = this.countStatus('Pending Verification');
    this.surveyCount = this.countStatus('Under Survey');
    this.investigationCount = this.countStatus('Under Investigation');
    this.approvedCount = this.countStatus('Approved');

    const text = this.searchText.trim().toLowerCase();

    this.filteredClaims = this.allClaims.filter((claim: any) =>
      (!text || claim.claim_number.toLowerCase().includes(text)) &&
      (!this.selectedStatus || claim.claim_status === this.selectedStatus) &&
      (!this.selectedType || claim.claim_type === this.selectedType) &&
      (!this.customerFilter || Number(claim.customer_id) === this.customerFilter));

    this.totalPages = Math.max(Math.ceil(this.filteredClaims.length / this.pageSize), 1);

    if (resetPage || this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.claims = this.filteredClaims.slice(start, start + this.pageSize);

    this.cd.detectChanges();
  }

  // clicking a count card filters by that status, clicking it again clears the filter
  filterByStatus(status: string): void {
    this.selectedStatus = this.selectedStatus === status ? '' : status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.customerFilter = null;
    this.applyFilters();
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
