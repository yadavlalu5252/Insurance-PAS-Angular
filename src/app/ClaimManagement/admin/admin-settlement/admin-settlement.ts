import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ClaimItem } from '../../../claim-service';
import { AdviceItem, AssessmentItem, ClaimProcessService, SettlementRecord } from '../../../claim-process-service';
import { getErrorMessage, unwrapData } from '../../../claim-helpers';

@Component({
  selector: 'app-admin-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settlement.html',
  styleUrl: './admin-settlement.scss',
})
export class AdminSettlement implements OnInit {
  private service = inject(ClaimProcessService);
  private cd = inject(ChangeDetectorRef);

  @Input() claim!: ClaimItem;
  @Output() changed = new EventEmitter<void>();

  // from the BRD. The spelling must match the API exactly.
  paymentModes = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'];

  settlement: SettlementRecord | null = null;
  assessment: AssessmentItem | null = null;
  advice: AdviceItem | null = null;

  loading = true;
  busy = false;
  errorMessage = '';
  successMessage = '';

  paymentMode = '';
  reference = '';
  holder = '';
  accountNumber = '';
  ifsc = '';
  bankVerified = false;

  ngOnInit(): void {
    this.load();
  }

  // the same rules as the API: only for an approved claim, and only once
  get canProcess(): boolean {
    return this.claim.claim_status === 'Approved' && !this.settlement;
  }

  load(): void {
    this.service
      .getSettlement(this.claim.claim_id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.settlement = unwrapData(response) ?? null;
        },
        error: () => {
          this.settlement = null;   // a 404 only means that it is not settled yet
        },
      });

    // the amount that will be recorded comes from the assessment
    this.service.getAssessment(this.claim.claim_id).subscribe({
      next: (response: any) => {
        this.assessment = unwrapData(response) ?? null;
        this.cd.detectChanges();
      },
      error: () => {
        this.assessment = null;
        this.cd.detectChanges();
      },
    });
  }

  private fail(message: string): void {
    this.successMessage = '';
    this.errorMessage = message;
    this.cd.detectChanges();
  }

  process(): void {
    const ifsc = this.ifsc.trim().toUpperCase();

    if (!this.paymentModes.includes(this.paymentMode)) {
      this.fail('Choose a payment mode.');
      return;
    }

    if (!this.reference.trim() || this.reference.length > 100) {
      this.fail('Enter the transaction reference (maximum 100 characters).');
      return;
    }

    if (!this.holder.trim() || this.holder.length > 150) {
      this.fail('Enter the account holder name (maximum 150 characters).');
      return;
    }

    if (!/^\d{9,18}$/.test(this.accountNumber.trim())) {
      this.fail('Account number must be 9 to 18 digits.');
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      this.fail('IFSC code is invalid (for example HDFC0001234).');
      return;
    }

    if (!this.bankVerified) {
      this.fail('Confirm that the bank account was verified.');
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.busy = true;
    this.cd.detectChanges();

    this.service
      .processSettlement(this.claim.claim_id, {
        payment_mode: this.paymentMode,
        transaction_reference: this.reference.trim(),
        account_holder_name: this.holder.trim(),
        account_number: this.accountNumber.trim(),
        ifsc_code: ifsc,
        bank_verified: true,
      })
      .pipe(
        finalize(() => {
          this.busy = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Settlement recorded. The claim is now Settled.';

          // do not keep the bank details on the screen
          this.paymentMode = '';
          this.reference = '';
          this.holder = '';
          this.accountNumber = '';
          this.ifsc = '';
          this.bankVerified = false;

          this.load();
          this.changed.emit();
        },
        error: (error: any) => {
          this.errorMessage = getErrorMessage(error, 'The settlement could not be recorded.');
          this.cd.detectChanges();
        },
      });
  }

  showAdvice(): void {
    this.errorMessage = '';

    this.service.getAdvice(this.claim.claim_id).subscribe({
      next: (response: any) => {
        this.advice = unwrapData(response) ?? null;
        this.cd.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = getErrorMessage(error, 'The settlement advice could not be loaded.');
        this.cd.detectChanges();
      },
    });
  }
}