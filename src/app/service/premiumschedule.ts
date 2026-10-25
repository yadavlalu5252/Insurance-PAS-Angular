import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PremiumScheduleService {

  private apiUrl =
    'https://localhost:5127/api/v1/premium-schedules';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // POST
  // /api/v1/premium-schedules/internal/generate
  generatePremiumSchedule(dto: any): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/internal/generate`,
      dto,
      {
        headers: this.getHeaders()
      }
    );
  }

  // GET
  // /api/v1/premium-schedules/{policy_id}
  getPremiumScheduleByPolicyId(
    policyId: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${policyId}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // PUT
  // /api/v1/premium-schedules/{schedule_id}
  updatePremiumSchedule(
    scheduleId: number,
    dto: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${scheduleId}`,
      dto,
      {
        headers: this.getHeaders()
      }
    );
  }

  // POST
  // /api/v1/premium-schedules/internal/update-overdue
  updateOverdueSchedules(
    dailyPenaltyRate: number,
    maxLateFee: number
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/internal/update-overdue`,
      null,
      {
        headers: this.getHeaders(),
        params: {
          dailyPenaltyRate: dailyPenaltyRate,
          maxLateFee: maxLateFee
        }
      }
    );
  }

  // PUT
  // /api/v1/premium-schedules/{schedule_id}/payment
  updateScheduleAfterPayment(
    scheduleId: number,
    dto: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${scheduleId}/payment`,
      dto,
      {
        headers: this.getHeaders()
      }
    );
  }
}