import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-service-coverage',
  styleUrl: './service-coverage.scss',
  templateUrl: './service-coverage.html',
})
export class ServiceCoverage {
  coverageForm = new FormGroup({
    coverage_id: new FormControl(0),
    sum_insured: new FormControl(0)
  });

}
