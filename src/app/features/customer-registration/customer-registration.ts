import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerRegistrationService } from '../../core/services/customer-registration';

@Component({
  selector: 'app-customer-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-registration.html',
  styleUrl: './customer-registration.scss'
})
export class CustomerRegistration {
  currentStep = 1;
  customerId: number | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;
  documentType = '';

  customer: any = {
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    occupation: '',
    annual_income: 0,
    mobile_number: '',
    email: ''
  };

  address: any = {
    address_type: 'Permanent',
    address_line1: '',
    address_line2: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: ''
  };

  nominee: any = {
    nominee_name: '',
    relationship: '',
    date_of_birth: '',
    mobile_number: '',
    share_percentage: 100
  };

  constructor(private customerService: CustomerRegistrationService) {}

  createCustomer(): void {
    if (this.loading) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.customer.first_name || !this.customer.last_name || !this.customer.date_of_birth || !this.customer.gender || !this.customer.marital_status || !this.customer.occupation || !this.customer.mobile_number || !this.customer.email || this.customer.annual_income < 0) {
      this.errorMessage = 'Please fill all required customer details.';
      return;
    }

    this.loading = true;

    this.customerService.createCustomer(this.customer).subscribe({
      next: (response: any) => {
        const data = response?.data ?? response?.result ?? response;
        this.customerId = data?.customer_id ?? data?.customerId ?? data?.id ?? null;
        this.loading = false;

        if (this.customerId !== null) {
          this.successMessage = 'Customer created successfully.';
          this.currentStep = 2;
        } else {
          this.errorMessage = 'Customer created, but the customer ID was not found in the response.';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? error?.error?.title ?? 'Failed to create customer.';
        console.error(error);
      }
    });
  }

  addAddress(): void {
    if (this.customerId === null) {
      this.errorMessage = 'Create the customer first.';
      return;
    }

    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.customerService.addAddress(this.customerId, this.address).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Address added successfully.';
        this.currentStep = 3;
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Failed to add address.';
        console.error(error);
      }
    });
  }

  addNominee(): void {
    if (this.customerId === null) {
      this.errorMessage = 'Create the customer first.';
      return;
    }

    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.customerService.addNominee(this.customerId, this.nominee).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Nominee added successfully.';
        this.currentStep = 4;
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Failed to add nominee.';
        console.error(error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadDocument(): void {
    if (this.customerId === null) {
      this.errorMessage = 'Create the customer first.';
      return;
    }

    if (!this.selectedFile || !this.documentType) {
      this.errorMessage = 'Select a document type and file.';
      return;
    }

    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.customerService.uploadDocument(this.customerId, this.documentType, this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Document uploaded successfully.';
        this.selectedFile = null;
        this.documentType = '';
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Document upload failed.';
        console.error(error);
      }
    });
  }

  previousStep(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
