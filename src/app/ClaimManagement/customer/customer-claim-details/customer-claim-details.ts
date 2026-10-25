import { Component, ElementRef, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {
  ClaimService, ClaimItem, ClaimHistoryItem, ClaimDocumentItem, SurveyItem
} from '../../../claim-service';
import {
  DOCUMENT_SUGGESTIONS, getErrorMessage, getStatusBadge, unwrapData, unwrapList
} from '../../../claim-helpers';
import { ClaimSettlementView } from '../../claim-settlement-view/claim-settlement-view';

@Component({
  selector: 'app-customer-claim-details',
  standalone: true,
  // ClaimSettlementView must be listed here, or <app-claim-settlement-view> is "not a known element"
  imports: [CommonModule, FormsModule, RouterLink, ClaimSettlementView],
  templateUrl: './customer-claim-details.html',
  styleUrl: './customer-claim-details.scss',
})
export class CustomerClaimDetails implements OnInit {
  private claimService = inject(ClaimService);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  // the Customer and Agent routes use this same screen. The route data decides the back link.
  basePath: string = this.route.snapshot.data['basePath'] ?? '/claims/customer';

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  claimId = 0;
  claim: ClaimItem | null = null;
  history: ClaimHistoryItem[] = [];
  documents: ClaimDocumentItem[] = [];
  survey: SurveyItem | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  steps = ['Registered', 'In Review', 'Approved', 'Settled'];
  suggestions: string[] = [];

  documentName = '';
  selectedFile: File | null = null;
  uploading = false;
  uploadError = '';

  ngOnInit(): void {
    this.claimId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cd.detectChanges();

    this.claimService
      .getClaimById(this.claimId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.claim = unwrapData(response) ?? null;
          this.suggestions = DOCUMENT_SUGGESTIONS[this.claim?.claim_type ?? ''] ?? [];
          this.cd.detectChanges();
        },
        error: (error: any) => {
          console.error('Unable to load the claim:', error);
          this.errorMessage = error?.status === 404
            ? 'Claim not found.'
            : getErrorMessage(error, 'The claim could not be loaded.');
          this.cd.detectChanges();
        },
      });

    this.claimService.getClaimHistory(this.claimId).subscribe({
      next: (response: any) => {
        this.history = unwrapList(response);
        this.cd.detectChanges();
      },
      error: () => {
        this.history = [];
        this.cd.detectChanges();
      },
    });

    this.claimService.getDocuments(this.claimId).subscribe({
      next: (response: any) => {
        this.documents = unwrapList(response);
        this.cd.detectChanges();
      },
      error: () => {
        this.documents = [];
        this.cd.detectChanges();
      },
    });

    // a 404 here only means that no survey exists yet
    this.claimService.getSurvey(this.claimId).subscribe({
      next: (response: any) => {
        this.survey = unwrapData(response) ?? null;
        this.cd.detectChanges();
      },
      error: () => {
        this.survey = null;
        this.cd.detectChanges();
      },
    });
  }

  // where the claim is on the main path: Registered, In Review, Approved, Settled
  getStepIndex(): number {
    switch (this.claim?.claim_status) {
      case 'Registered':
        return 0;
      case 'Pending Verification':
      case 'Under Survey':
      case 'Under Investigation':
        return 1;
      case 'Approved':
        return 2;
      case 'Settled':
        return 3;
      default:
        return -1;
    }
  }

  getStepClass(index: number): string {
    const current = this.getStepIndex();

    if (current === 3 || index < current) {
      return 'done';
    }

    return index === current ? 'current' : '';
  }

  isClosed(): boolean {
    const status = this.claim?.claim_status;
    return status === 'Rejected' || status === 'Cancelled';
  }

  // same rule as the API: cancel only before processing starts
  canCancel(): boolean {
    const status = this.claim?.claim_status;
    return status === 'Registered' || status === 'Pending Verification';
  }

  // same rule as the API: no uploads after a final decision
  canUpload(): boolean {
    const status = this.claim?.claim_status;
    return !!status && !['Approved', 'Rejected', 'Settled', 'Cancelled'].includes(status);
  }

  getIcon(action: string): string {
    const text = action.toLowerCase();

    if (text.includes('settled')) return 'bi-cash-coin';
    if (text.includes('approved')) return 'bi-check-circle';
    if (text.includes('rejected')) return 'bi-x-circle';
    if (text.includes('cancel')) return 'bi-slash-circle';
    if (text.includes('document')) return 'bi-file-earmark-text';
    if (text.includes('survey')) return 'bi-clipboard-check';
    if (text.includes('investigation')) return 'bi-search';

    return 'bi-dot';
  }

  getStatusBadge(status: string): string {
    return getStatusBadge(status);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadDocument(): void {
    this.uploadError = '';
    this.successMessage = '';

    const name = this.documentName.trim();

    if (!name) {
      this.uploadError = 'Enter or choose a document name.';
      return;
    }

    if (!this.selectedFile) {
      this.uploadError = 'Choose a file to upload.';
      return;
    }

    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase() ?? '';

    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
      this.uploadError = 'Only pdf, jpg, jpeg and png files are allowed.';
      return;
    }

    this.uploading = true;
    this.cd.detectChanges();

    this.claimService
      .uploadDocument(this.claimId, name, this.selectedFile)
      .pipe(
        finalize(() => {
          this.uploading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.documentName = '';
          this.selectedFile = null;

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          this.successMessage = 'Document uploaded successfully.';
          this.loadAll();
        },
        error: (error: any) => {
          console.error('Unable to upload the document:', error);
          this.uploadError = getErrorMessage(error, 'The document could not be uploaded.');
          this.cd.detectChanges();
        },
      });
  }

  cancelClaim(): void {
    if (!confirm('Cancel this claim? This cannot be undone.')) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.claimService.cancelClaim(this.claimId).subscribe({
      next: (response: any) => {
        this.successMessage = response?.message ?? 'Claim cancelled successfully.';
        this.loadAll();
      },
      error: (error: any) => {
        console.error('Unable to cancel the claim:', error);
        this.errorMessage = getErrorMessage(error, 'The claim could not be cancelled.');
        this.cd.detectChanges();
      },
    });
  }

  trackByHistoryId(index: number, item: ClaimHistoryItem): number {
    return item.history_id;
  }

  trackByDocumentId(index: number, item: ClaimDocumentItem): number {
    return item.document_id;
  }
}