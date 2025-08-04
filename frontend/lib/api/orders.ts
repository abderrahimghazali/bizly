import { apiClient } from './client';

export interface Order {
  id: number;
  order_number: string;
  company_id: number;
  contact_id?: number;
  user_id: number;
  quote_id?: number;
  title: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  tax_rate: number;
  discount_rate: number;
  currency: string;
  order_date: string;
  expected_delivery_date?: string;
  shipping_address?: string;
  billing_address?: string;
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
  quote?: {
    id: number;
    quote_number: string;
    title: string;
  };
}

export interface CreateOrderData {
  company_id: number;
  contact_id?: number;
  quote_id?: number;
  title: string;
  description?: string;
  order_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  tax_rate?: number;
  discount_rate?: number;
  currency?: string;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
}

export interface UpdateOrderData {
  company_id?: number;
  contact_id?: number;
  quote_id?: number;
  title?: string;
  description?: string;
  status?: Order['status'];
  order_date?: string;
  expected_delivery_date?: string;
  subtotal?: number;
  tax_rate?: number;
  discount_rate?: number;
  currency?: string;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  delivered: number;
  total_value: number;
}

export const orderStatuses = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

export const ordersApi = {
  async getAll(params?: {
    status?: string;
    company_id?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  async create(data: CreateOrderData) {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  async update(id: number, data: UpdateOrderData) {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  async createFromQuote(quoteId: number) {
    const response = await apiClient.post(`/quotes/${quoteId}/create-order`);
    return response.data;
  },

  async getStats(): Promise<{ success: boolean; stats: OrderStats }> {
    const response = await apiClient.get('/orders-stats');
    return response.data;
  },
};