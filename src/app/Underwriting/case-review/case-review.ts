
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-case-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-review.html'
})
export class CaseReview {
  loading = false;
  errorMessage = '';

  underwritingCase: any = null;
  medicalDetails: any = null;
  riskScore: any = null;
  decision: any = null;
}
