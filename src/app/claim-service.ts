import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface ClaimItem {
  claim_id: number;
  claim_number: string;
  policy_id: number;
  customer_id: number;
  claim_type: string;
  incident_date: string;
  claim_date: string;
  description?: string;
  estimated_loss: number;
  claim_status: string;
}

export interface CreateClaimRequest {
  policy_id: number;
  customer_id: number;
  claim_type: string;
  incident_date: string;
  description: string;
  estimated_loss: number;
}

export interface ClaimHistoryItem {
  history_id: number;
  claim_id: number;
  action: string;
  performed_by: number;
  action_date: string;
  remarks: string | null;
}

export interface ClaimDocumentItem {
  document_id: number;
  claim_id: number;
  document_name: string;
  verification_status: string;
  uploaded_date?: string;
}

export interface VerifyDocumentRequest {
  document_id: number;
  verification_status: string;
  remarks: string;
}

export interface SurveyItem {
  survey_id: number;
  claim_id: number;
  surveyor_id: number;
  assigned_date: string;
  inspection_date: string | null;
  survey_status: string;
  report_uploaded: boolean;
}

export interface InvestigationItem {
  investigation_id: number;
  claim_id: number;
  investigator_id: number;
  investigation_reason: string;
  investigation_status: string;
  report_uploaded: boolean;
}

// fields of the BRD table claim_settlement (INS052). Must match the Settlement API once it is built.
export interface SettlementItem {
  claim_id: number;
  approved_amount: number;
  payment_mode: string;
  transaction_reference: string | null;
  settlement_date: string | null;
  settlement_status: string;
}

export interface SettlementRequest {
  approved_amount: number;
  payment_mode: string;
  transaction_reference: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7130/api/v1';
  private readonly baseUrl = this.apiUrl + '/claims';

  // change this only if the Investigation API runs as a separate service on its own address
  private readonly investigationApiUrl = this.apiUrl;

  // the name of the file field in the document upload form. It must match the parameter shown in Swagger.
  private readonly documentFileField = 'file';

  // ---------- claims ----------

  getClaims() {
    return this.http.get<any>(this.baseUrl);
  }

  getClaimById(claimId: number) {
    return this.http.get<any>(`${this.baseUrl}/${claimId}`);
  }

  getClaimHistory(claimId: number) {
    return this.http.get<any>(`${this.baseUrl}/${claimId}/history`);
  }

  addClaim(body: CreateClaimRequest) {
    return this.http.post<any>(this.baseUrl, body);
  }

  cancelClaim(claimId: number) {
    return this.http.delete<any>(`${this.baseUrl}/${claimId}`);
  }

  approveClaim(claimId: number, remarks: string) {
    return this.http.put<any>(`${this.baseUrl}/${claimId}/approve`, { remarks });
  }

  rejectClaim(claimId: number, reason: string) {
    return this.http.put<any>(`${this.baseUrl}/${claimId}/reject`, { reason });
  }

  // ---------- documents ----------

  getDocuments(claimId: number) {
    return this.http.get<any>(`${this.baseUrl}/${claimId}/documents`);
  }

  uploadDocument(claimId: number, documentName: string, file: File) {
    const formData = new FormData();
    formData.append('document_name', documentName);
    formData.append(this.documentFileField, file);

    return this.http.post<any>(`${this.baseUrl}/${claimId}/documents`, formData);
  }

  verifyDocument(claimId: number, body: VerifyDocumentRequest) {
    return this.http.put<any>(`${this.baseUrl}/${claimId}/documents/verify`, body);
  }

  // ---------- survey ----------

  getSurvey(claimId: number) {
    return this.http.get<any>(`${this.baseUrl}/${claimId}/survey`);
  }

  assignSurveyor(claimId: number, surveyorId: number) {
    return this.http.post<any>(`${this.baseUrl}/${claimId}/survey`, { surveyor_id: surveyorId });
  }

  submitSurveyReport(surveyId: number, inspectionDate: string, file: File) {
    const formData = new FormData();
    formData.append('inspection_date', inspectionDate);
    formData.append('report_file', file);

    return this.http.put<any>(`${this.apiUrl}/surveys/${surveyId}`, formData);
  }

  // ---------- investigation ----------

  getInvestigation(claimId: number) {
    return this.http.get<any>(`${this.investigationApiUrl}/claims/${claimId}/investigation`);
  }

  assignInvestigator(claimId: number, investigatorId: number, reason: string) {
    return this.http.post<any>(`${this.investigationApiUrl}/claims/${claimId}/investigation`, {
      investigator_id: investigatorId,
      investigation_reason: reason
    });
  }

  submitInvestigationReport(investigationId: number, file: File) {
    const formData = new FormData();
    formData.append('report_file', file);

    return this.http.put<any>(`${this.investigationApiUrl}/investigations/${investigationId}`, formData);
  }

  // ---------- settlement ----------

  getSettlement(claimId: number) {
    return this.http.get<any>(`${this.baseUrl}/${claimId}/settlement`);
  }

  processSettlement(claimId: number, body: SettlementRequest) {
    return this.http.post<any>(`${this.baseUrl}/${claimId}/settlement`, body);
  }
}