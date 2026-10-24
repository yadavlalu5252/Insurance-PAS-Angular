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

  }

  nomineeForm = new FormGroup({
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


}
