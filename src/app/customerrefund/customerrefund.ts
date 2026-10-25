import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RefundService } from '../service/refundservice';

@Component({
  selector: 'app-customerrefund',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customerrefund.html',
  styleUrl: './customerrefund.scss'
})
export class Customerrefund {

  refundAmount: number | null = null;
  refundDetails: any = null;

  loading = false;
  successMessage = '';
  errorMessage = '';
  showRefundStatus = false;

  private selectedPaymentId: number | null = null;
  private refundId: number | null = null;

  constructor(private refundService: RefundService) {
    const paymentId = sessionStorage.getItem('selectedPaymentId');
    const savedRefundId = sessionStorage.getItem('latestRefundId');

    this.selectedPaymentId =
      paymentId && Number(paymentId) > 0 ? Number(paymentId) : null;

    this.refundId =
      savedRefundId && Number(savedRefundId) > 0
        ? Number(savedRefundId)
        : null;
  }

  requestRefund(): void {
    this.clearMessages();

    if (!this.selectedPaymentId) {
      this.errorMessage =
        'Please select a payment from your payment history before requesting a refund.';
      return;
    }

    if (
      this.refundAmount === null ||
      !Number.isFinite(this.refundAmount) ||
      this.refundAmount <= 0
    ) {
      this.errorMessage = 'Enter a valid refund amount.';
      return;
    }

    this.loading = true;
    this.showRefundStatus = false;
    this.refundDetails = null;

    this.refundService.createRefund({
      payment_id: this.selectedPaymentId,
      refund_amount: this.refundAmount
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (response: any) => {
        const returnedRefundId =
          response?.refund_id ?? response?.refundId;

        if (returnedRefundId != null && Number(returnedRefundId) > 0) {
          this.refundId = Number(returnedRefundId);
          sessionStorage.setItem(
            'latestRefundId',
            String(this.refundId)
          );
        }

        this.successMessage =
          'Refund request submitted successfully. Use View Status to check the result.';

        this.refundAmount = null;

        if (!this.refundId) {
          this.errorMessage =
            'The request was submitted, but the response did not include a refund ID. Check the API response before checking its status.';
        }
      },
      error: (error: any) => {
        this.errorMessage =
          error?.error?.message ||
          'Unable to submit the refund request.';
      }
    });
  }

  viewStatus(): void {
    this.clearMessages();

    if (!this.refundId) {
      this.errorMessage =
        'Submit a refund request first. Its refund ID was not found.';
      return;
    }

    this.loading = true;
    this.showRefundStatus = false;
    this.refundDetails = null;

    this.refundService.getRefund(this.refundId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          this.refundDetails = response;
          this.showRefundStatus = true;
        },
        error: (error: any) => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to retrieve refund status.';
        }
      });
  }

  getStatusLabel(value: any): string {
    if (typeof value === 'string') {
      return value;
    }

    // Assumes the backend enum is:
    // 0 = Pending, 1 = Approved, 2 = Rejected.
    // Adjust these values if your C# enum differs.
    switch (Number(value)) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Status unavailable';
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}