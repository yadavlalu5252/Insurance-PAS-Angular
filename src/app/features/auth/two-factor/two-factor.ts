import { Component } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-two-factor',
  templateUrl: './two-factor.html',
  styleUrl: './two-factor.scss'
})
export class TwoFactor {
  constructor(private service: Auth, private router: Router) {
    this.challengeToken = history.state?.challengeToken || '';
  }

  challengeToken: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  twoFactorForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ])
  });

  VerifyTwoFactor(data: any): void {
    this.errorMessage = '';

    if (!this.challengeToken) {
      this.errorMessage = 'Verification session expired. Please log in again.';
      return;
    }

    if (this.twoFactorForm.invalid) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const request = {
      challenge_token: this.challengeToken,
      code: data.code
    };

    this.service.verifyTwoFactorLogin(request).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (!res.access_token || !res.refresh_token) {
          this.errorMessage = 'Authentication tokens were not received.';
          console.error('Unexpected authentication response:', res);
          return;
        }

        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);

        console.log('Two-factor verification successful.');
        console.log('Access token saved:', !!localStorage.getItem('access_token'));

        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Two-factor verification failed:', err);

        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Invalid verification code. Please try again.';

        this.loading = false;
      }
    });
  }
}