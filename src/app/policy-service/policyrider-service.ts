import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PolicyriderService {
  http = inject(HttpClient)

  riderurl = "https://localhost:7130/api/v1/service-requests/policies/{policyId}/riders"
  fetchriders(id: any) {
    return this.http.get<any>(`${this.riderurl}?policyId=${id}`);
  }
}
