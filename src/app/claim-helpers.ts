export const CLAIM_TYPES = ['Health', 'Motor', 'Life', 'Travel', 'Home', 'Property', 'Personal Accident'];

export const CLAIM_STATUSES = [
  'Registered', 'Pending Verification', 'Under Survey', 'Under Investigation',
  'Approved', 'Rejected', 'Settled', 'Cancelled'
];

// document names suggested per claim type (BRD FR-CLM-003). Only a hint, any name can be typed.
export const DOCUMENT_SUGGESTIONS: Record<string, string[]> = {
  Health: ['Hospital Bills', 'Medical Reports', 'Discharge Summary', 'Doctor Prescription'],
  Motor: ['RC Book', 'Driving License', 'FIR', 'Vehicle Images', 'Repair Estimate'],
  Life: ['Death Certificate', 'Medical Certificate', 'Nominee ID Proof']
};

// Bootstrap badge class for a status
export function getStatusBadge(status: string): string {
  switch (status) {
    case 'Registered':
      return 'text-bg-info';
    case 'Pending Verification':
    case 'Pending':
    case 'Assigned':
      return 'text-bg-warning';
    case 'Under Survey':
    case 'Under Investigation':
      return 'text-bg-primary';
    case 'Approved':
    case 'Settled':
    case 'Completed':
    case 'Verified':
    case 'Paid':
      return 'text-bg-success';
    case 'Rejected':
    case 'Cancelled':
    case 'Failed':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
}

// today as yyyy-MM-dd in the user's own time zone
export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getErrorMessage(error: any, fallback: string): string {
  if (error?.status === 0) {
    return 'Cannot reach the Claim API. Check that it is running and that CORS is enabled.';
  }

  if (error?.status === 403) {
    return 'You do not have permission for this action.';
  }

  return error?.error?.message ?? fallback;
}

// the API wraps results as { success, message, data }. This returns the data part.
export function unwrapData(response: any): any {
  return response && typeof response === 'object' && 'data' in response ? response.data : response;
}

// same, but always gives back a list (also accepts { items: [...] })
export function unwrapList(response: any): any[] {
  const data = unwrapData(response);

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.items) ? data.items : [];
}

// TEMPORARY: there is no login yet, so the customer id is typed in and kept in the browser.
// Replace these three with the id from the Authentication module when it is ready.
const CUSTOMER_KEY = 'cm_customer_id';

export function getSavedCustomerId(): number | null {
  const value = localStorage.getItem(CUSTOMER_KEY);
  return value ? Number(value) : null;
}

export function saveCustomerId(id: number): void {
  localStorage.setItem(CUSTOMER_KEY, String(id));
}

export function clearCustomerId(): void {
  localStorage.removeItem(CUSTOMER_KEY);
}

// payment modes from the BRD (FR-CLM-008)
export const PAYMENT_MODES = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'];

// same file types the API accepts
export function isAllowedFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);
}