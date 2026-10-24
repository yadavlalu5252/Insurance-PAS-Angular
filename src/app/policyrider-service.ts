import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class PolicyriderService {
  http = inject(HttpClient)

  riderurl = "https://localhost:7130api/v1/service-requests/policies/{policyId}/riders"
  fetchriders(id: any) {
    return this.http.get<any>(`${this.riderurl}?policyId=${id}`);
  }
}
