
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<ApiResponse<DashboardMetrics>>(this.apiUrl);
  }
}
