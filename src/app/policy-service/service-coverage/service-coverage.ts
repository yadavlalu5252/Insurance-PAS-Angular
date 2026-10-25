import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceRequest } from '../service-request';
import { PolicycoverageService } from '../policycoverage-service';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-service-coverage',
  styleUrl: './service-coverage.scss',
  templateUrl: './service-coverage.html',
})
export class ServiceCoverage {
  constructor(private service: ServiceRequest, private coverageservice: PolicycoverageService) {
    this.getallpolicies();

  }

  coverageForm = new FormGroup({
    policyId: new FormControl(''),
    coverage_id: new FormControl(''),
    sum_insured: new FormControl(''),
    action: new FormControl('Coverage Increase')
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

  coverages: any[] = [];
  getpolicyCoverage() {
    const id = this.coverageForm.value.policyId

    if (!id) {
      alert("please select a policyId");
      return;
    }

    this.coverageservice.fetchcoverage(id).subscribe({
      next: res => {
        this.coverages = res;
      },
      error: err => {
        alert(err);
      }

    })

  }

  SaveCoverage(data: any) {
    if (!data.policyId) {
      alert("please select a policy");
      return;
    }
    const specificPayload = {

      CoverageId: data.coverage_id,
      NewSumInsured: data.sum_insured
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
