import { apiClient } from './client';

export interface Role {
  id: number;
  name: string;
  label: string;
  description?: string;
  isSystemRole: boolean;
  userCount: number;
}

export interface Permission {
  id: number;
  name: string;
  label: string;
  category?: string;
}

export interface PermissionsMatrix {
  roles: Array<{
    id: number;
    name: string;
    label: string;
  }>;
  permissions: Permission[];
  matrix: Record<number, number[]>;
}

export const rolesApi = {
  // Get all roles
  getAll: async (): Promise<{ roles: Role[] }> => {
    const response = await apiClient.get('/roles');
    return response.data;
  },

  // Get single role
  get: async (id: number): Promise<{ role: Role }> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  // Create new role
  create: async (data: { label: string; description?: string }): Promise<{ role: Role; message: string }> => {
    const response = await apiClient.post('/roles', data);
    return response.data;
  },

  // Update role
  update: async (id: number, data: { label: string; description?: string }): Promise<{ role: Role; message: string }> => {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data;
  },

  // Delete role
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  // Get permissions matrix
  getPermissionsMatrix: async (): Promise<PermissionsMatrix> => {
    const response = await apiClient.get('/permissions-matrix');
    return response.data;
  },

  // Update role permissions
  updatePermissions: async (roleId: number, permissions: number[]): Promise<{ message: string }> => {
    const response = await apiClient.post(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },

  // Get all permissions
  getPermissions: async (): Promise<{ permissions: Record<string, Permission[]> }> => {
    const response = await apiClient.get('/permissions');
    return response.data;
  }
};