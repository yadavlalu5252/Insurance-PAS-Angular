import { Component } from '@angular/core';
import { RenewalService } from '../renewal-service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-policy-renewal',
  styleUrl: './policy-renewal.scss',
  templateUrl: './policy-renewal.html',
})
export class PolicyRenewal {


  constructor(private service: RenewalService) {
    this.getallpolicies();
  }

  isModalOpen: boolean = false;

  renewalform = new FormGroup({
    policyId: new FormControl(''),
    NewExpiryDate: new FormControl('')

  })

  renew(data: any) {
    if (!data.policyId || !data.NewExpiryDate) {
      alert("Please select a policy and a new expiry date.");
      return;
    }

    this.service.renewpolicy(data.policyId, data).subscribe({
      next: res => {
        alert(res.Message);
        this.closeModal();
        this.details(data.policyId);
      },
      error: err => {
        console.log(err?.error.Error);
      }
    });
  }
  allpolicies: any;
  getallpolicies() {
    this.service.getpoliciesbyId().subscribe({
      next: res => {
        this.allpolicies = res;
      },
      error: err => {
        console.log(err);
      }
    })
  }

  policydetails: any
  details(id: Number) {
    this.service.policydetails(id).subscribe({
      next: res => {
        this.policydetails = res;
      },
      error: err => {
        console.log(err);
      }
    })
  }


  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }



}
