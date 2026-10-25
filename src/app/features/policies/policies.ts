import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import { Policy, PolicyRequest, PolicyService } from './policy.service';

type Role = 'Admin' | 'Agent' | 'Customer';
type Tab = 'all' | 'pending' | 'active' | 'closed';
@Component({
  selector: 'app-policies', standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './policies.html', styleUrl: './policies.scss'
})
export class Policies implements OnInit {
  private readonly service = inject(PolicyService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  role: Role = 'Admin';
  policies = signal<Policy[]>([]);
  loading = signal(false); saving = signal(false);
  search = signal(''); activeTab = signal<Tab>('all');
  errorMessage = signal(''); successMessage = signal('');
  modalOpen = signal(false); editingId: number | null = null;
  readonly canCreate = computed(() => this.role === 'Admin' || this.role === 'Agent');
  readonly canApprove = computed(() => this.role === 'Admin');
  readonly canClose = computed(() => this.role === 'Admin');
  readonly visiblePolicies = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.policies().filter(p => {
      const textMatch = !q || [p.policy_number, p.customer_name, p.product_name, String(p.policy_id), String(p.customer_id)].some(v => String(v ?? '').toLowerCase().includes(q));
      const s = (p.policy_status || '').toLowerCase();
      const tabMatch = this.activeTab() === 'all' || (this.activeTab() === 'pending' && ['draft','pending','under review','pending approval'].includes(s)) || (this.activeTab() === 'active' && s === 'active') || (this.activeTab() === 'closed' && ['cancelled','canceled','expired','closed','suspended','rejected'].includes(s));
      return textMatch && tabMatch;
    });
  });
  readonly stats = computed(() => ({ total: this.policies().length, active: this.policies().filter(p => p.policy_status?.toLowerCase() === 'active').length, pending: this.policies().filter(p => ['draft','pending','under review','pending approval'].includes(p.policy_status?.toLowerCase())).length, premium: this.policies().reduce((sum,p) => sum + (Number(p.premium_amount)||0),0) }));
  form = this.fb.nonNullable.group({ policy_number: [''], customer_id: [0, [Validators.required, Validators.min(1)]], quote_id: [0,[Validators.required,Validators.min(1)]], product_id: [0,[Validators.required,Validators.min(1)]], underwriting_id: [0,[Validators.required,Validators.min(1)]], issue_date: [this.today(), Validators.required], effective_date: [this.today(), Validators.required], expiry_date: [this.nextYear(), Validators.required], premium_amount: [0,[Validators.required,Validators.min(0.01)]], policy_status: ['Draft', Validators.required] });

  ngOnInit(): void {
    const path = this.route.snapshot.url.map(s => s.path).join('/').toLowerCase();
    this.role = path.startsWith('customer') ? 'Customer' : path.startsWith('agent') ? 'Agent' : 'Admin';
    this.loadPolicies();
  }
  today(): string { return new Date().toISOString().slice(0,10); }
  nextYear(): string { const d = new Date(); d.setFullYear(d.getFullYear()+1); return d.toISOString().slice(0,10); }
  loadPolicies(): void {
    this.loading.set(true); this.errorMessage.set('');
    this.service.getPolicies().pipe(finalize(() => this.loading.set(false))).subscribe({next: rows => this.policies.set(Array.isArray(rows) ? rows : []), error: e => this.showError(e, 'Unable to load policies.')});
  }
  openCreate(): void { this.editingId = null; this.form.reset({policy_number:'',customer_id:0,quote_id:0,product_id:0,underwriting_id:0,issue_date:this.today(),effective_date:this.today(),expiry_date:this.nextYear(),premium_amount:0,policy_status:'Draft'}); this.modalOpen.set(true); }
  closeModal(): void { if (!this.saving()) this.modalOpen.set(false); }
  edit(policy: Policy): void {
    if (policy.policy_status?.toLowerCase() !== 'draft') { this.errorMessage.set('Only Draft policies can be edited.'); return; }
    this.editingId = policy.policy_id;
    this.form.reset({policy_number:policy.policy_number,customer_id:policy.customer_id,quote_id:policy.quote_id,product_id:policy.product_id,underwriting_id:policy.underwriting_id,issue_date:this.dateOnly(policy.issue_date),effective_date:this.dateOnly(policy.effective_date),expiry_date:this.dateOnly(policy.expiry_date),premium_amount:policy.premium_amount,policy_status:policy.policy_status});
    this.modalOpen.set(true);
  }
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const data = this.form.getRawValue() as PolicyRequest;
    this.saving.set(true); this.errorMessage.set('');
    const request = this.editingId === null ? this.service.addPolicy(data) : this.service.updatePolicy(this.editingId, data);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({next: () => { this.modalOpen.set(false); this.successMessage.set(this.editingId === null ? 'Policy created successfully.' : 'Policy updated successfully.'); this.loadPolicies(); }, error: e => this.showError(e,'Unable to save policy.')});
  }
  runAction(action: 'activate'|'suspend'|'expire'|'cancel', p: Policy): void {
    if (action === 'cancel' && !confirm(`Cancel policy ${p.policy_number}?`)) return;
    const call = action === 'activate' ? this.service.activatePolicy(p.policy_id) : action === 'suspend' ? this.service.suspendPolicy(p.policy_id) : action === 'expire' ? this.service.expirePolicy(p.policy_id) : this.service.cancelPolicy(p.policy_id);
    call.subscribe({next: () => {this.successMessage.set(`Policy ${action} request completed.`); this.loadPolicies();}, error: e => this.showError(e,`Unable to ${action} policy.`)});
  }
  download(p: Policy): void { this.service.getDocument(p.policy_id).subscribe({next: blob => {const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${p.policy_number || 'policy'}.pdf`;a.click();URL.revokeObjectURL(url);},error:e=>this.showError(e,'Unable to download policy document.')}); }
  regenerate(p: Policy): void { this.service.regenerateDocument(p.policy_id).subscribe({next:()=>{this.successMessage.set('Document regeneration requested.');},error:e=>this.showError(e,'Unable to regenerate document.')}); }
  statusClass(status: string): string { const s=(status||'').toLowerCase(); return ['active','approved','issued'].includes(s)?'success': ['pending','draft','under review'].includes(s)?'warning':['rejected','cancelled','canceled','expired','closed'].includes(s)?'danger':'neutral'; }
  dateOnly(value: string): string { return value ? value.slice(0,10) : ''; }
  money(value: number): string { return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(value)||0); }
  private showError(error: unknown, fallback: string): void { const e=error as HttpErrorResponse; this.errorMessage.set(e?.status===401?'Session token is missing or expired. Sign in again.':e?.status===403?'You do not have permission for this action.':e?.status===0?'Cannot reach the Policy Issuance API. Check the API URL, HTTPS certificate and CORS.':(e?.error?.message || e?.error?.title || fallback)); }
}
