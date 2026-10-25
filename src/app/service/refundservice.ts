import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefundService {

  private apiUrl = 'https://localhost:5127/api/v1/refunds';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // POST /api/v1/refunds
  createRefund(dto: {
    payment_id: number;
    refund_amount: number;
  }): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      dto,
      { headers: this.getHeaders() }
    );
  }

  // GET /api/v1/refunds/{refundId}
  getRefund(refundId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${refundId}`,
      { headers: this.getHeaders() }
    );
  }

  // PUT /api/v1/refunds/{refundId}/approve
  approveRefund(
    refundId: number,
    dto: { approved_by: number }
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${refundId}/approve`,
      dto,
      { headers: this.getHeaders() }
    );
  }
}