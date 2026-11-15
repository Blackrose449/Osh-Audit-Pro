import { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { SEED_USERS } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (body: { name: string; email: string; password: string; role?: UserRole }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const { authApi } = await import('@/api/client');
    const data = await authApi.login(email, password);
    setUser(data.user);
  }, []);

  const register = useCallback(async (body: { name: string; email: string; password: string; role?: UserRole }) => {
    const { authApi } = await import('@/api/client');
    const data = await authApi.register(body);
    setUser(data.user);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { authApi } = await import('@/api/client');
    await authApi.reset(email);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const isAuthenticated = !!user;
  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);
  const hasAnyRole = useCallback((roles: UserRole[]) => roles.includes(user?.role as UserRole), [user]);

  const value = { user, login, register, resetPassword, logout, isAuthenticated, hasRole, hasAnyRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useDemoUser() {
  return SEED_USERS[0];
}
