
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CustomerDashboardMetrics {
  totalCustomers: number;
  newCustomersToday: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customersByCity: {
    city: string;
    totalCustomers: number;
  }[];
  pendingKycCustomers: number;
}

export interface CustomerDashboardResponse {
  success: boolean;
  message: string;
  data: CustomerDashboardMetrics;
  errors: any;
  traceId: string | null;
}

export interface CustomerRecord {
  customer_id: number;
  customer_code: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  mobile_number: string;
  email: string;
  customer_status: string;
  created_at: string;
  city?: string | null;
}

export interface CustomerListResponse {
  success: boolean;
  message: string;
  data: CustomerRecord[];
  errors: any;
  traceId: string | null;
}

export interface PolicyRecord {
  policy_id: number;
  customer_id: number;
  product_id: number;
  product_name: string;
  policy_status: string;
}

export interface ProductRecord {
  product_id: number;
  product_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerDashboardService {
  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7128/api/customers';
  private policyApiUrl = 'https://localhost:7130/api/v1/policies';
  private productApiUrl = 'https://localhost:7129/api/v1/insurance-products';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  getCustomerDashboard(): Observable<CustomerDashboardResponse> {
    return this.http.get<CustomerDashboardResponse>(
      `${this.apiUrl}/dashboard`,
      { headers: this.getHeaders() }
    );
  }

  getAllCustomers(): Observable<CustomerListResponse> {
    return this.http.get<CustomerListResponse>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getAllPolicies(): Observable<PolicyRecord[]> {
    return this.http.get<PolicyRecord[]>(
      this.policyApiUrl,
      { headers: this.getHeaders() }
    );
  }

  getAllProducts(): Observable<any> {
    return this.http.get<any>(
      this.productApiUrl,
      { headers: this.getHeaders() }
    );
  }
}
