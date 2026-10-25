
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Policy {
  policy_id: number;
  policy_number: string;
  customer_id: number;
  customer_name: string;
  quote_id: number;
  product_id: number;
  product_name: string;
  underwriting_id: number;
  issue_date: string;
  effective_date: string;
  expiry_date: string;
  premium_amount: number;
  policy_status: string;
}

export interface PolicyRequest {
  policy_number?: string;
  customer_id: number;
  quote_id: number;
  product_id: number;
  underwriting_id: number;
  issue_date: string;
  effective_date: string;
  expiry_date: string;
  premium_amount: number;
  policy_status?: string;
}

export interface ApiMessage {
  message?: string;
  msg?: string;
}

export interface EndorsementRow {
  endorsement_id: number;
  policy_id: number;
  endorsement_number?: string;
  endorsement_type: string;
  old_values?: string;
  new_values?: string;
  status?: string;
  approved_by?: string;
  created_date?: string;
  approved_date?: string;
}

export interface EndorsementRequest {
  endorsement_type: string;
  old_values?: string;
  new_values: string;
}

export interface ClosureRow {
  policy_closure_id: number;
  policy_id: number;
  closure_reason: string;
  requested_by: string;
  remarks?: string;
  closure_status?: string;
  requested_at?: string;
  refund_amount?: number;
  rejection_reason?: string;
}

export interface ClosureRequest {
  policy_id: number;
  closure_reason: string;
  requested_by: string;
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private readonly http = inject(HttpClient);

  private readonly baseApi = 'https://localhost:7129/api/v1';
  private readonly policyUrl = `${this.baseApi}/policies`;
  private readonly closureUrl = 'https://localhost:7129/policyclosures';

  private headers(): HttpHeaders {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.policyUrl, {
      headers: this.headers()
    });
  }

  getPolicyById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.policyUrl}/${id}`, {
      headers: this.headers()
    });
  }

  addPolicy(data: PolicyRequest): Observable<Policy> {
    return this.http.post<Policy>(this.policyUrl, data, {
      headers: this.headers()
    });
  }

  updatePolicy(id: number, data: PolicyRequest): Observable<Policy> {
    return this.http.put<Policy>(`${this.policyUrl}/${id}`, data, {
      headers: this.headers()
    });
  }

  cancelPolicy(id: number): Observable<ApiMessage> {
    return this.http.put<ApiMessage>(
      `${this.policyUrl}/${id}/cancel`,
      {},
      { headers: this.headers() }
    );
  }

  activatePolicy(id: number): Observable<ApiMessage> {
    return this.http.put<ApiMessage>(
      `${this.policyUrl}/${id}/activate`,
      {},
      { headers: this.headers() }
    );
  }

  suspendPolicy(id: number): Observable<ApiMessage> {
    return this.http.put<ApiMessage>(
      `${this.policyUrl}/${id}/suspend`,
      {},
      { headers: this.headers() }
    );
  }

  expirePolicy(id: number): Observable<ApiMessage> {
    return this.http.put<ApiMessage>(
      `${this.policyUrl}/${id}/expire`,
      {},
      { headers: this.headers() }
    );
  }

  getDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.policyUrl}/${id}/document`, {
      headers: this.headers(),
      responseType: 'blob'
    });
  }

  regenerateDocument(id: number): Observable<unknown> {
    return this.http.post(
      `${this.policyUrl}/${id}/document/regenerate`,
      {},
      { headers: this.headers() }
    );
  }

  getEndorsements(id: number): Observable<EndorsementRow[]> {
    return this.http.get<EndorsementRow[]>(
      `${this.policyUrl}/${id}/endorsements`,
      { headers: this.headers() }
    );
  }

  createEndorsement(
    id: number,
    data: EndorsementRequest
  ): Observable<EndorsementRow> {
    return this.http.post<EndorsementRow>(
      `${this.policyUrl}/${id}/endorsements`,
      data,
      { headers: this.headers() }
    );
  }

  approveEndorsement(id: number): Observable<ApiMessage> {
    return this.http.put<ApiMessage>(
      `${this.baseApi}/endorsements/${id}/approve`,
      {},
      { headers: this.headers() }
    );
  }

  rejectEndorsement(id: number): Observable<ApiMessage> {
    return this.http.put<ApiMessage>(
      `${this.baseApi}/endorsements/${id}/reject`,
      {},
      { headers: this.headers() }
    );
  }

  getClosures(): Observable<ClosureRow[]> {
    return this.http.get<ClosureRow[]>(this.closureUrl, {
      headers: this.headers()
    });
  }

  getPendingClosures(): Observable<ClosureRow[]> {
    return this.http.get<ClosureRow[]>(`${this.closureUrl}/pending`, {
      headers: this.headers()
    });
  }

  getClosureById(id: number): Observable<ClosureRow> {
    return this.http.get<ClosureRow>(`${this.closureUrl}/${id}`, {
      headers: this.headers()
    });
  }

  createClosure(data: ClosureRequest): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(this.closureUrl, data, {
      headers: this.headers()
    });
  }

  approveClosure(
    id: number,
    approvedBy: string,
    refundAmount?: number
  ): Observable<ApiMessage> {
    let params = new HttpParams().set('approvedBy', approvedBy);

    if (refundAmount !== undefined && refundAmount !== null) {
      params = params.set('refundAmount', refundAmount);
    }

    return this.http.put<ApiMessage>(
      `${this.closureUrl}/${id}/approve`,
      {},
      { headers: this.headers(), params }
    );
  }

  rejectClosure(
    id: number,
    reason: string,
    rejectedBy: string
  ): Observable<ApiMessage> {
    const params = new HttpParams()
      .set('rejectionReason', reason)
      .set('rejectedBy', rejectedBy);

    return this.http.put<ApiMessage>(
      `${this.closureUrl}/${id}/reject`,
      {},
      { headers: this.headers(), params }
    );
  }
}
