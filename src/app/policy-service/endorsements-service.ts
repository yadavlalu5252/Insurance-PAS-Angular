import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable, Service } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EndorsementsService {
  http = inject(HttpClient)
  endorsementsurl = "https://localhost:7130/api/v1/endorsements"
  getendorsements() {
    return this.http.get<any>(this.endorsementsurl);
  }

  approveurl = "https://localhost:7130/api/v1/endorsements/{id}/approve"
  approveendorsements(id: any) {
    return this.http.post<any>(`${this.approveurl}?id=${id}`, {});
  }

  rejecturl = "https://localhost:7130/api/v1/endorsements/{id}/reject"
  rejectendorsements(id: any) {
    return this.http.post<any>(`${this.rejecturl}?id=${id}`, {});
  }

}
