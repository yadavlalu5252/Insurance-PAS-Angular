import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceRequest } from '../service-request';
import { OtpContactpolicy } from '../otp-contactpolicy';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-service-contact',
  styleUrl: './service-contact.scss',
  templateUrl: './service-contact.html',
})
export class ServiceContact {
  constructor(private service: ServiceRequest, private otpservice: OtpContactpolicy) {
    this.getallpolicies();
  }

  contactForm = new FormGroup({
    policyId: new FormControl(''),
    mobile_number: new FormControl(''),
    email: new FormControl(''),
    otpCode: new FormControl('')
  });

  SendOtp() {
    const email = this.contactForm.value.email;
    if (!email) {
      alert("Please enter an email first");
      return;
    }

    this.otpservice.sendOtp(email).subscribe({
      next: res => {
        alert(res.message);
      },
      error: err => {
        console.log(err.message);
      }
    })

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

  SaveContact(data: any) {
    if (!data.policyId) {
      alert("Please select a specific policy");
      return;
    }

    const specificPaylod = {
      MobileNumber: data.mobile_number,
      EmailAddress: data.email,
      OtpCode: data.otpCode
    };

    const finalRequest = {
      policyId: Number(data.policyId),
      endorsementType: "Contact Update",
      payloadJson: JSON.stringify(specificPaylod)
    }

    this.service.createServiceRequest(finalRequest).subscribe({
      next: res => {
        alert(res.message);
      },
      error: err => {
        console.log(err.message);
      }
    });


  }


}
