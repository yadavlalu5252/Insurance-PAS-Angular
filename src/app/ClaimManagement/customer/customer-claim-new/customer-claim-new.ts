import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClaimService } from '../../../claim-service';
import {
  CLAIM_TYPES, getErrorMessage, getSavedCustomerId, getTodayString, saveCustomerId, unwrapData
} from '../../../claim-helpers';

// same rule as the API: the incident date cannot be in the future
function notFutureDate(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  return value && value > getTodayString() ? { future: true } : null;
}

@Component({
  selector: 'app-customer-claim-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-claim-new.html',
  styleUrl: './customer-claim-new.scss',
})
export class CustomerClaimNew {
  private fb = inject(FormBuilder);
  private claimService = inject(ClaimService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  // the Customer and Agent routes use this same screen. The route data decides.
  basePath: string = this.route.snapshot.data['basePath'] ?? '/claims/customer';
  rememberCustomer: boolean = this.route.snapshot.data['remember'] ?? true;

  claimTypes = CLAIM_TYPES;
  today = getTodayString();

  saving = false;
  errorMessage = '';

  form = this.fb.group({
    policy_id: [null as number | null, [Validators.required, Validators.min(1)]],
    customer_id: [this.rememberCustomer ? getSavedCustomerId() : null, [Validators.required, Validators.min(1)]],
    claim_type: ['', Validators.required],
    incident_date: ['', [Validators.required, notFutureDate]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    estimated_loss: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saving = true;
    this.cd.detectChanges();

    this.claimService
      .addClaim({
        policy_id: value.policy_id!,
        customer_id: value.customer_id!,
        claim_type: value.claim_type!,
        incident_date: value.incident_date!,
        description: value.description!.trim(),
        estimated_loss: value.estimated_loss!,
      })
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          const claim = unwrapData(response);

          if (this.rememberCustomer) {
            saveCustomerId(value.customer_id!);
          }

          this.router.navigate([this.basePath, claim.claim_id]);
        },
        error: (error: any) => {
          console.error('Unable to register the claim:', error);
          // 400 / 422 = the rule that failed, 503 = the Policy or Premium service is down
          this.errorMessage = getErrorMessage(error, 'The claim could not be registered.');
          this.cd.detectChanges();
        },
      });
  }
}