import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ApiResponse, Claim, ClaimDocument, ClaimFilter, ClaimHistory, CreateClaim,
  PagedResult, Settlement, SettlementAdvice, UpdateClaim
} from './Models/agent-claim.models';


// Claim API. If your team already has this address in an environment file, use that instead.
const CLAIM_API = 'https://localhost:7129/api/v1';

@Injectable({ providedIn: 'root' })
export class AgentClaimService {
  http = inject(HttpClient);

  url = CLAIM_API + '/claims';

  GetAll(filter: ClaimFilter) {
    let params = new HttpParams();

    // only send the filters that have a value
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ApiResponse<PagedResult<Claim>>>(this.url, { params });
  }

  GetById(id: number) {
    return this.http.get<ApiResponse<Claim>>(`${this.url}/${id}`);
  }

  GetHistory(id: number) {
    return this.http.get<ApiResponse<ClaimHistory[]>>(`${this.url}/${id}/history`);
  }

  Add(body: CreateClaim) {
    return this.http.post<ApiResponse<Claim>>(this.url, body);
  }

  Update(id: number, body: UpdateClaim) {
    return this.http.put<ApiResponse<null>>(`${this.url}/${id}`, body);
  }

  Cancel(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`);
  }

  GetDocuments(id: number) {
    return this.http.get<ApiResponse<ClaimDocument[]>>(`${this.url}/${id}/documents`);
  }

  UploadDocument(id: number, name: string, file: File) {
    // sent as a form, because the API receives a file
    const form = new FormData();
    form.append('document_name', name);
    form.append('file', file);
    return this.http.post<ApiResponse<ClaimDocument>>(`${this.url}/${id}/documents`, form);
  }

  GetSettlement(id: number) {
    return this.http.get<ApiResponse<Settlement>>(`${this.url}/${id}/settlement`);
  }

  GetAdvice(id: number) {
    return this.http.get<ApiResponse<SettlementAdvice>>(`${this.url}/${id}/settlement/advice`);
  }
}