import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ClaimItem } from '../../../claim-service';
import { AssessmentItem, ClaimProcessService } from '../../../claim-process-service';
import { getErrorMessage, unwrapData } from '../../../claim-helpers';

@Component({
  selector: 'app-admin-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-assessment.html',
  styleUrl: './admin-assessment.scss',
})
export class AdminAssessment implements OnInit {
  private service = inject(ClaimProcessService);
  private cd = inject(ChangeDetectorRef);

  @Input() claim!: ClaimItem;
  @Output() changed = new EventEmitter<void>();

  assessment: AssessmentItem | null = null;
  loading = true;
  busy = false;
  errorMessage = '';
  successMessage = '';

  assessedAmount: number | null = null;
  deductible: number | null = 0;
  depreciation: number | null = 0;
  nonPayable: number | null = 0;

  ngOnInit(): void {
    this.assessedAmount = this.claim.estimated_loss;   // a starting value, the admin can change it

    this.service
      .getAssessment(this.claim.claim_id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.assessment = unwrapData(response) ?? null;

          if (this.assessment) {
            this.assessedAmount = this.assessment.assessed_amount;
            this.deductible = this.assessment.deductible;
            this.depreciation = this.assessment.depreciation;
            this.nonPayable = this.assessment.non_payable;
          }
        },
        error: () => {
          this.assessment = null;   // a 404 only means that it is not assessed yet
        },
      });
  }

  // BRD formula: Claim Amount - Deductible - Depreciation - Non Payable = Net Payable
  get netPayable(): number {
    return (this.assessedAmount ?? 0) - (this.deductible ?? 0) - (this.depreciation ?? 0) - (this.nonPayable ?? 0);
  }

  // the same rule as the API: only while the claim is being processed
  get canSave(): boolean {
    return ['Pending Verification', 'Under Survey', 'Under Investigation'].includes(this.claim.claim_status);
  }

  private fail(message: string): void {
    this.successMessage = '';
    this.errorMessage = message;
    this.cd.detectChanges();
  }

  save(): void {
    if (!this.assessedAmount || this.assessedAmount <= 0) {
      this.fail('Assessed amount must be greater than 0.');
      return;
    }

    if ((this.deductible ?? 0) < 0 || (this.depreciation ?? 0) < 0 || (this.nonPayable ?? 0) < 0) {
      this.fail('Deductible, depreciation and non-payable cannot be negative.');
      return;
    }

    if (this.netPayable <= 0) {
      this.fail('Net payable amount must be greater than 0.');
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.busy = true;
    this.cd.detectChanges();

    this.service
      .saveAssessment(this.claim.claim_id, {
        assessed_amount: this.assessedAmount,
        deductible: this.deductible ?? 0,
        depreciation: this.depreciation ?? 0,
        non_payable: this.nonPayable ?? 0,
      })
      .pipe(
        finalize(() => {
          this.busy = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.assessment = unwrapData(response) ?? null;
          this.successMessage = 'Assessment saved.';
          this.changed.emit();
          this.cd.detectChanges();
        },
        error: (error: any) => {
          this.errorMessage = getErrorMessage(error, 'The assessment could not be saved.');
          this.cd.detectChanges();
        },
      });
  }
}