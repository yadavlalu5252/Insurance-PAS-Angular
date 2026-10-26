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

  constructor(
    private service: Auth,
    private router: Router
  ) {
    this.challengeToken = history.state?.challengeToken || '';
  }

  twoFactorForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ])
  });

  VerifyTwoFactor(): void {
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
      code: this.twoFactorForm.controls.code.value ?? ''
    };

    this.service.verifyTwoFactorLogin(request).subscribe({
      next: (res: any) => {
        this.loading = false;

        console.log('Two-factor verification response:', res);

        const loginData = res.login ?? res;

        const accessToken =
          loginData.access_token ?? loginData.accessToken;

        const refreshToken =
          loginData.refresh_token ?? loginData.refreshToken;

        const role =
          loginData.role_name ??
          loginData.roleName ??
          loginData.role;

        if (!accessToken || !refreshToken) {
          this.errorMessage = 'Authentication tokens were not received.';
          console.error('Unexpected authentication response:', res);
          return;
        }

        if (!role) {
          this.errorMessage = 'User role was not received.';
          console.error('Role missing from authentication response:', res);
          return;
        }

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('role_name', role);

        console.log('Two-factor verification successful.');

        const normalizedRole = String(role).toLowerCase();

        if (normalizedRole === 'admin') {
          this.router.navigate(['/admin'], { replaceUrl: true });
        } else if (normalizedRole === 'customer') {
          this.router.navigate(['/customer'], { replaceUrl: true });
        } else if (normalizedRole === 'agent') {
          this.router.navigate(['/agent'], { replaceUrl: true });
        } else {
          localStorage.removeItem('access_token');
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
            : err.error?.message ||
              'Invalid verification code. Please try again.';

        this.loading = false;
      }
    });
  }
}
