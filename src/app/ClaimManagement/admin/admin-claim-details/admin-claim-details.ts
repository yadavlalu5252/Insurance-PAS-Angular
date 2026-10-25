import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ClaimService, ClaimDocumentItem } from '../../../claim-service';
import { ClaimProcessService } from '../../../claim-process-service';
import {
  getErrorMessage, getStatusBadge, getTodayString, isAllowedFile, unwrapData, unwrapList
} from '../../../claim-helpers';
import { AdminAssessment } from '../admin-assessment/admin-assessment';
import { AdminInvestigation } from '../admin-investigation/admin-investigation';
import { AdminSettlement } from '../admin-settlement/admin-settlement';

@Component({
  selector: 'app-admin-claim-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminAssessment, AdminInvestigation, AdminSettlement],
  templateUrl: './admin-claim-details.html',
  styleUrl: './admin-claim-details.scss',
})
export class AdminClaimDetails implements OnInit {
  private claimService = inject(ClaimService);
  private processService = inject(ClaimProcessService);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  today = getTodayString();

  steps = ['Registered', 'In Review', 'Approved', 'Settled'];

  tabs = [
    { key: 'overview', label: 'Overview', icon: 'bi-info-circle' },
    { key: 'documents', label: 'Documents', icon: 'bi-file-earmark-text' },
    { key: 'survey', label: 'Survey', icon: 'bi-clipboard-check' },
    { key: 'assessment', label: 'Assessment', icon: 'bi-calculator' },
    { key: 'investigation', label: 'Investigation', icon: 'bi-search' },
    { key: 'settlement', label: 'Settlement', icon: 'bi-cash-coin' },
  ];
  activeTab = 'overview';

  claimId = 0;

  // loose types, so the template compiles whatever fields your claim interfaces have
  claim: any = null;
  history: any[] = [];
  documents: any[] = [];
  survey: any = null;

  loading = false;
  errorMessage = '';
  successMessage = '';
  busy = '';

  // survey
  surveyorId: number | null = null;
  inspectionDate = getTodayString();
  surveyFile: File | null = null;

  // decision
  panel: '' | 'approve' | 'reject' = '';
  approveRemarks = '';
  rejectReason = '';
  rejectFraud = false;

  ngOnInit(): void {
    this.claimId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  // ---------- loading ----------

  loadAll(): void {
    // the spinner shows only the first time, so the tabs keep what the admin typed
    this.loading = !this.claim;
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
  }

  // ---------- which actions are allowed (the same rules as the API) ----------

  private status(): string {
    return this.claim?.claim_status ?? '';
  }

  isFinal(): boolean {
    return ['Approved', 'Rejected', 'Settled', 'Cancelled'].includes(this.status());
  }

  isClosed(): boolean {
    return ['Rejected', 'Cancelled'].includes(this.status());
  }

  canVerifyDocuments(): boolean {
    return !!this.claim && !this.isFinal();
  }

  canAssignSurvey(): boolean {
    return this.status() === 'Pending Verification' && !this.survey;
  }

  canSubmitSurveyReport(): boolean {
    return this.status() === 'Under Survey' && this.survey?.survey_status === 'Assigned';
  }

  // an open survey must be finished first
  canAssignInvestigation(): boolean {
    return this.status() === 'Pending Verification' ||
      (this.status() === 'Under Survey' && this.survey?.survey_status === 'Completed');
  }

  canDecide(): boolean {
    return ['Pending Verification', 'Under Survey', 'Under Investigation'].includes(this.status());
  }

  canCancel(): boolean {
    return ['Registered', 'Pending Verification'].includes(this.status());
  }

  // ---------- the stepper ----------

  stepIndex(): number {
    switch (this.status()) {
      case 'Registered': return 0;
      case 'Pending Verification':
      case 'Under Survey':
      case 'Under Investigation': return 1;
      case 'Approved': return 2;
      case 'Settled': return 3;
      default: return -1;
    }
  }

  stepClass(i: number): string {
    const current = this.stepIndex();
    if (current === 3 || i < current) return 'done';
    return i === current ? 'current' : '';
  }

  // ---------- actions ----------

  // runs one API call, shows the result and reloads the page data
  private runAction(request: Observable<any>, busyName: string, successText: string, onSuccess?: () => void): void {
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
          onSuccess?.();
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

  docBadge(status: string): string {
    if (status === 'Verified') return 'bg-success';
    if (status === 'Rejected') return 'bg-danger';
    return 'bg-warning text-dark';
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
      () => (this.surveyorId = null),
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
      () => (this.surveyFile = null),
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
      () => {
        this.panel = '';
        this.approveRemarks = '';
      },
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

    // is_fraud is what triggers the BRD rule: an investigation report is needed first
    this.runAction(
      this.processService.rejectClaim(this.claimId, this.rejectReason.trim(), this.rejectFraud),
      'reject',
      'Claim rejected.',
      () => {
        this.panel = '';
        this.rejectReason = '';
        this.rejectFraud = false;
      },
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
    const text = (action ?? '').toLowerCase();

    if (text.includes('settled')) return 'bi-cash-coin';
    if (text.includes('approved')) return 'bi-check-circle';
    if (text.includes('rejected')) return 'bi-x-circle';
    if (text.includes('cancel')) return 'bi-slash-circle';
    if (text.includes('document')) return 'bi-file-earmark-text';
    if (text.includes('survey')) return 'bi-clipboard-check';
    if (text.includes('investigation')) return 'bi-search';
    if (text.includes('assess')) return 'bi-calculator';

    return 'bi-dot';
  }

  getStatusBadge(status: string): string {
    return getStatusBadge(status);
  }
}