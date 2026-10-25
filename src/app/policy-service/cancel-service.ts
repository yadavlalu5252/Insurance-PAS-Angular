import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CancelService {
  http = inject(HttpClient);

  urlpol = "https://localhost:7130/api/v1/service-requests/my-policies"
  getpoliciesbyId() {
    return this.http.get<any>(this.urlpol);
  }


  cancelurl = "https://localhost:7130/api/v1/policies"
  cancelPolicies(id: any, data: any) {
    return this.http.post<any>(`${this.cancelurl}/${id}/cancel`, data);
  }

  getcancelurl = "https://localhost:7130/api/v1/cancellations"
  getcancel(id: any) {
    return this.http.get<any>(`${this.getcancelurl}/${id}`);
  }


}
