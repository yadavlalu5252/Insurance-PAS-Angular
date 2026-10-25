import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceRequest {
  http = inject(HttpClient);
  url = "https://localhost:7130/api/v1/service-requests"
  createServiceRequest(data: any) {
    return this.http.post<any>(this.url, data);
  }

  urlpol = "https://localhost:7130/api/v1/service-requests/my-policies"
  getpoliciesbyId() {
    return this.http.get<any>(this.urlpol);
  }
}
