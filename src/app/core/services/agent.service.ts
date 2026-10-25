
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  private readonly baseUrl = 'https://localhost:7129/api/v1/agents';
  private readonly paymentUrl = 'https://localhost:7129/api/v1/payments/payouts';

  constructor(private http: HttpClient) {}

  // Get customers assigned to an agent
  getCustomers(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${agentId}/customers`
    );
  }

  // Get policies assigned to an agent
  getPolicies(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${agentId}/policies`
    );
  }

  // Get commissions for an agent
  getCommissions(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${agentId}/commissions`
    );
  }

  // Get payment payout records
  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.paymentUrl);
  }
}
