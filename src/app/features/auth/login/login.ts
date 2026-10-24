import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  showPassword = false;
  submitted = false;
  loading = false;
  errorMessage = '';

  loginForm;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.loginForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);

        if (response.requires_two_factor && response.challenge_token) {
          this.loading = false;

          this.router.navigate(['/two-factor'], {
            state: {
              challengeToken: response.challenge_token
            }
          });
          return;
        }

        const loginData = response.login ?? response;

        if (loginData.access_token || loginData.accessToken) {
          const accessToken = loginData.access_token ?? loginData.accessToken;
          const refreshToken = loginData.refresh_token ?? loginData.refreshToken;

          localStorage.setItem('access_token', accessToken);

          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }

          this.loading = false;

          // Navigate to the next required page.
          if (response.requires_two_factor_setup === true || response.requires_two_factor_setup === undefined) {
            this.router.navigate(['/two-factor-setup']);
          } else {
            this.router.navigate(['/reports']);
          }

          return;
        }

        this.loading = false;
        this.errorMessage = 'Unexpected login response. Check the browser console.';
      },
      error: (error) => {
        console.error('Login failed:', error);

        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : error.error?.message || 'Login failed. Please check your credentials and try again.';

        this.loading = false;
      }
    });
  }
}
