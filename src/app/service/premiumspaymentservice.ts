import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PremiumPaymentService {

  private apiUrl =
    'https://localhost:5127/api/PremiumPayment';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // =========================================================
  // CREATE PAYMENT
  // POST /api/PremiumPayment
  // =========================================================

  createPayment(dto: any): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      dto,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // GET ALL PAYMENTS
  // GET /api/PremiumPayment
  // =========================================================

  getPayments(): Observable<any> {

    return this.http.get<any>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // GET PAYMENT BY ID
  // GET /api/PremiumPayment/{paymentId}
  // =========================================================

  getPaymentById(paymentId: number): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${paymentId}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // VERIFY PAYMENT
  // POST /api/PremiumPayment/{paymentId}/verify
  // =========================================================

  verifyPayment(
    paymentId: number,
    dto: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/${paymentId}/verify`,
      dto,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // RETRY PAYMENT
  // POST /api/PremiumPayment/{paymentId}/retry
  // =========================================================

  retryPayment(paymentId: number): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/${paymentId}/retry`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // UPDATE PAYMENT STATUS
  // PUT /api/PremiumPayment/{paymentId}/status
  // =========================================================

  updatePaymentStatus(
    paymentId: number,
    dto: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${paymentId}/status`,
      dto,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // GET RECEIPT
  // GET /api/PremiumPayment/{paymentId}/receipt
  // =========================================================

  getReceipt(paymentId: number): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${paymentId}/receipt`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // DOWNLOAD RECEIPT
  // GET /api/PremiumPayment/{paymentId}/receipt/download
  // =========================================================

  downloadReceipt(paymentId: number): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/${paymentId}/receipt/download`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  // =========================================================
  // REGENERATE RECEIPT
  // POST /api/PremiumPayment/{paymentId}/receipt/regenerate
  // =========================================================

  regenerateReceipt(paymentId: number): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/${paymentId}/receipt/regenerate`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================================
  // PAYMENT HISTORY BY POLICY
  // GET /api/PremiumPayment/history/{policyId}
  // =========================================================

  getPaymentHistory(policyId: number): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/history/${policyId}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}