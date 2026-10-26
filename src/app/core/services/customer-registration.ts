
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerRegistrationService {
  private baseUrl = 'https://localhost:7204/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  createCustomer(customer: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers`, customer, { headers: this.getHeaders() });
  }

  addAddress(customerId: number, address: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers/${customerId}/addresses`, address, { headers: this.getHeaders() });
  }

  addNominee(customerId: number, nominee: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers/${customerId}/nominees`, nominee, { headers: this.getHeaders() });
  }

  uploadDocument(customerId: number, documentType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/customers/${customerId}/documents`, formData, { headers: this.getHeaders() });
  }

  getCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers`, { headers: this.getHeaders() });
  }

  getCustomerById(customerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}`, { headers: this.getHeaders() });
  }

  updateCustomer(customerId: number, customer: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/customers/${customerId}`, customer, { headers: this.getHeaders() });
  }

  deleteCustomer(customerId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/customers/${customerId}`, { headers: this.getHeaders() });
  }

  getAddresses(customerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}/addresses`, { headers: this.getHeaders() });
  }

  getNominees(customerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}/nominees`, { headers: this.getHeaders() });
  }

  getDocuments(customerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}/documents`, { headers: this.getHeaders() });
  }
}
