import { apiClient } from './client';

export interface Invoice {
  id: number;
  invoice_number: string;
  company_id: number;
  contact_id?: number;
  user_id: number;
  order_id?: number;
  quote_id?: number;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  tax_rate: number;
  discount_rate: number;
  currency: string;
  invoice_date: string;
  due_date: string;
  paid_date?: string;
  payment_terms?: string;
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
  order?: {
    id: number;
    order_number: string;
    title: string;
  };
  quote?: {
    id: number;
    quote_number: string;
    title: string;
  };
}

export interface CreateInvoiceData {
  company_id: number;
  contact_id?: number;
  order_id?: number;
  quote_id?: number;
  title: string;
  description?: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_rate?: number;
  discount_rate?: number;
  currency?: string;
  payment_terms?: string;
  notes?: string;
}

export interface UpdateInvoiceData {
  company_id?: number;
  contact_id?: number;
  order_id?: number;
  quote_id?: number;
  title?: string;
  description?: string;
  status?: Invoice['status'];
  invoice_date?: string;
  due_date?: string;
  subtotal?: number;
  tax_rate?: number;
  discount_rate?: number;
  currency?: string;
  payment_terms?: string;
  notes?: string;
}

export interface MarkAsPaidData {
  amount: number;
  paid_date?: string;
}

export interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  total_value: number;
  paid_value: number;
  due_value: number;
}

export const invoiceStatuses = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
} as const;

export const invoicesApi = {
  async getAll(params?: {
    status?: string;
    company_id?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const response = await apiClient.get('/invoices', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  async create(data: CreateInvoiceData) {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },

  async update(id: number, data: UpdateInvoiceData) {
    const response = await apiClient.put(`/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/invoices/${id}`);
    return response.data;
  },

  async createFromOrder(orderId: number) {
    const response = await apiClient.post(`/orders/${orderId}/create-invoice`);
    return response.data;
  },

  async markAsPaid(id: number, data: MarkAsPaidData) {
    const response = await apiClient.post(`/invoices/${id}/mark-paid`, data);
    return response.data;
  },

  async getStats(): Promise<{ success: boolean; stats: InvoiceStats }> {
    const response = await apiClient.get('/invoices-stats');
    return response.data;
  },
};