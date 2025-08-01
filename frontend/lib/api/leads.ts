import { apiClient } from './client';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
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
};