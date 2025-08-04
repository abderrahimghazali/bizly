import { apiClient } from './client';

export interface Quote {
  id: number;
  quote_number: string;
  company_id: number;
  contact_id?: number;
  user_id: number;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  tax_rate: number;
  discount_rate: number;
  currency: string;
  quote_date: string;
  expiry_date: string;
  terms_conditions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relationships
  company?: {
    id: number;
    name: string;
  };
  contact?: {
    id: number;
    name: string;
    email: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateQuoteData {
  company_id: number;
  contact_id?: number;
  title: string;
  description?: string;
  quote_date: string;
  expiry_date: string;
  subtotal: number;
  tax_rate?: number;
  discount_rate?: number;
  currency?: string;
  terms_conditions?: string;
  notes?: string;
}

export interface UpdateQuoteData {
  company_id?: number;
  contact_id?: number;
  title?: string;
  description?: string;
  status?: Quote['status'];
  quote_date?: string;
  expiry_date?: string;
  subtotal?: number;
  tax_rate?: number;
  discount_rate?: number;
  currency?: string;
  terms_conditions?: string;
  notes?: string;
}

export interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  total_value: number;
}

export const quoteStatuses = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
} as const;

export const currencies = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'CNY',
] as const;

export const quotesApi = {
  async getAll(params?: {
    status?: string;
    company_id?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const response = await apiClient.get('/quotes', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/quotes/${id}`);
    return response.data;
  },

  async create(data: CreateQuoteData) {
    const response = await apiClient.post('/quotes', data);
    return response.data;
  },

  async update(id: number, data: UpdateQuoteData) {
    const response = await apiClient.put(`/quotes/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/quotes/${id}`);
    return response.data;
  },

  async getStats(): Promise<{ success: boolean; stats: QuoteStats }> {
    const response = await apiClient.get('/quotes-stats');
    return response.data;
  },
};