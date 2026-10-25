import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgentClaimService } from '../../../agent-claim.service';
import {
  BadgeClass, CheckFile, Claim, ClaimDocument, ClaimHistory, ErrorText, FINAL_STATUSES,
  Settlement, SettlementAdvice
} from '../../../Models/agent-claim.models';

@Component({
  selector: 'app-agent-claim-details',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './agent-claim-details.html',
  styleUrl: './agent-claim-details.scss'
})
export class AgentClaimDetails {
  service = inject(AgentClaimService);
  route = inject(ActivatedRoute);

  id = Number(this.route.snapshot.paramMap.get('id'));
  BadgeClass = BadgeClass;

  steps = ['Registered', 'In Review', 'Approved', 'Settled'];
  tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents' },
    { key: 'settlement', label: 'Settlement' }
  ];
  tab = signal('overview');

  claim = signal<Claim | null>(null);
  history = signal<ClaimHistory[]>([]);
  docs = signal<ClaimDocument[]>([]);
  settlement = signal<Settlement | null>(null);
  advice = signal<SettlementAdvice | null>(null);

  loading = signal(true);
  busy = signal(false);
  error = signal('');
  message = signal('');

  // edit
  editing = signal(false);
  description = '';
  estimatedLoss: number | null = null;

  // upload
  docName = '';
  docFile: File | null = null;

  constructor() {
    this.Load();
  }

  Load() {
    this.service.GetById(this.id).subscribe({
      next: res => {
        this.claim.set(res.data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.status === 404 ? 'Claim not found' : ErrorText(err, 'Could not load the claim'));
      }
    });

    this.service.GetHistory(this.id).subscribe({
      next: res => this.history.set(res.data ?? []),
      error: () => this.history.set([])
    });

    this.service.GetDocuments(this.id).subscribe({
      next: res => this.docs.set(res.data ?? []),
      error: () => this.docs.set([])
    });

    this.service.GetSettlement(this.id).subscribe({
      next: res => this.settlement.set(res.data),
      error: () => this.settlement.set(null)   // 404 = not settled yet
    });
  }

  // where the claim is on the main path: Registered, In Review, Approved, Settled
  StepIndex(): number {
    switch (this.claim()?.claim_status) {
      case 'Registered': return 0;
      case 'Pending Verification':
      case 'Under Survey':
      case 'Under Investigation': return 1;
      case 'Approved': return 2;
      case 'Settled': return 3;
      default: return -1;
    }
  }

  StepClass(i: number): string {
    const current = this.StepIndex();
    if (current === 3 || i < current) return 'done';
    return i === current ? 'current' : '';
  }

  IsClosed(): boolean {
    const s = this.claim()?.claim_status;
    return s === 'Rejected' || s === 'Cancelled';
  }

  // same rules as the API: edit and cancel only before processing starts
  CanChange(): boolean {
    const s = this.claim()?.claim_status;
    return s === 'Registered' || s === 'Pending Verification';
  }

  CanUpload(): boolean {
    const s = this.claim()?.claim_status ?? '';
    return !FINAL_STATUSES.includes(s);
  }

  // ---------- edit and cancel ----------

  StartEdit() {
    this.error.set('');
    this.message.set('');
    this.description = this.claim()!.description;
    this.estimatedLoss = this.claim()!.estimated_loss;
    this.editing.set(true);
  }

  SaveEdit() {
    this.error.set('');

    if (!this.description.trim()) {
      this.error.set('Description is required');
      return;
    }
    if (!this.estimatedLoss || this.estimatedLoss <= 0) {
      this.error.set('Estimated loss must be greater than 0');
      return;
    }

    this.busy.set(true);

    this.service.Update(this.id, { description: this.description.trim(), estimated_loss: this.estimatedLoss }).subscribe({
      next: res => {
        this.busy.set(false);
        this.editing.set(false);
        this.message.set(res.message);
        this.Load();
      },
      error: err => {
        this.busy.set(false);
        this.error.set(ErrorText(err, 'Could not update the claim'));
      }
    });
  }

  Cancel() {
    if (!confirm('Cancel this claim? This cannot be undone.')) return;

    this.error.set('');
    this.message.set('');
    this.busy.set(true);

    this.service.Cancel(this.id).subscribe({
      next: res => {
        this.busy.set(false);
        this.message.set(res.message);
        this.Load();
      },
      error: err => {
        this.busy.set(false);
        this.error.set(ErrorText(err, 'Could not cancel the claim'));
      }
    });
  }

  // ---------- documents ----------

  OnFile(event: Event) {
    this.docFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  Upload(fileInput: HTMLInputElement) {
    this.error.set('');
    this.message.set('');

    if (!this.docName.trim()) {
      this.error.set('Enter a document name (for example "Hospital Bill")');
      return;
    }
    if (this.docName.length > 150) {
      this.error.set('Document name can have at most 150 characters');
      return;
    }
    const problem = CheckFile(this.docFile);
    if (problem) {
      this.error.set(problem);
      return;
    }

    this.busy.set(true);

    this.service.UploadDocument(this.id, this.docName.trim(), this.docFile!).subscribe({
      next: res => {
        this.busy.set(false);
        this.message.set(res.message);
        this.docName = '';
        this.docFile = null;
        fileInput.value = '';
        this.Load();   // the first upload moves the claim to Pending Verification
      },
      error: err => {
        this.busy.set(false);
        this.error.set(ErrorText(err, 'Could not upload the document'));
      }
    });
  }

  // ---------- settlement ----------

  ShowAdvice() {
    this.error.set('');
    this.service.GetAdvice(this.id).subscribe({
      next: res => this.advice.set(res.data),
      error: err => this.error.set(ErrorText(err, 'Could not load the settlement advice'))
    });
  }
}