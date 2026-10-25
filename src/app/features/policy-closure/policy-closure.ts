
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { finalize } from 'rxjs';

import {
  ClosureRequest,
  ClosureRow,
  Policy,
  PolicyService
} from '../policies/policy.service';

type Role = 'Admin' | 'Agent' | 'Customer';

@Component({
  selector: 'app-policy-closure',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './policy-closure.html',
  styleUrl: './policy-closure.scss'
})
export class PolicyClosureComponent implements OnInit {
  private readonly service = inject(PolicyService);
  private readonly route = inject(ActivatedRoute);

  role: Role = 'Admin';

  policies = signal<Policy[]>([]);
  rows = signal<ClosureRow[]>([]);

  loading = false;
  saving = false;

  modalOpen = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  search = '';

  policyId = 0;
  reason = 'Customer request';
  remarks = '';
  requestedBy = '';
  refundAmount: number | undefined;
  rejectionReason = '';

  canRequest(): boolean {
    return this.role === 'Customer' || this.role === 'Agent';
  }

  canDecide(): boolean {
    return this.role === 'Admin';
  }

  get pendingCount(): number {
    return this.rows().filter(row =>
      (row.closure_status || 'pending').toLowerCase() === 'pending'
    ).length;
  }

  get approvedCount(): number {
    return this.rows().filter(row =>
      ['approved', 'closed'].includes(
        (row.closure_status || '').toLowerCase()
      )
    ).length;
  }

  get filteredRows(): ClosureRow[] {
    const query = this.search.trim().toLowerCase();

    return this.rows().filter(row => {
      const values = [
        String(row.policy_closure_id),
        String(row.policy_id),
        row.closure_reason,
        row.closure_status,
        row.requested_by
      ];

      return !query || values.some(value =>
        String(value ?? '').toLowerCase().includes(query)
      );
    });
  }

  ngOnInit(): void {
    const path = this.route.snapshot.pathFromRoot
      .flatMap(route => route.url.map(segment => segment.path))
      .join('/')
      .toLowerCase();

    this.role = path.includes('customer/')
      ? 'Customer'
      : path.includes('agent/')
        ? 'Agent'
        : 'Admin';

    this.requestedBy =
      localStorage.getItem('userName') ||
      localStorage.getItem('username') ||
      this.role;

    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage.set('');

    this.service.getPolicies()
      .pipe(finalize(() => {
        // Loading stays active until the closure request is loaded.
      }))
      .subscribe({
        next: (policies: Policy[]) => {
          this.policies.set(policies ?? []);

          this.service.getClosures().subscribe({
            next: (rows: ClosureRow[]) => {
              this.rows.set(rows ?? []);
              this.loading = false;
            },
            error: (error: HttpErrorResponse) => {
              this.loading = false;
              this.setError(error, 'Unable to load closure requests.');
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.setError(error, 'Unable to load policies.');
        }
      });
  }

  openCreate(): void {
    if (!this.canRequest()) {
      this.errorMessage.set('You cannot submit closure requests.');
      return;
    }

    this.policyId = this.policies()[0]?.policy_id || 0;
    this.reason = 'Customer request';
    this.remarks = '';
    this.errorMessage.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.saving) {
      this.modalOpen.set(false);
    }
  }

  create(): void {
    if (!this.canRequest()) {
      this.errorMessage.set('You cannot submit closure requests.');
      return;
    }

    if (!this.policyId || !this.reason.trim()) {
      this.errorMessage.set(
        'Select a policy and provide a closure reason.'
      );
      return;
    }

    const request: ClosureRequest = {
      policy_id: this.policyId,
      closure_reason: this.reason.trim(),
      requested_by: this.requestedBy,
      remarks: this.remarks.trim()
    };

    this.saving = true;
    this.errorMessage.set('');

    this.service.createClosure(request)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: response => {
          this.modalOpen.set(false);
          this.successMessage.set(
            response.msg || response.message ||
            'Policy closure request submitted.'
          );
          this.load();
        },
        error: (error: HttpErrorResponse) => {
          this.setError(error, 'Unable to submit closure request.');
        }
      });
  }

  approve(row: ClosureRow): void {
    if (!this.canDecide()) {
      this.errorMessage.set('Only Admin can approve closure requests.');
      return;
    }

    this.service.approveClosure(
      row.policy_closure_id,
      this.requestedBy,
      this.refundAmount
    ).subscribe({
      next: response => {
        this.successMessage.set(
          response.msg || response.message || 'Closure approved.'
        );
        this.refundAmount = undefined;
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.setError(error, 'Unable to approve closure.');
      }
    });
  }

  reject(row: ClosureRow): void {
    if (!this.canDecide()) {
      this.errorMessage.set('Only Admin can reject closure requests.');
      return;
    }

    if (!this.rejectionReason.trim()) {
      this.errorMessage.set('Enter a rejection reason first.');
      return;
    }

    this.service.rejectClosure(
      row.policy_closure_id,
      this.rejectionReason.trim(),
      this.requestedBy
    ).subscribe({
      next: response => {
        this.successMessage.set(
          response.msg || response.message || 'Closure request rejected.'
        );
        this.rejectionReason = '';
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.setError(error, 'Unable to reject closure.');
      }
    });
  }

  policyLabel(id: number): string {
    const policy = this.policies().find(
      item => item.policy_id === id
    );

    return policy
      ? `${policy.policy_number || `Policy #${id}`} — ${
          policy.customer_name || `Customer #${policy.customer_id}`
        }`
      : `Policy #${id}`;
  }

  statusClass(status?: string): string {
    const value = (status || '').toLowerCase();

    if (['approved', 'closed'].includes(value)) {
      return 'success';
    }

    if (['pending', 'submitted'].includes(value)) {
      return 'warning';
    }

    if (['rejected', 'cancelled'].includes(value)) {
      return 'danger';
    }

    return 'neutral';
  }

  private setError(
    error: HttpErrorResponse,
    fallback: string
  ): void {
    this.errorMessage.set(
      error.error?.message ||
      error.error?.msg ||
      (typeof error.error === 'string' ? error.error : '') ||
      fallback
    );
  }
}
