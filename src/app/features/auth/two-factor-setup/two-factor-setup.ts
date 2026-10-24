import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import { Auth } from '../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-two-factor-setup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './two-factor-setup.html',
  styleUrl: './two-factor-setup.scss'
})
export class TwoFactorSetup implements OnInit {
  constructor(private service: Auth, private router: Router,private cdr: ChangeDetectorRef) {}

  qrCodeImage: string = '';
  sharedKey: string = '';
  loading: boolean = false;
  setupLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  twoFactorForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ])
  });

  ngOnInit(): void {
    this.setupTwoFactor();
  }

  setupTwoFactor(): void {
    this.setupLoading = true;
    this.errorMessage = '';

    this.service.setupTwoFactor().subscribe({
      next: async (res: any) => {
        console.log('2FA setup response received');

        try {
          if (!res?.otpauth_url) {
            throw new Error('otpauth_url is missing.');
          }

          this.sharedKey = res.shared_key || '';

          this.qrCodeImage = await QRCode.toDataURL(res.otpauth_url, {
            width: 220,
            margin: 2
          });

          console.log('QR code generated successfully');
        } catch (error) {
          console.error('QR generation failed:', error);
          this.errorMessage = 'Unable to generate QR code.';
        } finally {
  this.setupLoading = false;
  this.cdr.detectChanges();

  console.log('setupLoading:', this.setupLoading);
  console.log('QR image available:', !!this.qrCodeImage);
}
      },
      error: (err) => {
        console.error('2FA setup failed:', err);

        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : 'Unable to start two-factor setup. Please try again.';

        this.setupLoading = false;
      }
    });
  }

  enableTwoFactor(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.twoFactorForm.invalid) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const code = this.twoFactorForm.controls.code.value || '';

    this.service.enableTwoFactor(code).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Two-factor authentication enabled successfully.';
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('2FA enable failed:', err);

        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : 'Invalid authenticator code. Please try again.';

        this.loading = false;
      }
    });
  }
}