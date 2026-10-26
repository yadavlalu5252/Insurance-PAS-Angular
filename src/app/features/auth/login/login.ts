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

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        console.log('Login response:', response);

        const loginData = response.login ?? response;

        // Navigate to two-factor verification if required.
        if (loginData.requires_two_factor === true && loginData.challenge_token) {
          this.loading = false;

          this.router.navigate(['/two-factor'], {
            state: {
              challengeToken: loginData.challenge_token
            }
          });

          return;
        }

        const accessToken = loginData.access_token ?? loginData.accessToken;
        const refreshToken = loginData.refresh_token ?? loginData.refreshToken;

        // Navigate to two-factor setup if required.
        if (loginData.requires_two_factor_setup === true) {
          if (accessToken) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('accessToken', accessToken);
          }

          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }

          this.loading = false;

          this.router.navigate(['/two-factor-setup'], {
            replaceUrl: true
          });

          return;
        }

        if (!accessToken) {
          this.loading = false;
          this.errorMessage = 'Access token was not received.';
          return;
        }

        // Extract role from the response or JWT payload.
        let role =
          loginData.role_name ??
          loginData.roleName ??
          loginData.role;

        if (!role) {
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));

            role =
              payload['role'] ??
              payload['role_name'] ??
              payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          } catch {
            this.loading = false;
            this.errorMessage = 'Unable to read the login token.';
            return;
          }
        }

        if (!role) {
          this.loading = false;
          this.errorMessage = 'User role was not received.';
          return;
        }

        const normalizedRole = String(role).toLowerCase();

        // Store authentication information.
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('role_name', String(role));
        localStorage.setItem('user', JSON.stringify(loginData));

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        this.loading = false;

        // Navigate to the role-specific dashboard after login.
        if (normalizedRole === 'admin') {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        } else if (normalizedRole === 'agent') {
          this.router.navigate(['/agent/dashboard'], { replaceUrl: true });
        } else if (normalizedRole === 'customer') {
          this.router.navigate(['/customer/policies'], { replaceUrl: true });
        } else {
          this.authService.clearAuthentication();
          this.errorMessage = 'User role not recognized.';
        }
      },

      error: (error) => {
        console.error('Login failed:', error);

        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : error.error?.message ||
              'Login failed. Please check your credentials and try again.';

        this.loading = false;
      }
    });
  }
}
