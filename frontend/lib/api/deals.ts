import { apiClient } from './client';

export interface Deal {
  id: number;
  title: string;
  description?: string;
  amount: number;
  probability: number;
  stage: 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  expected_close_date: string;
  actual_close_date?: string;
  source?: string;
  notes?: string;
  lead_id?: number;
  company_id?: number;
  contact_id?: number;
  assigned_to?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Appended attributes
  stage_label: string;
  weighted_amount: number;
  is_overdue: boolean;
  days_until_close: number;
  // Relationships
  assigned_user?: {
    id: number;
    name: string;
    email: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  company?: {
    id: number;
    name: string;
  };
  contact?: {
    id: number;
    name: string;
    email: string;
  };
  lead?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateDealData {
  title: string;
  description?: string;
  amount: number;
  probability?: number;
  stage: Deal['stage'];
  expected_close_date: string;
  actual_close_date?: string;
  source?: string;
  notes?: string;
  lead_id?: number;
  company_id?: number;
  contact_id?: number;
  assigned_to?: number;
}

export interface UpdateDealData {
  title?: string;
  description?: string;
  amount?: number;
  probability?: number;
  stage?: Deal['stage'];
  expected_close_date?: string;
  actual_close_date?: string;
  source?: string;
  notes?: string;
  lead_id?: number;
  company_id?: number;
  contact_id?: number;
  assigned_to?: number;
}

export interface DealStats {
  total_deals: number;
  open_deals: number;
  won_deals: number;
  lost_deals: number;
  total_value: number;
  won_value: number;
  weighted_pipeline: number;
  overdue_deals: number;
  avg_deal_size: number;
  conversion_rate: number;
  by_stage: {
    [key: string]: {
      count: number;
      value: number;
      label: string;
    };
  };
}

export const dealStages = {
  qualified: 'Qualified',
  proposal: 'Proposal', 
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
} as const;

export const dealSources = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Event',
  'Partner',
  'Advertisement',
  'Social Media',
  'Direct Mail',
  'Other'
] as const;

export interface AssignableUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const dealsApi = {
  async getAll(params?: {
    stage?: string;
    assigned_to?: string;
    source?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const response = await apiClient.get('/deals', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/deals/${id}`);
    return response.data;
  },

  async create(data: CreateDealData) {
    const response = await apiClient.post('/deals', data);
    return response.data;
  },

  async update(id: number, data: UpdateDealData) {
    const response = await apiClient.put(`/deals/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/deals/${id}`);
    return response.data;
  },

  async getStats(): Promise<{ success: boolean; stats: DealStats }> {
    const response = await apiClient.get('/deals-stats');
    return response.data;
  },

  async getAssignableUsers(): Promise<{ success: boolean; users: AssignableUser[] }> {
    const response = await apiClient.get('/deals-assignable-users');
    return response.data;
  },
};