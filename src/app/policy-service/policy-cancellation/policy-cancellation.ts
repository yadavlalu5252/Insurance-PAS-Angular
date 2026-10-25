import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CancelService } from '../cancel-service';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-policy-cancellation',
  styleUrl: './policy-cancellation.scss',
  templateUrl: './policy-cancellation.html',
})
export class PolicyCancellation {

  constructor(private service: CancelService) {
    this.getallpolicies();
  }

  cancelform = new FormGroup({
    policyId: new FormControl(''),
    CancellationReason: new FormControl('')

  })

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
  isModalOpen: boolean = false;


  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }



  cancel(data: any) {
    if (!data.CancellationReason) {
      alert("Cancellation reason required.");
      return;
    }

    const payload = {
      CancellationReason: data.CancellationReason,
      ApprovedBy: 0
    };
    this.service.cancelPolicies(data.policyId, data).subscribe({
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



  policydetails: any
  details(id: Number) {
    this.service.getcancel(id).subscribe({
      next: res => {
        this.policydetails = res;
      },
      error: err => {
        console.log(err);
      }
    })
  }



}
