import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  ClaimService, ClaimItem, ClaimHistoryItem, ClaimDocumentItem, SurveyItem, InvestigationItem, SettlementItem
} from '../../../claim-service';
import {
  PAYMENT_MODES, getErrorMessage, getStatusBadge, getTodayString, isAllowedFile, unwrapData, unwrapList
} from '../../../claim-helpers';

@Component({
  selector: 'app-admin-claim-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-claim-details.html',
  styleUrl: './admin-claim-details.scss',
})
export class AdminClaimDetails implements OnInit {
  private claimService = inject(ClaimService);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  paymentModes = PAYMENT_MODES;
  today = getTodayString();

  claimId = 0;
  claim: ClaimItem | null = null;
  history: ClaimHistoryItem[] = [];
  documents: ClaimDocumentItem[] = [];
  survey: SurveyItem | null = null;
  investigation: InvestigationItem | null = null;
  settlement: SettlementItem | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';
  busy = '';

  // survey
  surveyorId: number | null = null;
  inspectionDate = getTodayString();
  surveyFile: File | null = null;

  // investigation
  investigatorId: number | null = null;
  investigationReason = '';
  investigationFile: File | null = null;

  // decision
  approveRemarks = '';
  rejectReason = '';

  // settlement
  settleAmount: number | null = null;
  settleMode = '';
  settleReference = '';

  ngOnInit(): void {
    this.claimId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  // ---------- loading ----------

  loadAll(): void {
    this.loading = true;
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

          if (this.settleAmount === null) {
            this.settleAmount = this.claim?.estimated_loss ?? null;
          }

          this.loadSettlement();
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

    // a 404 only means that none exists yet
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

    this.claimService.getInvestigation(this.claimId).subscribe({
      next: (response: any) => {
        this.investigation = unwrapData(response) ?? null;
        this.cd.detectChanges();
      },
      error: () => {
        this.investigation = null;
        this.cd.detectChanges();
      },
    });
  }

  private loadSettlement(): void {
    const status = this.claim?.claim_status;

    if (status !== 'Approved' && status !== 'Settled') {
      this.settlement = null;
      return;
    }

    this.claimService.getSettlement(this.claimId).subscribe({
      next: (response: any) => {
        this.settlement = unwrapData(response) ?? null;
        this.cd.detectChanges();
      },
      error: () => {
        this.settlement = null;
        this.cd.detectChanges();
      },
    });
  }

  // ---------- which actions are allowed (the same rules as the API) ----------

  private status(): string {
    return this.claim?.claim_status ?? '';
  }

  isFinal(): boolean {
    return ['Approved', 'Rejected', 'Settled', 'Cancelled'].includes(this.status());
  }

  canVerifyDocuments(): boolean {
    return !!this.claim && !this.isFinal();
  }

  canAssignSurvey(): boolean {
    return this.status() === 'Pending Verification';
  }

  canSubmitSurveyReport(): boolean {
    return this.status() === 'Under Survey' && this.survey?.survey_status === 'Assigned';
  }

  // an open survey must be finished first, otherwise its report could not be submitted any more
  canAssignInvestigation(): boolean {
    return this.status() === 'Pending Verification' ||
      (this.status() === 'Under Survey' && this.survey?.survey_status === 'Completed');
  }

  canSubmitInvestigationReport(): boolean {
    return this.status() === 'Under Investigation' && this.investigation?.investigation_status === 'Pending';
  }

  canDecide(): boolean {
    return ['Pending Verification', 'Under Survey', 'Under Investigation'].includes(this.status());
  }

  canSettle(): boolean {
    return this.status() === 'Approved' && !this.settlement;
  }

  canCancel(): boolean {
    return ['Registered', 'Pending Verification'].includes(this.status());
  }

  // ---------- actions ----------

  // runs one API call, shows the result and reloads the page data
  private runAction(request: Observable<any>, busyName: string, successText: string): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.busy = busyName;
    this.cd.detectChanges();

    request
      .pipe(
        finalize(() => {
          this.busy = '';
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = successText;
          this.loadAll();
        },
        error: (error: any) => {
          console.error('Action failed:', error);
          this.errorMessage = getErrorMessage(error, 'The action could not be completed.');
          this.cd.detectChanges();
        },
      });
  }

  private fail(message: string): void {
    this.successMessage = '';
    this.errorMessage = message;
    this.cd.detectChanges();
  }

