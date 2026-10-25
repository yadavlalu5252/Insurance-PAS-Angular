import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { PremiumPaymentService } from '../service/premiumspaymentservice';

@Component({
  selector: 'app-paymenthistory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paymenthistory.html',
  styleUrl: './paymenthistory.scss'
})
export class Paymenthistory implements OnInit {

  policyId: number | null = null;
  payments: any[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private premiumPaymentService: PremiumPaymentService
  ) {}

  ngOnInit(): void {

    this.policyId = this.getLoggedInPolicyId();

    if (!this.policyId) {
      this.errorMessage =
        'Policy ID was not found in your login session.';
      return;
    }

    this.loadHistory();
  }

  // Get Policy ID from login storage or JWT.
  private getLoggedInPolicyId(): number | null {

    const storedId =
      localStorage.getItem('policy_id') ||
      sessionStorage.getItem('policy_id');

    if (
      storedId &&
      Number.isInteger(Number(storedId)) &&
      Number(storedId) > 0
    ) {
      return Number(storedId);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {

      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const base64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padded = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        '='
      );

      const payload = JSON.parse(atob(padded));

      const id =
        payload['policy_id'] ??
        payload['policyId'] ??
        payload['PolicyId'];

      const parsedId = Number(id);

      return Number.isInteger(parsedId) && parsedId > 0
        ? parsedId
        : null;

    } catch (error) {

      console.error('Unable to read Policy ID:', error);
      return null;
    }
  }

  // GET /api/PremiumPayment/history/{policyId}
  loadHistory(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.policyId || this.policyId <= 0) {
      this.errorMessage = 'A valid Policy ID is required.';
      return;
    }

    this.loading = true;

    this.premiumPaymentService
      .getPaymentHistory(this.policyId)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

        next: (response: any) => {

          console.log('Payment History Response:', response);

          if (
            response?.success === false ||
            response?.Success === false
          ) {
            this.payments = [];
            this.errorMessage =
              response?.message ||
              response?.Message ||
              'Unable to retrieve payment history.';
            return;
          }

          let records: any[] | null = null;

          if (Array.isArray(response)) {
            records = response;
          } else if (Array.isArray(response?.data)) {
            records = response.data;
          } else if (Array.isArray(response?.Data)) {
            records = response.Data;
          } else if (Array.isArray(response?.items)) {
            records = response.items;
          } else if (Array.isArray(response?.Items)) {
            records = response.Items;
          }

          if (records === null) {
            this.payments = [];
            this.errorMessage =
              'The API response did not contain a payment history list.';
            return;
          }

          this.payments = records;

          this.successMessage = records.length > 0
            ? 'Payment history loaded successfully.'
            : 'No payment history found for this policy.';
        },

        error: (error: any) => {

          console.error('Payment History Error:', error);

          this.payments = [];

          if (error?.status === 401) {
            this.errorMessage =
              'Unauthorized. Please log in again.';
          } else if (error?.status === 403) {
            this.errorMessage =
              'You are not authorized to view this payment history.';
          } else {
            this.errorMessage =
              error?.error?.message ||
              `Unable to retrieve payment history. HTTP status: ${error?.status ?? 'unknown'}.`;
          }
        }
      });
  }

  // Support numeric enum values and string statuses.
  getPaymentStatus(status: any): string {

    if (status === null || status === undefined || status === '') {
      return 'Unknown';
    }

    const statusMap: Record<number, string> = {
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
      return statusMap[Number(status)] ?? `Unknown (${status})`;
    }

    return String(status);
  }

  getStatusClass(status: any): string {

    switch (this.getPaymentStatus(status).toLowerCase()) {
      case 'success':
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

  get totalSuccessfulAmount(): number {

    return this.payments.reduce((total, payment) => {

      const status = this.getPaymentStatus(
        payment.payment_status ?? payment.paymentStatus
      ).toLowerCase();

      if (status !== 'success') {
        return total;
      }

      return total + Number(
        payment.amount_paid ?? payment.amountPaid ?? 0
      );

    }, 0);
  }
}