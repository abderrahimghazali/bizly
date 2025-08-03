import { apiClient } from './client';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'converted';
  source?: string;
  value: number;
  last_contact?: string;
  notes?: string;
  assigned_to?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  value?: number;
  notes?: string;
  assigned_to?: number;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  value?: number;
  notes?: string;
  assigned_to?: number;
}

export interface ConvertLeadData {
  // Company data
  company_action: 'create' | 'existing';
  company_id?: number;
  company_name?: string;
  company_industry?: string;
  company_website?: string;
  company_phone?: string;
  company_email?: string;
  company_address?: string;
  
  // Contact data (always create new)
  contact_first_name: string;
  contact_last_name: string;
  contact_position?: string;
  contact_department?: string;
  contact_phone?: string;
  contact_mobile?: string;
  contact_is_primary?: boolean;
  
  // Deal data (optional)
  create_deal?: boolean;
  deal_title?: string;
  deal_amount?: number;
  deal_probability?: number;
  deal_expected_close_date?: string;
  deal_notes?: string;
}

export const leadsApi = {
  // Get all leads with optional filters
  getAll: async (params?: {
    search?: string;
    status?: string;
    source?: string;
  }): Promise<{ leads: Lead[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.source) queryParams.append('source', params.source);
    
    const url = `/leads${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get single lead
  get: async (id: number): Promise<{ lead: Lead }> => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  // Create new lead
  create: async (data: CreateLeadData): Promise<{ lead: Lead; message: string }> => {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },

  // Update lead
  update: async (id: number, data: UpdateLeadData): Promise<{ lead: Lead; message: string }> => {
    const response = await apiClient.put(`/leads/${id}`, data);
    return response.data;
  },

  // Delete lead
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },

  // Convert lead to company, contact, and optionally deal
  convert: async (id: number, data: ConvertLeadData): Promise<{ 
    message: string; 
    company: unknown; 
    contact: unknown; 
    deal?: unknown; 
    lead: Lead 
  }> => {
    const response = await apiClient.post(`/leads/${id}/convert`, data);
    return response.data;
  },
};