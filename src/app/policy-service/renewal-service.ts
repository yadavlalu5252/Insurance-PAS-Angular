import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class RenewalService {
  http = inject(HttpClient)




  renewservice = "https://localhost:7130/api/v1/policies";

  renewpolicy(id: any, data: any) {
    const payload = { NewExpiryDate: new Date(data.NewExpiryDate).toISOString() };

    return this.http.post<any>(`${this.renewservice}/${id}/renew`, payload);
  }
  policyurl = "https://localhost:7130/api/v1/renewals"
  policydetails(id: any) {
    return this.http.get<any>(`${this.policyurl}/${id}`)
  }

  urlpol = "https://localhost:7130/api/v1/service-requests/my-policies"
  getpoliciesbyId() {
    return this.http.get<any>(this.urlpol);
  }


}
