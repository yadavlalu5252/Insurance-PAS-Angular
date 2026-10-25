import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RefundService } from '../service/refundservice';

@Component({
  selector: 'app-adminrefund',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminrefund.html',
  styleUrl: './adminrefund.scss'
})
export class Adminrefund {

  refundId: number | null = null;
  approvedBy: number | null = null;

  refundDetails: any = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private refundService: RefundService) {}

  // Retrieve a refund by ID
  getRefund(): void {

    this.clearMessages();

    if (!this.refundId || this.refundId < 1) {
      this.errorMessage = 'Enter a valid Refund ID.';
      return;
    }

    this.loading = true;

    this.refundService.getRefund(this.refundId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          this.refundDetails = response;
          this.successMessage = 'Refund details retrieved successfully.';
        },
        error: (error: any) => {
          this.refundDetails = null;
          this.errorMessage =
            error?.error?.message || 'Unable to find this refund.';
        }
      });
  }

  // Approve a refund
  approveRefund(): void {

    this.clearMessages();

    if (!this.refundId || this.refundId < 1) {
      this.errorMessage = 'Retrieve a valid refund first.';
      return;
    }

    if (
      this.approvedBy === null ||
      !Number.isInteger(this.approvedBy) ||
      this.approvedBy < 1
    ) {
      this.errorMessage = 'Enter a valid Admin User ID.';
      return;
    }

    const dto = {
      approved_by: this.approvedBy
    };

    this.loading = true;

    this.refundService.approveRefund(this.refundId, dto)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          this.refundDetails = response;
          this.successMessage = 'Refund approved successfully.';
        },
        error: (error: any) => {
          this.errorMessage =
            error?.error?.message || 'Unable to approve this refund.';
        }
      });
  }

  clear(): void {
    this.refundId = null;
    this.approvedBy = null;
    this.refundDetails = null;
    this.clearMessages();
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}