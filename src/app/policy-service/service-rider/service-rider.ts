import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceRequest } from '../service-request';
import { PolicyriderService } from '../policyrider-service';


@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-service-rider',
  styleUrl: './service-rider.scss',
  templateUrl: './service-rider.html',
})
export class ServiceRider {
  constructor(private service: ServiceRequest, private policyservice: PolicyriderService) {
    this.getallpolicies();

  }
  riderForm = new FormGroup({
    policyId: new FormControl(''),
    rider_id: new FormControl(''),
    action: new FormControl('Rider Addition')
  });

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



  riders: any[] = [];
  getpolicyRiders() {
    const id = this.riderForm.value.policyId

    if (!id) {
      alert("please select a policyId");
      return;
    }

    this.policyservice.fetchriders(id).subscribe({
      next: res => {
        this.riders = res;
      },
      error: err => {
        alert(err);
      }

    })
  }



  SaveRiders(data: any) {
    if (!data.policyId) {
      alert("please select a policy");
      return;
    }
    const specificPayload = {
      RiderId: data.rider_id,
      Action: data.action
    };

    const finalRequest = {
      policyId: Number(data.policyId),
      endorsementType: data.action,
      payloadJson: JSON.stringify(specificPayload)
    };

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
