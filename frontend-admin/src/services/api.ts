// API service for admin backend communication (with Clerk token)

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

let authTokenGetter: (() => Promise<string | null>) | null = null;
export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = authTokenGetter ? await authTokenGetter() : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers, credentials: 'include' });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errBody.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  getDashboard: () => request<{ users: { total: number }; purchases: { total: number; paid: number; pending: number }; redemptions: { total: number; served: number; pending: number }; venues: { total: number }; bottles: { total: number } }>('/api/admin/dashboard'),

  // User management
  getAllUsers: () => request<Array<{ id: string; email: string; phone?: string; role: 'customer' | 'bartender' | 'admin'; created_at: string }>>('/api/admin/users'),
  updateUserRole: (userId: string, role: string) => request(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  // Venue management
  getVenues: async () => {
    const response = await request<{ data: Array<{ id: string; name: string; address: string; created_at?: string }> }>('/api/venues');
    return response.data;
  },
  getVenue: async (id: string) => {
    const response = await request<{ data: { id: string; name: string; address: string } }>(`/api/venues/${id}`);
    return response.data;
  },
  createVenue: async (body: { name: string; address: string }) => {
    const response = await request<{ data: any }>('/api/venues', { method: 'POST', body: JSON.stringify(body) });
    return response.data;
  },
  updateVenue: async (id: string, body: { name: string; address: string }) => {
    const response = await request<{ data: any }>(`/api/venues/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    return response.data;
  },
  deleteVenue: (id: string) => request(`/api/venues/${id}`, { method: 'DELETE' }),

  // Bottle management
  getBottlesByVenue: (venueId: string) => request<Array<{ id: string; venue_id: string; name: string; brand: string; price: number; total_ml: number; is_active: boolean }>>(`/api/bottles/venue/${venueId}`),
  createBottle: (body: { venue_id: string; name: string; brand: string; price: number; total_ml: number; is_active: boolean }) => request('/api/bottles', { method: 'POST', body: JSON.stringify(body) }),
  updateBottle: (id: string, body: { venue_id: string; name: string; brand: string; price: number; total_ml: number; is_active: boolean }) => request(`/api/bottles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBottle: (id: string) => request(`/api/bottles/${id}`, { method: 'DELETE' }),

  // Purchase and redemption data
  getAllPurchases: () => request<Array<any>>('/api/admin/purchases'),
  getAllRedemptions: () => request<Array<any>>('/api/admin/redemptions'),
};
