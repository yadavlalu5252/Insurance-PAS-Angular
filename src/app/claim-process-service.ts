import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Use the SAME Claim API address as in claim-service.ts
const CLAIM_API = 'https://localhost:7129/api/v1';

export interface AssessmentItem {
  assessment_id: number;
  claim_id: number;
  assessed_amount: number;
  deductible: number;
  depreciation: number;
  non_payable: number;
  net_payable: number;
  assessed_date: string;
}

export interface InvestigationRecord {
  investigation_id: number;
  investigation_number: string;
  claim_id: number;
  investigator_id: number;
  investigation_reason: string;
  assigned_date: string;
  investigation_status: string;      // Pending or Completed
  findings: string | null;
  recommendation: string | null;     // Genuine or Fraud
  completed_date: string | null;
}

export interface EvidenceItem {
  evidence_id: number;
  investigation_id: number;
  description: string;
  file_name: string;
  uploaded_by: number;
  uploaded_date: string;
}

export interface SettlementRecord {
  settlement_id: number;
  claim_id: number;
  approved_amount: number;
  payment_mode: string;
  transaction_reference: string;     // returned masked
  settlement_date: string;
  settlement_status: string;
  account_holder_name: string;
  account_number: string;            // returned masked
  ifsc_code: string;
  bank_verified: boolean;
}

export interface SettlementBody {
  payment_mode: string;
  transaction_reference: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_verified: boolean;
}

export interface AdviceItem {
  advice_number: string;
  generated_on: string;
  claim_number: string;
  assessed_amount: number;
  deductible: number;
  depreciation: number;
  non_payable: number;
  net_payable: number;
  payment_mode: string;
  transaction_reference: string;
  account_holder_name: string;
  account_number: string;
}

// the same limits as the API: pdf, jpg, jpeg or png, up to 5 MB. Returns a message, or null when the file is fine
export function checkFile(file: File | null): string | null {
  if (!file) return 'Choose a file.';

  const dot = file.name.lastIndexOf('.');
  const extension = dot >= 0 ? file.name.substring(dot).toLowerCase() : '';

  if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(extension)) {
    return 'Only pdf, jpg, jpeg and png files are allowed.';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File size cannot be more than 5 MB.';
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class ClaimProcessService {
  private http = inject(HttpClient);

  // ---------- assessment ----------

  getAssessment(claimId: number): Observable<any> {
    return this.http.get<any>(`${CLAIM_API}/claims/${claimId}/assessment`);
  }

  saveAssessment(claimId: number, body: any): Observable<any> {
    return this.http.post<any>(`${CLAIM_API}/claims/${claimId}/assessment`, body);
  }

  // ---------- reject (with the fraud flag) ----------

  rejectClaim(claimId: number, reason: string, isFraud: boolean): Observable<any> {
    return this.http.put<any>(`${CLAIM_API}/claims/${claimId}/reject`, { reason, is_fraud: isFraud });
  }

  // ---------- investigation ----------

  listInvestigations(page: number, status: string, claimId: number | null): Observable<any> {
    let params = new HttpParams().set('page_number', page).set('page_size', 10);
    if (status) params = params.set('investigation_status', status);
    if (claimId) params = params.set('claim_id', claimId);
    return this.http.get<any>(`${CLAIM_API}/investigations`, { params });
  }

  // the latest investigation of one claim
  getInvestigationByClaim(claimId: number): Observable<any> {
    const params = new HttpParams().set('claim_id', claimId).set('page_number', 1).set('page_size', 1);
    return this.http.get<any>(`${CLAIM_API}/investigations`, { params });
  }

  createInvestigation(claimId: number, investigatorId: number, reason: string): Observable<any> {
    return this.http.post<any>(`${CLAIM_API}/claims/${claimId}/investigation`, {
      investigator_id: investigatorId,
      investigation_reason: reason
    });
  }

  getEvidence(investigationId: number): Observable<any> {
    return this.http.get<any>(`${CLAIM_API}/investigations/${investigationId}/evidence`);
  }

  addEvidence(investigationId: number, description: string, file: File): Observable<any> {
    // sent as a form, because the API receives a file
    const form = new FormData();
    form.append('description', description);
    form.append('file', file);
    return this.http.post<any>(`${CLAIM_API}/investigations/${investigationId}/evidence`, form);
  }

  submitInvestigationReport(investigationId: number, findings: string, recommendation: string, file: File): Observable<any> {
    const form = new FormData();
    form.append('findings', findings);
    form.append('recommendation', recommendation);
    form.append('file', file);
    return this.http.put<any>(`${CLAIM_API}/investigations/${investigationId}`, form);
  }

  // ---------- settlement ----------

  getSettlement(claimId: number): Observable<any> {
    return this.http.get<any>(`${CLAIM_API}/claims/${claimId}/settlement`);
  }

  getAdvice(claimId: number): Observable<any> {
    return this.http.get<any>(`${CLAIM_API}/claims/${claimId}/settlement/advice`);
  }

  processSettlement(claimId: number, body: SettlementBody): Observable<any> {
    return this.http.post<any>(`${CLAIM_API}/claims/${claimId}/settlement`, body);
  }
}