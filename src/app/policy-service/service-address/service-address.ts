import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceRequest } from '../service-request';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-service-address',
  styleUrl: './service-address.scss',
  templateUrl: './service-address.html',
})
export class ServiceAddress {
  constructor(private service: ServiceRequest) {
    this.getallpolicies();

  }


  addressForm = new FormGroup({
    policyId: new FormControl(''),
    address_id: new FormControl(0),
    customer_id: new FormControl(0),
    address_type: new FormControl('Permanent'),
    address_line1: new FormControl(''),
    address_line2: new FormControl(''),
    city: new FormControl(''),
    district: new FormControl(''),
    state: new FormControl(''),
    country: new FormControl(''),
    pincode: new FormControl('')
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


  SaveAddress(data: any) {
    if (!data.policyId) {
      alert("Please select a policy");
      return;
    }
    const specificPayload = {
      AddressType: data.address_type,
      HouseNo: data.address_line1,
      Street: data.address_line2,
      City: data.city,
      District: data.district,
      State: data.state,
      Country: data.country,
      PinCode: data.pincode
    };

    const finalRequest = {
      policyId: Number(data.policyId),
      endorsementType: 'Address Change',
      payloadJson: JSON.stringify(specificPayload)
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
