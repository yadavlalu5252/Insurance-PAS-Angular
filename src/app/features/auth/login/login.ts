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

        // Check whether two-factor verification is required.
        if (response.requires_two_factor && response.challenge_token) {
          this.loading = false;

          this.router.navigate(['/two-factor'], {
            state: {
              challengeToken: response.challenge_token
            }
          });
          return;
        }

        // Get the access token.
        const token = response.access_token || response.accessToken;

        if (!token) {
          this.errorMessage = 'Access token was not received.';
          return;
        }

        // Save the access token.
        localStorage.setItem('accessToken', token);

        // Get the role from the response or JWT token.
        let role = response.role_name || response.roleName;

        if (!role) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            role =
              payload['role'] ||
              payload['role_name'] ||
              payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          } catch {
            this.errorMessage = 'Unable to read the login token.';
            return;
          }
        }

        if (!role) {
          this.errorMessage = 'User role was not received.';
          return;
        }

        // Save the role for the role guard.
        localStorage.setItem('role_name', role);

        // Navigate according to the user's role.
        if (role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'Customer') {
          this.router.navigate(['/customer-dashboard']);
        } else if (role === 'Agent') {
          this.router.navigate(['/agent-dashboard']);
        } else {
          this.errorMessage = 'User role not recognized.';
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
            : 'Login failed. Please check your credentials and try again.';
            : error.error?.message || 'Login failed. Please check your credentials and try again.';

        this.loading = false;
      }
    });
  }
}
