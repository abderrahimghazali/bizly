import { apiClient } from './client';
import { Company, Deal } from './companies';

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  company_id: number;
  user_id: number;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relationships
  company?: Company;
  user?: { id: number; name: string; email: string };
  deals?: Deal[];
  // Computed attributes
  full_name: string;
}

export interface CreateContactData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  company_id: number;
  is_primary?: boolean;
  notes?: string;
}

export interface UpdateContactData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  company_id?: number;
  is_primary?: boolean;
  notes?: string;
}

export interface ContactStats {
  total_contacts: number;
  primary_contacts: number;
  contacts_with_deals: number;
  top_departments: Array<{ department: string; count: number }>;
}

export interface ContactOption {
  id: number;
  name: string;
  position?: string;
  company?: string;
}

export const contactsApi = {
  getAll: async (params?: { 
    search?: string; 
    company_id?: number; 
    department?: string; 
    page?: number 
  }): Promise<{ 
    data: Contact[]; 
    total: number; 
    per_page: number; 
    current_page: number; 
    last_page: number; 
  }> => {
    const response = await apiClient.get('/contacts', { params });
    return response.data;
  },

  getById: async (id: number): Promise<{ data: Contact }> => {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data;
  },

  create: async (data: CreateContactData): Promise<{ 
    success: boolean; 
    message: string; 
    contact: Contact 
  }> => {
    const response = await apiClient.post('/contacts', data);
    return response.data;
  },

  update: async (id: number, data: UpdateContactData): Promise<{ 
    success: boolean; 
    message: string; 
    contact: Contact 
  }> => {
    const response = await apiClient.put(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await apiClient.delete(`/contacts/${id}`);
    return response.data;
  },

  setPrimary: async (id: number): Promise<{ 
    success: boolean; 
    message: string; 
    contact: Contact 
  }> => {
    const response = await apiClient.post(`/contacts/${id}/set-primary`);
    return response.data;
  },

  getByCompany: async (companyId: number): Promise<Contact[]> => {
    const response = await apiClient.get(`/companies/${companyId}/contacts`);
    return response.data;
  },

  getStats: async (): Promise<ContactStats> => {
    const response = await apiClient.get('/contacts-stats');
    return response.data;
  },

  getOptions: async (params?: { company_id?: number }): Promise<ContactOption[]> => {
    const response = await apiClient.get('/contacts-options', { params });
    return response.data;
  },
};