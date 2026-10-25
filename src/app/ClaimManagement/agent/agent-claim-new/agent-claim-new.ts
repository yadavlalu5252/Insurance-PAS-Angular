import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgentClaimService } from '../../../agent-claim.service';
import { CLAIM_TYPES, ErrorText, TodayString } from '../../../Models/agent-claim.models';

// same rule as the API: the incident date cannot be in the future
function NotFuture(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  return value && value > TodayString() ? { future: true } : null;
}

@Component({
  selector: 'app-agent-claim-new',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './agent-claim-new.html',
  styleUrl: './agent-claim-new.scss'
})
export class AgentClaimNew {
  fb = inject(FormBuilder);
  service = inject(AgentClaimService);
  router = inject(Router);

  types = CLAIM_TYPES;
  today = TodayString();
  saving = signal(false);
  error = signal('');

  form = this.fb.group({
    customer_id: [null as number | null, [Validators.required, Validators.min(1)]],
    policy_id: [null as number | null, [Validators.required, Validators.min(1)]],
    claim_type: ['', Validators.required],
    incident_date: ['', [Validators.required, NotFuture]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    estimated_loss: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  Invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  Submit() {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.saving.set(true);

    this.service.Add({
      customer_id: v.customer_id!,
      policy_id: v.policy_id!,
      claim_type: v.claim_type!,
      incident_date: v.incident_date!,
      description: v.description!.trim(),
      estimated_loss: v.estimated_loss!
    }).subscribe({
      next: res => {
        this.saving.set(false);
        this.router.navigate(['/agent/claims', res.data!.claim_id]);
      },
      error: err => {
        this.saving.set(false);
        // 400 / 409 = the rule that failed, 503 = the Policy or Premium service is down
        this.error.set(ErrorText(err, 'Could not register the claim'));
      }
    });
  }
}