  verifyDocument(document: ClaimDocumentItem, status: string): void {
    let remarks = 'Verified';

    if (status === 'Rejected') {
      const reason = prompt(`Reason for rejecting "${document.document_name}":`);

      if (!reason || !reason.trim()) {
        return;
      }

      remarks = reason.trim();
    }

    this.runAction(
      this.claimService.verifyDocument(this.claimId, {
        document_id: document.document_id,
        verification_status: status,
        remarks,
      }),
      'doc-' + document.document_id,
      `Document ${status.toLowerCase()}.`,
    );
  }

  assignSurvey(): void {
    if (!this.surveyorId || this.surveyorId < 1) {
      this.fail('Enter a valid surveyor id.');
      return;
    }

    this.runAction(
      this.claimService.assignSurveyor(this.claimId, this.surveyorId),
      'survey',
      'Surveyor assigned. The claim is now Under Survey.',
    );
  }

  onSurveyFileSelected(event: Event): void {
    this.surveyFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  submitSurveyReport(): void {
    if (!this.survey) {
      return;
    }

    if (!this.inspectionDate || this.inspectionDate > this.today) {
      this.fail('Choose an inspection date that is not in the future.');
      return;
    }

    if (!this.surveyFile) {
      this.fail('Choose the survey report file.');
      return;
    }

    if (!isAllowedFile(this.surveyFile)) {
      this.fail('Only pdf, jpg, jpeg and png files are allowed.');
      return;
    }

    this.runAction(
      this.claimService.submitSurveyReport(this.survey.survey_id, this.inspectionDate, this.surveyFile),
      'survey-report',
      'Survey report submitted.',
    );
  }

  assignInvestigation(): void {
    if (!this.investigatorId || this.investigatorId < 1) {
      this.fail('Enter a valid investigator id.');
      return;
    }

    if (!this.investigationReason.trim()) {
      this.fail('Enter the reason for the investigation.');
      return;
    }

    this.runAction(
      this.claimService.assignInvestigator(this.claimId, this.investigatorId, this.investigationReason.trim()),
      'investigation',
      'Investigator assigned. The claim is now Under Investigation.',
    );
  }

  onInvestigationFileSelected(event: Event): void {
    this.investigationFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  submitInvestigationReport(): void {
    if (!this.investigation) {
      return;
    }

    if (!this.investigationFile) {
      this.fail('Choose the investigation report file.');
      return;
    }

    if (!isAllowedFile(this.investigationFile)) {
      this.fail('Only pdf, jpg, jpeg and png files are allowed.');
      return;
    }

    this.runAction(
      this.claimService.submitInvestigationReport(this.investigation.investigation_id, this.investigationFile),
      'investigation-report',
      'Investigation report submitted.',
    );
  }

  approveClaim(): void {
    if (!confirm('Approve this claim?')) {
      return;
    }

    this.runAction(
      this.claimService.approveClaim(this.claimId, this.approveRemarks.trim()),
      'approve',
      'Claim approved.',
    );
  }

  rejectClaim(): void {
    if (!this.rejectReason.trim()) {
      this.fail('Enter a reason to reject the claim.');
      return;
    }

    if (!confirm('Reject this claim? This cannot be undone.')) {
      return;
    }

    this.runAction(
      this.claimService.rejectClaim(this.claimId, this.rejectReason.trim()),
      'reject',
      'Claim rejected.',
    );
  }

  processSettlement(): void {
    if (!this.settleAmount || this.settleAmount <= 0) {
      this.fail('Enter the settlement amount.');
      return;
    }

    if (!this.settleMode) {
      this.fail('Choose a payment mode.');
      return;
    }

    this.runAction(
      this.claimService.processSettlement(this.claimId, {
        approved_amount: this.settleAmount,
        payment_mode: this.settleMode,
        transaction_reference: this.settleReference.trim(),
      }),
      'settlement',
      'Settlement recorded.',
    );
  }

  cancelClaim(): void {
    if (!confirm('Cancel this claim? This cannot be undone.')) {
      return;
    }

    this.runAction(this.claimService.cancelClaim(this.claimId), 'cancel', 'Claim cancelled.');
  }

  // ---------- helpers for the template ----------

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

  trackByHistoryId(index: number, item: ClaimHistoryItem): number {
    return item.history_id;
  }

  trackByDocumentId(index: number, item: ClaimDocumentItem): number {
    return item.document_id;
  }
}