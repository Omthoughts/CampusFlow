import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  year?: string;
  division?: string;
  batch?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
