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
      username: ['', [Validators.required]],
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

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.loading = false;

        // Check whether two-factor verification is required.
        if (response.requires_two_factor && response.challenge_token) {
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
      },

      error: (error) => {
        console.error('Login failed:', error);

        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : 'Login failed. Please check your credentials and try again.';

        this.loading = false;
      }
    });
  }
}
