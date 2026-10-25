import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PremiumPaymentService } from '../service/premiumspaymentservice';

@Component({
  selector: 'app-adminpremium',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminpremium.html',
  styleUrl: './adminpremium.scss'
})
export class Adminpremium implements OnInit {

  // =========================================================
  // PAYMENT VERIFICATION
  // =========================================================

  payments: any[] = [];
  filteredPayments: any[] = [];
  selectedPayment: any = null;

  verificationStatus = 'Success';
  verificationMessage = '';

  loadingPayments = false;
  verifyingPayment = false;

  paymentSuccessMessage = '';
  paymentErrorMessage = '';

  paymentStatusFilter = 'All';

  constructor(
    private premiumPaymentService: PremiumPaymentService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  // =========================================================
  // CONVERT NUMERIC OR STRING PAYMENT STATUS TO TEXT
  // =========================================================

  getPaymentStatus(status: any): string {

    if (
      status === null ||
      status === undefined ||
      status === ''
    ) {
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
      (typeof status === 'string' &&
       /^\d+$/.test(status.trim()))
    ) {
      return statusMap[Number(status)] ??
        `Unknown (${status})`;
    }

    const normalized = String(status)
      .trim()
      .toLowerCase();

    const knownStatuses: Record<string, string> = {
      initiated: 'Initiated',
      success: 'Success',
      failed: 'Failed',
      pending: 'Pending',
      refunded: 'Refunded',
      cancelled: 'Cancelled',
      canceled: 'Cancelled'
    };

    return knownStatuses[normalized] ??
      String(status).trim();
  }

  // =========================================================
  // STATUS CSS CLASS
  // =========================================================

  getStatusClass(status: any): string {

    switch (
      this.getPaymentStatus(status).toLowerCase()
    ) {

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
        return 'pending';
    }
  }

  // =========================================================
  // LOAD ALL PAYMENTS
  // =========================================================

  loadPayments(clearMessages = true): void {

    if (clearMessages) {
      this.clearPaymentMessages();
    }

    this.loadingPayments = true;

    this.premiumPaymentService
      .getPayments()
      .pipe(
        finalize(() => {
          this.loadingPayments = false;
        })
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'GET PAYMENTS RESPONSE:',
            response
          );

          if (
            response?.success === false ||
            response?.Success === false
          ) {

            this.payments = [];
            this.filteredPayments = [];

            this.paymentErrorMessage =
              response?.message ||
              response?.Message ||
              'Unable to load payments.';

            return;
          }

          let records: any[] | null = null;

          if (Array.isArray(response)) {
            records = response;
          } else if (Array.isArray(response?.data)) {
            records = response.data;
          } else if (Array.isArray(response?.Data)) {
            records = response.Data;
          } else if (Array.isArray(response?.payments)) {
            records = response.payments;
          } else if (Array.isArray(response?.Payments)) {
            records = response.Payments;
          } else if (Array.isArray(response?.items)) {
            records = response.items;
          } else if (Array.isArray(response?.Items)) {
            records = response.Items;
          }

          if (records !== null) {

            this.payments = records;

            this.filterPayments();

            if (records.length === 0) {
              this.paymentSuccessMessage =
                'No payment records are available.';
            }

            return;
          }

          this.payments = [];
          this.filteredPayments = [];

          this.paymentErrorMessage =
            response?.message ||
            response?.Message ||
            'The API response did not contain a payment list.';

          console.error(
            'Unexpected GET PAYMENTS response:',
            response
          );
        },

        error: (error: any) => {

          console.error(
            'GET PAYMENTS ERROR:',
            error
          );

          this.payments = [];
          this.filteredPayments = [];

          if (error?.status === 401) {

            this.paymentErrorMessage =
              'Unauthorized. Please log in with a valid token.';

          } else if (error?.status === 403) {

            this.paymentErrorMessage =
              'You are not authorized to view payments.';

          } else if (error?.status === 0) {

            this.paymentErrorMessage =
              'Cannot connect to the Premium Payment API. Check its URL, HTTPS certificate and CORS configuration.';

          } else {

            this.paymentErrorMessage =
              error?.error?.message ||
              `Unable to load payments. HTTP status: ${error?.status ?? 'unknown'}.`;
          }
        }
      });
  }

  // =========================================================
  // FILTER PAYMENTS
  // =========================================================

  filterPayments(): void {

    if (this.paymentStatusFilter === 'All') {

      this.filteredPayments = [...this.payments];

      return;
    }

    this.filteredPayments = this.payments.filter(
      payment =>
        this.getPaymentStatus(
          payment.payment_status
        ).toLowerCase() ===
        this.paymentStatusFilter.toLowerCase()
    );
  }

  // =========================================================
  // CHECK WHETHER PAYMENT NEEDS VERIFICATION
  // =========================================================

  canVerify(payment: any): boolean {

    const status =
      this.getPaymentStatus(
        payment?.payment_status
      ).toLowerCase();

    return status === 'pending' ||
           status === 'initiated';
  }

  // =========================================================
  // SELECT PAYMENT
  // =========================================================

  selectPayment(payment: any): void {

    this.clearPaymentMessages();

    this.selectedPayment = {
      ...payment
    };

    this.verificationStatus =
      this.getPaymentStatus(
        payment.payment_status
      );

    this.verificationMessage = '';
  }

  // =========================================================
  // VERIFY PAYMENT
  // =========================================================

  verifyPayment(): void {

    this.clearPaymentMessages();

    if (!this.selectedPayment) {

      this.paymentErrorMessage =
        'Please select a payment.';

      return;
    }

    const paymentId =
      Number(this.selectedPayment.payment_id);

    if (
      !Number.isInteger(paymentId) ||
      paymentId <= 0
    ) {

      this.paymentErrorMessage =
        'Invalid payment ID.';

      return;
    }

    if (!this.verificationStatus) {

      this.paymentErrorMessage =
        'Please select a payment status.';

      return;
    }

    const dto = {
      payment_status: this.verificationStatus
    };

    this.verifyingPayment = true;

    this.premiumPaymentService
      .verifyPayment(paymentId, dto)
      .pipe(
        finalize(() => {
          this.verifyingPayment = false;
        })
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'VERIFY PAYMENT RESPONSE:',
            response
          );

          if (
            response?.success === false ||
            response?.Success === false
          ) {

            this.paymentErrorMessage =
              response?.message ||
              response?.Message ||
              'Unable to verify payment.';

            return;
          }

          this.paymentSuccessMessage =
            response?.message ||
            response?.Message ||
            'Payment verification completed successfully.';

          this.selectedPayment = null;
          this.verificationMessage = '';

          // Refresh payments without clearing the success message.
          this.loadPayments(false);
        },

        error: (error: any) => {

          console.error(
            'VERIFY PAYMENT ERROR:',
            error
          );

          this.paymentErrorMessage =
            error?.error?.message ||
            'Unable to verify payment.';
        }
      });
  }

  // =========================================================
  // CANCEL PAYMENT SELECTION
  // =========================================================

  cancelPaymentSelection(): void {

    this.selectedPayment = null;
    this.verificationMessage = '';

    this.clearPaymentMessages();
  }

  // =========================================================
  // CLEAR PAYMENT MESSAGES
  // =========================================================

  clearPaymentMessages(): void {

    this.paymentSuccessMessage = '';
    this.paymentErrorMessage = '';
  }
}