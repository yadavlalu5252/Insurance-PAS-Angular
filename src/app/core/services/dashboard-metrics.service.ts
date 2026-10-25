import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalRoles: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  traceId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardMetricsService {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7193/api/v1/dashboard-metrics';

  getDashboardMetrics(): Observable<ApiResponse<DashboardMetrics>> {

    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('accessToken') ||
      sessionStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });

    return this.http.get<ApiResponse<DashboardMetrics>>(
      this.apiUrl,
      { headers }
    );
  }
}
