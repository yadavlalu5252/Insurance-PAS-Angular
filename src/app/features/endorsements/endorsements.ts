
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
  EndorsementRequest,
  EndorsementRow,
  Policy,
  PolicyService
} from '../policies/policy.service';

type Role = 'Admin' | 'Agent' | 'Customer';

@Component({
  selector: 'app-endorsements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './endorsements.html',
  styleUrl: './endorsements.scss'
})
export class Endorsements implements OnInit {
  private readonly service = inject(PolicyService);
  private readonly route = inject(ActivatedRoute);

  role: Role = 'Admin';

  policies = signal<Policy[]>([]);
  rows = signal<EndorsementRow[]>([]);
  loading = signal(false);
  saving = signal(false);

  errorMessage = signal('');
  successMessage = signal('');
  search = signal('');
  modalOpen = signal(false);

  policyId = 0;
  endorsementType = 'Correction';
  oldValues = '';
  newValues = '';
  selectedPolicyId = 0;

  readonly canRequest = (): boolean =>
    this.role === 'Customer' || this.role === 'Agent';

  readonly canDecide = (): boolean =>
    this.role === 'Admin';

  get pendingCount(): number {
    return this.rows().filter(row =>
      ['pending', 'submitted', 'under review'].includes(
        (row.status || 'pending').toLowerCase()
      )
    ).length;
  }

  get approvedCount(): number {
    return this.rows().filter(
      row => (row.status || '').toLowerCase() === 'approved'
    ).length;
  }

  get filteredRows(): EndorsementRow[] {
    const query = this.search().trim().toLowerCase();

    return this.rows().filter(row => {
      const values = [
        row.endorsement_number,
        row.endorsement_type,
        row.status,
        String(row.policy_id),
        String(row.endorsement_id)
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

    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getPolicies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (policies: Policy[]) => {
          this.policies.set(policies ?? []);
          this.loadForPolicies(policies ?? []);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.message ||
            error.error?.msg ||
            'Unable to load policies.'
          );
        }
      });
  }

  private loadForPolicies(policies: Policy[]): void {
    if (!policies.length) {
      this.rows.set([]);
      return;
    }

    let remaining = policies.length;
    const allRows: EndorsementRow[] = [];

    policies.forEach((policy: Policy) => {
      this.service.getEndorsements(policy.policy_id).subscribe({
        next: (data: EndorsementRow[]) => {
          allRows.push(...(data ?? []));
          finishOne();
        },
        error: () => finishOne()
      });
    });

    const component = this;

    function finishOne(): void {
      remaining--;

      if (remaining === 0) {
        const uniqueRows = new Map<number, EndorsementRow>();

        allRows.forEach(row => uniqueRows.set(row.endorsement_id, row));

        component.rows.set(
          Array.from(uniqueRows.values()).sort(
            (a, b) => b.endorsement_id - a.endorsement_id
          )
        );
      }
    }
  }

  openCreate(): void {
    if (!this.canRequest()) {
      this.errorMessage.set('You cannot submit endorsement requests.');
      return;
    }

    this.errorMessage.set('');
    this.policyId =
      this.selectedPolicyId ||
      this.policies()[0]?.policy_id ||
      0;

    this.endorsementType = 'Correction';
    this.oldValues = '';
    this.newValues = '';
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.saving()) {
      this.modalOpen.set(false);
    }
  }

  create(): void {
    if (!this.canRequest()) {
      this.errorMessage.set('You cannot submit endorsement requests.');
      return;
    }

    if (
      !this.policyId ||
      !this.endorsementType.trim() ||
      !this.newValues.trim()
    ) {
      this.errorMessage.set(
        'Select a policy and enter the requested change details.'
      );
      return;
    }

    const request: EndorsementRequest = {
      endorsement_type: this.endorsementType.trim(),
      old_values: this.oldValues.trim(),
      new_values: this.newValues.trim()
    };

    this.saving.set(true);
    this.errorMessage.set('');

    this.service.createEndorsement(this.policyId, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.modalOpen.set(false);
          this.successMessage.set('Endorsement request submitted.');
          this.loadPolicies();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.message ||
            error.error?.msg ||
            (typeof error.error === 'string' ? error.error : '') ||
            'Unable to submit endorsement.'
          );
        }
      });
  }

  decide(row: EndorsementRow, approve: boolean): void {
    if (!this.canDecide()) {
      this.errorMessage.set('Only Admin can decide endorsement requests.');
      return;
    }

    const call = approve
      ? this.service.approveEndorsement(row.endorsement_id)
      : this.service.rejectEndorsement(row.endorsement_id);

    call.subscribe({
      next: () => {
        this.successMessage.set(
          approve ? 'Endorsement approved.' : 'Endorsement rejected.'
        );
        this.loadPolicies();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ||
          error.error?.msg ||
          (typeof error.error === 'string' ? error.error : '') ||
          'Unable to update endorsement.'
        );
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

    if (['approved', 'accepted'].includes(value)) {
      return 'success';
    }

    if (['pending', 'submitted', 'under review'].includes(value)) {
      return 'warning';
    }

    if (['rejected', 'declined'].includes(value)) {
      return 'danger';
    }

    return 'neutral';
  }
}
