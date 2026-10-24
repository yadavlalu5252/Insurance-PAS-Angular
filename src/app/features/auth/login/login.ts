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

    
    const credentials = this.loginForm.getRawValue();
    
    this.authService.login(credentials.username, credentials.password).subscribe({
      next: (response: any) => {
        this.loading = false;

        if (response.requires_two_factor && response.challenge_token) {
          this.router.navigate(['/two-factor'], {
            state: {
              challengeToken: response.challenge_token
            }
          });
          return;
        }

        if (!response.requires_two_factor && response.login?.access_token) {
          localStorage.setItem('access_token', response.login.access_token);
          localStorage.setItem('refresh_token', response.login.refresh_token);

          this.router.navigate(['/two-factor-setup']);
          return;
        }

        this.errorMessage = 'Unexpected login response. Please try again.';
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
