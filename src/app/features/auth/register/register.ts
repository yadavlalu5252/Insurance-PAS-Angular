
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  registerForm;

  constructor(private fb: FormBuilder) {
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
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    if (this.f.password.value !== this.f.confirmPassword.value) {
      return;
    }

    // Backend registration will be connected next.
    console.log('Registration form is valid');
  }
}
