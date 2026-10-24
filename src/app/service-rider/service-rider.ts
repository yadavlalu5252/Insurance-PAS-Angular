import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-service-rider',
  styleUrl: './service-rider.scss',
  templateUrl: './service-rider.html',
})
export class ServiceRider {
  riderForm = new FormGroup({
    rider_id: new FormControl(0),
    action: new FormControl('Add')
  });
}
