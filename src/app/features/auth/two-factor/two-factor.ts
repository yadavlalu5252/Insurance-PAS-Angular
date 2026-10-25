import { Component } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-two-factor',
  templateUrl: './two-factor.html',
  styleUrl: './two-factor.scss'
})
export class TwoFactor {

  challengeToken = '';
  loading = false;
  errorMessage = '';

  twoFactorForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ])
  });

  constructor(
    private service: Auth,
    private router: Router
  ) {
    this.challengeToken = history.state?.challengeToken || '';
  }

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

        // Support both token naming formats.
        const accessToken = res.access_token || res.accessToken;
        const refreshToken = res.refresh_token || res.refreshToken;
        const role = res.role_name || res.roleName;

        if (!accessToken || !role) {
          this.errorMessage = 'Access token or role was not received.';
          return;
        }

        // Save authentication details.
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('role_name', role);

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        // Navigate according to the user's role.
        if (role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'Customer') {
          this.router.navigate(['/customer-dashboard']);
        } else if (role === 'Agent') {
          this.router.navigate(['/agent-dashboard']);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('role_name');

          this.errorMessage = 'User role not recognized.';
        }
      },

      error: (err) => {
        console.error('Two-factor verification failed:', err);

        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : 'Invalid verification code. Please try again.';

        this.loading = false;
      }
    });
  }
}
