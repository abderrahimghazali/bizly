import { apiClient } from './client';

export interface Company {
  id: number;
  name: string;
  registration_number?: string;
  vat_number?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  status: 'active' | 'inactive' | 'prospect';
  revenue?: number;
  employees_count?: number;
  founded_date?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  // Relationships
  user?: { id: number; name: string; email: string };
  primary_contact?: Contact;
  contacts?: Contact[];
  leads?: Lead[];
  deals?: Deal[];
  // Computed attributes
  status_label?: string;
  full_address?: string;
}

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

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  company_id?: number;
  status: string;
  source?: string;
  value: number;
  last_contact?: string;
  notes?: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  title: string;
  description?: string;
  amount: number;
  probability: number;
  stage: string;
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
}

export interface CreateCompanyData {
  name: string;
  registration_number?: string;
  vat_number?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  status?: 'active' | 'inactive' | 'prospect';
  revenue?: number;
  employees_count?: number;
  founded_date?: string;
}

export interface UpdateCompanyData {
  name?: string;
  registration_number?: string;
  vat_number?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  status?: 'active' | 'inactive' | 'prospect';
  revenue?: number;
  employees_count?: number;
  founded_date?: string;
}

export interface CompanyStats {
  total_companies: number;
  active_companies: number;
  prospect_companies: number;
  companies_with_deals: number;
  top_industries: Array<{ industry: string; count: number }>;
}

export interface CompanyOption {
  id: number;
  name: string;
  industry?: string;
}

export const companyStatuses = {
  active: 'Active',
  inactive: 'Inactive', 
  prospect: 'Prospect',
};

export const companiesApi = {
  getAll: async (params?: { 
    search?: string; 
    status?: string; 
    industry?: string; 
    page?: number 
  }): Promise<{ 
    data: Company[]; 
    total: number; 
    per_page: number; 
    current_page: number; 
    last_page: number; 
  }> => {
    const response = await apiClient.get('/companies', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Company> => {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },

  create: async (data: CreateCompanyData): Promise<{ 
    success: boolean; 
    message: string; 
    company: Company 
  }> => {
    const response = await apiClient.post('/companies', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCompanyData): Promise<{ 
    success: boolean; 
    message: string; 
    company: Company 
  }> => {
    const response = await apiClient.put(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await apiClient.delete(`/companies/${id}`);
    return response.data;
  },

  getStats: async (): Promise<CompanyStats> => {
    const response = await apiClient.get('/companies-stats');
    return response.data;
  },

  getOptions: async (): Promise<CompanyOption[]> => {
    const response = await apiClient.get('/companies-options');
    return response.data;
  },
};