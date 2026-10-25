import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceRequest } from '../service-request';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-service-nominee',
  styleUrl: './service-nominee.scss',
  templateUrl: './service-nominee.html',
})
export class ServiceNominee {
  constructor(private service: ServiceRequest) {
    this.getallpolicies();

  }

  nomineeForm = new FormGroup({
    policyId: new FormControl(''),
    nominee_id: new FormControl(0),
    customer_id: new FormControl(0),
    nominee_name: new FormControl(''),
    relationship: new FormControl(''),
    date_of_birth: new FormControl(''),
    mobile_number: new FormControl(''),
    share_percentage: new FormControl(100),
    guardian_name: new FormControl(null)
  });

  getData(data: any) {
    console.log(data);
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

  SaveNominee(data: any) {
    if (!data.policyId) {
      alert("please select a policy");
      return;
    }

    const specificPayload = {
      nominee_id: data.nominee_id,
      customer_id: data.customer_id,
      nominee_name: data.nominee_name,
      relationship: data.relationship,
      date_of_birth: data.date_of_birth,
      mobile_number: data.mobile_number,
      share_percentage: data.share_percentage,
      guardian_name: data.guardian_name
    }
    const finalRequest = {
      policyId: Number(data.policyId),
      endorsementType: "Nominee Change",
      payloadJson: JSON.stringify(specificPayload)

    }

    this.service.createServiceRequest(finalRequest).subscribe({
      next: res => {
        alert(res.message);
      },
      error: err => {
        console.log(err);
      }
    })
  }


}
