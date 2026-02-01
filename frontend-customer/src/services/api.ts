// API service for backend communication

// Type definitions for API responses
export interface Venue {
  id: string;
  name: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bottle {
  id: string;
  venue_id: string;
  name: string;
  brand: string;
  price: number;
  total_ml: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  bottle_id: string;
  venue_id: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_qr_code: string | null;
  remaining_ml: number;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
}

export interface Redemption {
  id: string;
  purchase_id: string;
  user_id: string;
  peg_size_ml: number;
  redemption_token: string;
  status: 'pending' | 'served' | 'expired';
  created_at: string;
  served_at: string | null;
  served_by: string | null;
  expires_at: string;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

/** Set from App so API requests include Clerk session token. Call with getToken from useAuth(). */
let authTokenGetter: (() => Promise<string | null>) | null = null;
export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

class ApiService {
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
    console.log('🔍 API Debug - Token status:', token ? 'present' : 'missing');
    console.log('🔍 API Debug - Token preview:', token ? token.substring(0, 30) + '...' : 'none');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔍 API Debug - Authorization header set');
    } else {
      console.log('🔍 API Debug - No token available, request will fail');
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      console.log('🔍 API Debug - Making request to:', url);
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.log('🔍 API Debug - Request failed:', response.status, error);
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      console.log('🔍 API Debug - Request successful:', response.status);
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Venue endpoints
  async getVenues(): Promise<Venue[]> {
    const response = await this.request<{ data: Venue[] }>('/api/venues');
    return response.data;
  }

  async getVenueById(id: string): Promise<Venue> {
    const response = await this.request<{ data: Venue }>(`/api/venues/${id}`);
    return response.data;
  }

  // Bottle endpoints
  async getBottlesByVenue(venueId: string): Promise<Bottle[]> {
    return this.request<Bottle[]>(`/api/bottles/venue/${venueId}`);
  }

  async getBottleById(id: string): Promise<Bottle> {
    return this.request<Bottle>(`/api/bottles/${id}`);
  }

  // Payment endpoints
  async initiatePurchase(bottleId: string): Promise<{ purchase: Purchase; qrCode: { data: string; imageDataUrl?: string } }> {
    const response = await this.request<{ data: { purchase: Purchase; qrCode: { data: string; imageDataUrl?: string } } }>('/api/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ bottle_id: bottleId }),
    });
    return response.data;
  }

  async getPurchase(id: string): Promise<Purchase & { bottle_name?: string; bottle_brand?: string; venue_name?: string }> {
    return this.request<Purchase & { bottle_name?: string; bottle_brand?: string; venue_name?: string }>(`/api/payments/${id}`);
  }

  // Redemption endpoints
  async getMyBottles(): Promise<Array<Bottle & {
    brand: string;
    type: string;
    size: string;
    venue_name: string;
    venue_address: string;
    pegs_purchased: number;
    pegs_total: number;
    pegs_remaining: number;
  }>> {
    const response = await this.request<{
      data: Array<Bottle & {
        brand: string;
        type: string;
        size: string;
        venue_name: string;
        venue_address: string;
        pegs_purchased: number;
        pegs_total: number;
        pegs_remaining: number;
      }>;
      message: string;
    }>('/api/redemptions/my-bottles');

    return response.data || [];
  }

  async requestRedemption(purchaseId: string, pegSizeMl: number): Promise<{ redemption: Redemption; qrCode: { data: string; imageDataUrl?: string } }> {
    return this.request<{ redemption: Redemption; qrCode: { data: string; imageDataUrl?: string } }>('/api/redemptions/request', {
      method: 'POST',
      body: JSON.stringify({
        purchase_id: purchaseId,
        peg_size_ml: pegSizeMl,
      }),
    });
  }

  async getMyRedemptions(): Promise<Redemption[]> {
    return this.request<Redemption[]>('/api/redemptions/my-redemptions');
  }
}

export const apiService = new ApiService();
