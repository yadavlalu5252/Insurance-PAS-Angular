import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AgentClaimService } from '../../../agent-claim.service';
import { BadgeClass, CLAIM_STATUSES, CLAIM_TYPES, Claim, ErrorText, ApiResponse, PagedResult } from '../../../Models/agent-claim.models';

@Component({
  selector: 'app-agent-claims',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './agent-claims.html',
  styleUrl: './agent-claims.scss'
})
export class AgentClaims {
  service = inject(AgentClaimService);

  statuses = CLAIM_STATUSES;
  types = CLAIM_TYPES;
  BadgeClass = BadgeClass;

  items = signal<Claim[]>([]);
  total = signal(0);
  totalPages = signal(1);
  page = signal(1);
  loading = signal(false);
  error = signal('');

  size = 10;
  search = '';
  status = '';
  type = '';
  customerId: number | null = null;

  constructor() {
    this.Load();
  }

  Load() {
    this.loading.set(true);
    this.error.set('');

    this.service.GetAll({
      page_number: this.page(),
      page_size: this.size,
      search: this.search.trim(),
      claim_status: this.status,
      claim_type: this.type,
      customer_id: this.customerId ?? undefined
    }).subscribe({
      next: (res: ApiResponse<PagedResult<Claim>>) => {
        const d = res.data;
        this.items.set(d?.items ?? []);
        this.total.set(d?.total_records ?? 0);
        this.totalPages.set(Math.max(d?.total_pages ?? 1, 1));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(ErrorText(err, 'Could not load claims'));
      }
    });
  }

  Filter() {
    this.page.set(1);
    this.Load();
  }

  Clear() {
    this.search = '';
    this.status = '';
    this.type = '';
    this.customerId = null;
    this.Filter();
  }

  Go(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.Load();
  }
}
