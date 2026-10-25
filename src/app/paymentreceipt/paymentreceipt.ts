import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PremiumPaymentService } from '../service/premiumspaymentservice';

@Component({
  selector: 'app-paymentreceipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paymentreceipt.html',
  styleUrl: './paymentreceipt.scss'
})
export class Paymentreceipt implements OnInit {

  payments: any[] = [];
  policyId: number | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  downloadingPaymentId: number | null = null;
  regeneratingPaymentId: number | null = null;

  constructor(
    private paymentService: PremiumPaymentService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
  this.errorMessage = '';
  this.successMessage = '';

  const id = this.getLoggedInPolicyId();

  if (!id) {
    this.payments = [];
    this.loading = false;
    this.errorMessage = 'Policy ID was not found.';
    return;
  }

  this.policyId = id;
  this.loading = true;

  this.paymentService.getPaymentHistory(id).subscribe({
    next: (response: any) => {
      // Stop the spinner before processing the response.
      this.loading = false;

      console.log('Payment history response:', response);

      try {
        this.payments = this.extractPayments(response);
        console.log('Extracted payments:', this.payments);

        if (this.payments.length === 0) {
          console.warn(
            'The API returned 200 OK, but no payment records were extracted.'
          );
        }
      } catch (error) {
        console.error('Error processing payment history:', error);
        this.payments = [];
        this.errorMessage = 'Unable to process the payment history response.';
      }
    },

    error: (error: any) => {
      this.loading = false;
      this.payments = [];

      console.error('Payment history request failed:', error);

      this.errorMessage =
        error?.error?.message ||
        error?.error?.title ||
        `Unable to load payment history. HTTP status: ${error?.status ?? 'Unknown'}.`;
    },

    complete: () => {
      this.loading = false;
    }
  });
}

  // Read policy_id from storage or from the JWT.
  private getLoggedInPolicyId(): number | null {
    const storedPolicyId =
      localStorage.getItem('policy_id') ||
      sessionStorage.getItem('policy_id');

    if (storedPolicyId) {
      const parsedId = Number(storedPolicyId);

      if (Number.isInteger(parsedId) && parsedId > 0) {
        return parsedId;
      }
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      const payloadPart = token.split('.')[1];

      if (!payloadPart) {
        return null;
      }

      const base64 = payloadPart
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload = JSON.parse(atob(base64));

      const claimNames = [
        'policy_id',
        'policyId',
        'PolicyId',
        'policyID'
      ];

      for (const claimName of claimNames) {
        const value = Number(payload[claimName]);

        if (Number.isInteger(value) && value > 0) {
          return value;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  // Support common API response formats.
  private extractPayments(response: any): any[] {
    const candidates = [
      response,
      response?.data,
      response?.Data,
      response?.payments,
      response?.Payments,
      response?.items,
      response?.Items,
      response?.result,
      response?.Result,
      response?.data?.data,
      response?.data?.items
    ];

    return candidates.find((item) => Array.isArray(item)) || [];
  }

  getPaymentId(payment: any): number {
    return Number(
      payment?.payment_id ??
      payment?.PaymentId ??
      payment?.paymentId ??
      payment?.id ??
      0
    );
  }

  getPolicyId(payment: any): number {
    return Number(
      payment?.policy_id ??
      payment?.PolicyId ??
      payment?.policyId ??
      this.policyId ??
      0
    );
  }

  getAmount(payment: any): number {
    return Number(
      payment?.amount_paid ??
      payment?.AmountPaid ??
      payment?.amountPaid ??
      0
    );
  }

  getPaymentDate(payment: any): any {
    return (
      payment?.payment_date ??
      payment?.PaymentDate ??
      payment?.paymentDate ??
      null
    );
  }

  getPaymentStatus(payment: any): string {
    const status =
      payment?.payment_status ??
      payment?.PaymentStatus ??
      payment?.paymentStatus;

    if (status === null || status === undefined || status === '') {
      return 'Unknown';
    }

    // Align these numeric values with your backend PaymentStatus enum.
    const numericStatuses: Record<number, string> = {
      0: 'Initiated',
      1: 'Success',
      2: 'Failed',
      3: 'Pending',
      4: 'Refunded',
      5: 'Cancelled'
    };

    if (
      typeof status === 'number' ||
      (typeof status === 'string' && /^\d+$/.test(status.trim()))
    ) {
      return numericStatuses[Number(status)] ?? `Unknown (${status})`;
    }

    const normalized = String(status).trim().toLowerCase();

    const knownStatuses: Record<string, string> = {
      initiated: 'Initiated',
      success: 'Success',
      successful: 'Success',
      failed: 'Failed',
      pending: 'Pending',
      refunded: 'Refunded',
      cancelled: 'Cancelled',
      canceled: 'Cancelled'
    };

    return knownStatuses[normalized] ?? String(status).trim();
  }

  isSuccessful(payment: any): boolean {
    return this.getPaymentStatus(payment).toLowerCase() === 'success';
  }

  getStatusClass(payment: any): string {
    const status = this.getPaymentStatus(payment).toLowerCase();

    switch (status) {
      case 'success':
      case 'successful':
        return 'success';

      case 'failed':
        return 'failed';

      case 'pending':
        return 'pending';

      case 'initiated':
        return 'initiated';

      case 'refunded':
        return 'refunded';

      case 'cancelled':
        return 'cancelled';

      default:
        return 'unknown';
    }
  }

  // GET receipt file using your existing service method.
  downloadReceipt(payment: any): void {
    const paymentId = this.getPaymentId(payment);

    if (paymentId <= 0 || !this.isSuccessful(payment)) {
      this.errorMessage = 'A receipt is available only for a successful payment.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.downloadingPaymentId = paymentId;

    this.paymentService.downloadReceipt(paymentId).subscribe({
      next: (blob: Blob) => {
        this.downloadingPaymentId = null;

        if (!blob || blob.size === 0) {
          this.errorMessage = 'The receipt file is empty or unavailable.';
          return;
        }

        const fileUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = fileUrl;
        link.download = `PremiumReceipt_${paymentId}.pdf`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
          window.URL.revokeObjectURL(fileUrl);
        }, 1000);

        this.successMessage =
          `Receipt for payment #${paymentId} downloaded successfully.`;
      },
      error: (error: any) => {
        this.downloadingPaymentId = null;
        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          `Unable to download the receipt for payment #${paymentId}.`;
      }
    });
  }

  // POST to regenerate a receipt using your existing service method.
  regenerateReceipt(payment: any): void {
    const paymentId = this.getPaymentId(payment);

    if (paymentId <= 0 || !this.isSuccessful(payment)) {
      this.errorMessage =
        'A receipt can be regenerated only for a successful payment.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.regeneratingPaymentId = paymentId;

    this.paymentService.regenerateReceipt(paymentId).subscribe({
      next: (response: any) => {
        this.regeneratingPaymentId = null;

        this.successMessage =
          response?.message ||
          response?.Message ||
          `Receipt for payment #${paymentId} regenerated successfully.`;
      },
      error: (error: any) => {
        this.regeneratingPaymentId = null;
        this.errorMessage =
          error?.error?.message ||
          error?.error?.title ||
          error?.message ||
          `Unable to regenerate the receipt for payment #${paymentId}.`;
      }
    });
  }

 trackByPaymentId = (index: number, payment: any): number => {
  return this.getPaymentId(payment) || index;
};
}