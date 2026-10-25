import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PremiumScheduleService } from '../service/premiumschedule';

@Component({
  selector: 'app-customerpremiumschedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './customerpremiumschedule.html',
  styleUrl: './customerpremiumschedule.scss'
})
export class Customerpremiumschedule implements OnInit {

  schedules: any[] = [];

  policyId: number | null = null;

  loadingSchedule = false;
  processingPayment = false;

  successMessage = '';
  errorMessage = '';

  selectedSchedule: any = null;

  paymentAmount: number | null = null;

  constructor(
    private premiumScheduleService: PremiumScheduleService
  ) {}

  ngOnInit(): void {

    this.policyId = this.getLoggedInPolicyId();

    if (!this.policyId) {
      this.errorMessage =
        'Your Policy ID could not be found. Please ensure your login flow provides your Policy ID or connect a customer-policy API.';
    }
  }

  // ==================================================
  // GET POLICY ID FROM LOGIN SESSION OR JWT
  // ==================================================

  private getLoggedInPolicyId(): number | null {

    const storedPolicyId =
      localStorage.getItem('policy_id') ||
      sessionStorage.getItem('policy_id');

    if (
      storedPolicyId &&
      Number.isInteger(Number(storedPolicyId)) &&
      Number(storedPolicyId) > 0
    ) {
      return Number(storedPolicyId);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {

      const tokenParts = token.split('.');

      if (tokenParts.length !== 3) {
        return null;
      }

      const base64Payload = tokenParts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const paddedPayload =
        base64Payload.padEnd(
          Math.ceil(base64Payload.length / 4) * 4,
          '='
        );

      const payload = JSON.parse(atob(paddedPayload));

      const claim =
        payload['policy_id'] ??
        payload['policyId'] ??
        payload['PolicyId'];

      if (
        claim !== undefined &&
        Number.isInteger(Number(claim)) &&
        Number(claim) > 0
      ) {
        return Number(claim);
      }

      return null;

    } catch (error) {

      console.error('Unable to read Policy ID:', error);

      return null;
    }
  }

  // ==================================================
  // VIEW CUSTOMER PREMIUM SCHEDULE
  // ==================================================

  getSchedule(clearExistingMessages = true): void {

    if (clearExistingMessages) {
      this.clearMessages();
    }

    if (!this.policyId || this.policyId <= 0) {

      this.errorMessage =
        'A valid Policy ID is required.';

      return;
    }

    this.loadingSchedule = true;

    this.premiumScheduleService
      .getPremiumScheduleByPolicyId(this.policyId)
      .pipe(
        finalize(() => {
          this.loadingSchedule = false;
        })
      )
      .subscribe({

        next: (response: any) => {

          console.log('Premium Schedule Response:', response);

          if (response?.success === true) {

            this.schedules = response.data || [];

            if (this.schedules.length === 0) {

              this.errorMessage =
                'No premium schedule found for your policy.';

              return;
            }

            if (clearExistingMessages) {
              this.successMessage =
                response.message ||
                'Premium schedule loaded successfully.';
            }

          } else {

            this.schedules = [];

            this.errorMessage =
              response?.message ||
              'Unable to get premium schedule.';
          }
        },

        error: (error: any) => {

          console.error('Premium Schedule Error:', error);

          this.schedules = [];

          this.errorMessage =
            error?.error?.message ||
            'Unable to get premium schedule.';
        }
      });
  }

  // ==================================================
  // SELECT INSTALLMENT AND OPEN PAYMENT MODAL
  // ==================================================

  selectPaymentSchedule(schedule: any): void {

    this.clearMessages();

    if (!this.canPay(schedule)) {

      this.errorMessage =
        'This installment cannot be paid.';

      return;
    }

    this.selectedSchedule = {
      ...schedule
    };

    const premiumAmount =
      Number(schedule.premium_amount || 0);

    const lateFee =
      Number(schedule.late_fee || 0);

    // Total = Premium Amount + Late Fee
    this.paymentAmount =
      Math.round((premiumAmount + lateFee) * 100) / 100;
  }

  // ==================================================
  // CLOSE PAYMENT MODAL
  // ==================================================

  cancelPayment(): void {

    this.selectedSchedule = null;

    this.paymentAmount = null;
  }

  // ==================================================
  // PAY PREMIUM
  // ==================================================

  // ==================================================
// PAY PREMIUM
// ==================================================

payPremium(): void {

  this.clearMessages();

  if (!this.selectedSchedule) {
    this.errorMessage = 'Please select an installment.';
    return;
  }

  if (
    this.paymentAmount === null ||
    this.paymentAmount <= 0
  ) {
    this.errorMessage = 'Invalid payment amount.';
    return;
  }

  const dto = {
    amount_paid: this.paymentAmount
  };

  this.processingPayment = true;

  this.premiumScheduleService
    .updateScheduleAfterPayment(
      this.selectedSchedule.schedule_id,
      dto
    )
    .pipe(
      finalize(() => {
        this.processingPayment = false;
      })
    )
    .subscribe({

      next: (response: any) => {

        console.log('Payment Response:', response);

        // Treat an explicit business failure as a failure.
        // A successful HTTP response without a wrapper is also accepted.
        if (response?.success === false) {

          this.errorMessage =
            response?.message ||
            'Unable to process payment.';

          return;
        }

        // Display success message
        this.successMessage =
          response?.message ||
          'Payment successful! Your premium schedule has been updated.';

        this.errorMessage = '';

        // Close the payment modal
        this.cancelPayment();

        // Reload schedule without clearing the success message
        this.getSchedule(false);
      },

      error: (error: any) => {

        console.error('Payment Error:', error);

        this.errorMessage =
          error?.error?.message ||
          'Payment failed. Please try again.';

        this.successMessage = '';
      }
    });
}

  // ==================================================
  // CLEAR PAGE
  // ==================================================

  clearSchedule(): void {

    this.schedules = [];

    this.selectedSchedule = null;

    this.paymentAmount = null;

    this.clearMessages();
  }

  // ==================================================
  // CLEAR MESSAGES
  // ==================================================

  clearMessages(): void {

    this.successMessage = '';

    this.errorMessage = '';
  }

  // ==================================================
  // STATUS CLASS
  // ==================================================

  getStatusClass(status: string): string {

    switch (status?.toLowerCase()) {

      case 'paid':
        return 'paid';

      case 'partial paid':
        return 'partial';

      case 'overdue':
        return 'overdue';

      case 'cancelled':
        return 'cancelled';

      default:
        return 'pending';
    }
  }

  // ==================================================
  // CHECK PAYMENT ELIGIBILITY
  // ==================================================

  canPay(schedule: any): boolean {

    const status =
      schedule.status?.toLowerCase();

    return status !== 'paid' &&
           status !== 'cancelled';
  }
}