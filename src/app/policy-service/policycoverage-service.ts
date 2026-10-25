import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class PolicycoverageService {
  http = inject(HttpClient);

  coverageurl = "https://localhost:7130api/v1/service-requests/policies/{policyId}/coverages"
  fetchcoverage(id: any) {
    return this.http.get<any>(`${this.coverageurl}?policyId=${id}`);
  }
}
