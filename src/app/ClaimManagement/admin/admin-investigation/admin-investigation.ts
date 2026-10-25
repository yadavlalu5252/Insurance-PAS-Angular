import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ClaimItem } from '../../../claim-service';
import { ClaimProcessService, EvidenceItem, InvestigationRecord, checkFile } from '../../../claim-process-service';
import { getErrorMessage, unwrapList } from '../../../claim-helpers';

@Component({
  selector: 'app-admin-investigation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-investigation.html',
  styleUrl: './admin-investigation.scss',
})
export class AdminInvestigation implements OnInit {
  private service = inject(ClaimProcessService);
  private cd = inject(ChangeDetectorRef);

  @Input() claim!: ClaimItem;
  @Input() canStart = false;            // decided by the claim page
  @Output() changed = new EventEmitter<void>();

  recommendations = ['Genuine', 'Fraud'];

  investigation: InvestigationRecord | null = null;
  evidence: EvidenceItem[] = [];

  loading = true;
  busy = '';
  errorMessage = '';
  successMessage = '';

  // start
  investigatorId: number | null = null;
  reason = '';

  // evidence
  evidenceDescription = '';
  evidenceFile: File | null = null;

  // report
  findings = '';
  recommendation = '';
  reportFile: File | null = null;

  ngOnInit(): void {
    this.load();
  }

  get isPending(): boolean {
    return this.investigation?.investigation_status === 'Pending';
  }

  load(): void {
    this.service
      .getInvestigationByClaim(this.claim.claim_id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.investigation = response?.data?.items?.[0] ?? null;

          if (this.investigation) {
            this.loadEvidence();
          }
        },
        error: (error: any) => {
          this.investigation = null;
          this.errorMessage = getErrorMessage(error, 'The investigation could not be loaded.');
        },
      });
  }

  private loadEvidence(): void {
    this.service.getEvidence(this.investigation!.investigation_id).subscribe({
      next: (response: any) => {
        this.evidence = unwrapList(response);
        this.cd.detectChanges();
      },
      error: () => {
        this.evidence = [];
        this.cd.detectChanges();
      },
    });
  }

  private fail(message: string): void {
    this.successMessage = '';
    this.errorMessage = message;
    this.cd.detectChanges();
  }

  // runs one call, shows the result, then reloads this panel and tells the claim page
  private run(request: any, busyName: string, successText: string, afterSuccess?: () => void): void {
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
          afterSuccess?.();
          this.load();
          this.changed.emit();
        },
        error: (error: any) => {
          this.errorMessage = getErrorMessage(error, 'The action could not be completed.');
          this.cd.detectChanges();
        },
      });
  }

  start(): void {
    if (!this.investigatorId || this.investigatorId < 1) {
      this.fail('Enter a valid investigator id.');
      return;
    }

    if (!this.reason.trim()) {
      this.fail('Enter the reason for the investigation.');
      return;
    }

    this.run(
      this.service.createInvestigation(this.claim.claim_id, this.investigatorId, this.reason.trim()),
      'start',
      'Investigation started. The claim is now Under Investigation.',
      () => {
        this.investigatorId = null;
        this.reason = '';
      },
    );
  }

  onEvidenceFile(event: Event): void {
    this.evidenceFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  addEvidence(fileInput: HTMLInputElement): void {
    if (!this.evidenceDescription.trim() || this.evidenceDescription.length > 500) {
      this.fail('Enter a description (maximum 500 characters).');
      return;
    }

    const problem = checkFile(this.evidenceFile);
    if (problem) {
      this.fail(problem);
      return;
    }

    this.run(
      this.service.addEvidence(this.investigation!.investigation_id, this.evidenceDescription.trim(), this.evidenceFile!),
      'evidence',
      'Evidence added.',
      () => {
        this.evidenceDescription = '';
        this.evidenceFile = null;
        fileInput.value = '';
      },
    );
  }

  onReportFile(event: Event): void {
    this.reportFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  submitReport(fileInput: HTMLInputElement): void {
    if (!this.findings.trim()) {
      this.fail('Enter the findings.');
      return;
    }

    if (!this.recommendations.includes(this.recommendation)) {
      this.fail('Choose a recommendation: Genuine or Fraud.');
      return;
    }

    const problem = checkFile(this.reportFile);
    if (problem) {
      this.fail(problem);
      return;
    }

    this.run(
      this.service.submitInvestigationReport(
        this.investigation!.investigation_id,
        this.findings.trim(),
        this.recommendation,
        this.reportFile!,
      ),
      'report',
      'Investigation report submitted.',
      () => {
        this.findings = '';
        this.recommendation = '';
        this.reportFile = null;
        fileInput.value = '';
      },
    );
  }
}