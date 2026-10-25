import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  registerForm;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router
  ) {
    this.registerForm = this.fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['Customer', Validators.required]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    if (this.f.password.value !== this.f.confirmPassword.value) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.f.role.value !== 'Customer') {
      this.errorMessage = 'Public registration currently supports Customer accounts only.';
      return;
    }

    this.loading = true;

    const request = {
      employee_id: 0,
      username: this.f.fullName.value.trim(),
      password: this.f.password.value,
      email: this.f.email.value.trim(),
      mobile: this.f.phone.value,
      role_id: 0,
      branch_id: 1
    };

    this.auth.register(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response || 'Registration successful. Please log in.';
        this.errorMessage = '';

        this.registerForm.reset({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'Customer'
        });

        this.submitted = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration failed:', err);

        if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}