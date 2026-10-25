export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface PagedResult<T> {
  items: T[];
  page_number: number;
  page_size: number;
  total_records: number;
  total_pages: number;
}

export interface Claim {
  claim_id: number;
  claim_number: string;
  policy_id: number;
  customer_id: number;
  claim_type: string;
  incident_date: string;
  claim_date: string;
  description: string;
  estimated_loss: number;
  claim_status: string;
}

export interface CreateClaim {
  policy_id: number;
  customer_id: number;
  claim_type: string;
  incident_date: string;
  description: string;
  estimated_loss: number;
}

export interface UpdateClaim {
  description: string;
  estimated_loss: number;
}

export interface ClaimHistory {
  history_id: number;
  claim_id: number;
  action: string;
  performed_by: number;
  action_date: string;
  remarks: string | null;
}

export interface ClaimFilter {
  page_number: number;
  page_size: number;
  search?: string;
  claim_status?: string;
  claim_type?: string;
  customer_id?: number;
}

export interface ClaimDocument {
  document_id: number;
  claim_id: number;
  document_name: string;
  verification_status: string;
  uploaded_date: string;
}

export interface Settlement {
  settlement_id: number;
  claim_id: number;
  approved_amount: number;
  payment_mode: string;
  transaction_reference: string;    // returned masked
  settlement_date: string;
  settlement_status: string;
  account_holder_name: string;
  account_number: string;           // returned masked
  ifsc_code: string;
  bank_verified: boolean;
}

export interface SettlementAdvice {
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

// the list the API accepts (a backend recommendation, not an official BRD dropdown)
export const CLAIM_TYPES = ['Health', 'Motor', 'Life', 'Travel', 'Home', 'Property', 'Personal Accident'];

// the BRD statuses, plus Cancelled which the backend added
export const CLAIM_STATUSES = ['Registered', 'Pending Verification', 'Under Survey',
  'Under Investigation', 'Approved', 'Rejected', 'Settled', 'Cancelled'];

// documents cannot be added after these statuses (same rule as the API)
export const FINAL_STATUSES = ['Approved', 'Rejected', 'Settled', 'Cancelled'];

// Bootstrap badge colours, so no custom CSS is needed
export function BadgeClass(status: string): string {
  switch (status) {
    case 'Registered': return 'text-bg-info';
    case 'Pending Verification': return 'text-bg-warning';
    case 'Under Survey':
    case 'Under Investigation': return 'text-bg-primary';
    case 'Approved':
    case 'Settled':
    case 'Verified': return 'text-bg-success';
    case 'Rejected':
    case 'Cancelled': return 'text-bg-danger';
    default: return 'text-bg-secondary';
  }
}

// today as yyyy-MM-dd in the user's own time zone
export function TodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ErrorText(err: any, fallback: string): string {
  if (err?.status === 0) return 'Cannot reach the Claim API. Check that it is running and that CORS is enabled.';
  if (err?.status === 403) return 'You do not have permission for this action.';
  return err?.error?.message ?? fallback;
}

// same limits as the API: pdf, jpg, jpeg or png, up to 5 MB. Returns a message, or null when the file is fine
export function CheckFile(file: File | null): string | null {
  if (!file) return 'Choose a file';
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.substring(dot).toLowerCase() : '';
  if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) return 'Only pdf, jpg, jpeg and png files are allowed';
  if (file.size > 5 * 1024 * 1024) return 'File size cannot be more than 5 MB';
  return null;
}