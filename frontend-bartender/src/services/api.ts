// API service for backend communication (Bartender)

// Type definitions for API responses
export interface PendingPayment {
  id: string;
  user_id: string;
  bottle_id: string;
  venue_id: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_qr_code: string | null;
  created_at: string;
  user_email?: string;
  bottle_name?: string;
  brand?: string;
  total_ml?: number;
  venue_name?: string;
  price?: number;
}

export interface ScanResult {
  redemption: {
    id: string;
    purchase_id: string;
    user_id: string;
    peg_size_ml: number;
    status: 'pending' | 'served' | 'expired';
  };
  purchase: {
    id: string;
    remaining_ml: number;
  };
  message: string;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

/** Set from App so API requests include Clerk session token. Call with getToken from useAuth(). */
let authTokenGetter: (() => Promise<string | null>) | null = null;
export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

class BartenderApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = authTokenGetter ? await authTokenGetter() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Payment endpoints (bartender)
  async getPendingPayments(): Promise<PendingPayment[]> {
    return this.request<PendingPayment[]>('/api/payments/pending');
  }

  async markPaymentPaid(purchaseId: string): Promise<PendingPayment> {
    return this.request<PendingPayment>(`/api/payments/${purchaseId}/mark-paid`, {
      method: 'PUT',
    });
  }

  // Redemption endpoints (bartender)
  async scanRedemptionQR(qrData: string): Promise<ScanResult> {
    return this.request<ScanResult>('/api/redemptions/scan', {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  }
}

export const apiService = new BartenderApiService();
