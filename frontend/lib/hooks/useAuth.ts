import { create } from 'zustand';
import { authApi } from '@/lib/api/auth';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label: string;
  permissions: string[];
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isEmployee: () => boolean;
  isClient: () => boolean;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),

  login: async (credentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('auth-token', response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (data) => {
    const response = await authApi.register(data);
    localStorage.setItem('auth-token', response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    await authApi.logout();
    localStorage.removeItem('auth-token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false, isHydrated: true });
      return;
    }

    try {
      const response = await authApi.me();
      set({ user: response.user, isAuthenticated: true, isLoading: false, isHydrated: true });
    } catch {
      // Token is invalid or expired
      localStorage.removeItem('auth-token');
      set({ user: null, isAuthenticated: false, isLoading: false, isHydrated: true });
    }
  },

  // Role-based access control methods
  hasRole: (role: string) => {
    const { user } = useAuth.getState();
    return user?.role === role;
  },

  hasAnyRole: (roles: string[]) => {
    const { user } = useAuth.getState();
    return user ? roles.includes(user.role) : false;
  },

  hasPermission: (permission: string) => {
    const { user } = useAuth.getState();
    return user?.permissions.includes(permission) ?? false;
  },

  isAdmin: () => {
    const { user } = useAuth.getState();
    return user?.role === 'admin';
  },

  isManager: () => {
    const { user } = useAuth.getState();
    return user?.role === 'manager';
  },

  isEmployee: () => {
    const { user } = useAuth.getState();
    return user?.role === 'employee';
  },

  isClient: () => {
    const { user } = useAuth.getState();
    return user?.role === 'client';
  },
}));