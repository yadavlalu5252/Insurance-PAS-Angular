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

// payment modes from the BRD (FR-CLM-008)
export const PAYMENT_MODES = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'];

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

// same file types the API accepts
export function isAllowedFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);
}

// ---------- token and roles ----------

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

// reads the payload of the token that the login saved
export function getTokenPayload(): any | null {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return null;
  }

  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part));
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: any): boolean {
  return !!payload?.exp && payload.exp * 1000 < Date.now();
}

export function getUserRoles(): string[] {
  const payload = getTokenPayload();
  const raw = payload?.['role'] ?? payload?.['roles'] ?? payload?.[ROLE_CLAIM];

  if (!raw) {
    return [];
  }

  return (Array.isArray(raw) ? raw : [raw]).map((role: any) => String(role).toLowerCase());
}

// the names the login may use for each of the three roles (compared in lower case)
export const ROLE_ALIASES: Record<string, string[]> = {
  admin: ['admin', 'administrator', 'super admin'],
  agent: ['agent'],
  customer: ['customer'],
};

export function hasRole(group: string): boolean {
  const aliases = ROLE_ALIASES[group] ?? [];
  return getUserRoles().some((role) => aliases.includes(role));
}

// the first page of the user's own role
export function getHomeRoute(): string {
  if (hasRole('admin')) return '/claims/admin';
  if (hasRole('agent')) return '/claims/agent';
  if (hasRole('customer')) return '/claims/customer';
  return '/login';
}

// ---------- customer id ----------

// TEMPORARY: used when the token has no customer id, so the id is typed in and kept in the browser.
const CUSTOMER_KEY = 'cm_customer_id';

export function getTokenCustomerId(): number | null {
  const payload = getTokenPayload();
  const value = payload?.['customer_id'] ?? payload?.['customerId'] ?? payload?.['CustomerId'];
  return value ? Number(value) : null;
}

// the customer id comes from the token when it has one. Otherwise the typed-in id is used.
export function getSavedCustomerId(): number | null {
  const fromToken = getTokenCustomerId();

  if (fromToken) {
    return fromToken;
  }

  const value = localStorage.getItem(CUSTOMER_KEY);
  return value ? Number(value) : null;
}

export function saveCustomerId(id: number): void {
  localStorage.setItem(CUSTOMER_KEY, String(id));
}

export function clearCustomerId(): void {
  localStorage.removeItem(CUSTOMER_KEY);
}