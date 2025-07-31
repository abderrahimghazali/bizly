import { apiClient } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label: string;
  status: 'active' | 'pending' | 'suspended';
  permissions: string[];
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export const usersApi = {
  getAll: async (): Promise<{ users: User[] }> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  getById: async (id: number): Promise<{ user: User }> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: { name: string; email: string; role: string; status: string }): Promise<{ user: User }> => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },
};