import { create } from 'zustand';
import { authApi } from '@/lib/api/auth';

interface User {
  id: number;
  name: string;
  email: string;
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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // Add hydration state
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void; // Add hydration setter
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
}));