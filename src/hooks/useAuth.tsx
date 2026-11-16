import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { User, UserRole } from '@/types';
import { SEED_USERS } from '@/types';
import { readStore, removeStore, writeStore } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  register: (body: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (body: Partial<User>) => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const SESSION_KEY = 'session';

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_BY_ROLE: Record<UserRole, string> = {
  admin: 'grace@greenfield.example',
  auditor: 'auditor@greenfield.example',
  reviewer: 'reviewer@greenfield.example',
  viewer: 'viewer@greenfield.example',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStore<User | null>(SESSION_KEY, null));

  const persist = useCallback((next: User | null) => {
    setUser(next);
    if (next) writeStore(SESSION_KEY, next);
    else removeStore(SESSION_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { authApi } = await import('@/api/client');
      const data = await authApi.login(email, password);
      persist(data.user);
    },
    [persist],
  );

  const demoLogin = useCallback(
    async (role: UserRole) => {
      const { authApi } = await import('@/api/client');
      const data = await authApi.login(DEMO_BY_ROLE[role], 'password');
      persist(data.user);
    },
    [persist],
  );

  const register = useCallback(
    async (body: { name: string; email: string; password: string; role?: UserRole }) => {
      const { authApi } = await import('@/api/client');
      const data = await authApi.register(body);
      persist(data.user);
    },
    [persist],
  );

  const resetPassword = useCallback(async (email: string) => {
    const { authApi } = await import('@/api/client');
    const result = await authApi.reset(email);
    return result.ok;
  }, []);

  const logout = useCallback(() => persist(null), [persist]);

  const updateProfile = useCallback(
    (body: Partial<User>) => {
      setUser((current) => {
        if (!current) return current;
        const next = { ...current, ...body };
        writeStore(SESSION_KEY, next);
        return next;
      });
    },
    [],
  );

  const isAuthenticated = !!user;
  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);
  const hasAnyRole = useCallback(
    (roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      login,
      demoLogin,
      register,
      resetPassword,
      logout,
      updateProfile,
      isAuthenticated,
      hasRole,
      hasAnyRole,
    }),
    [
      user,
      login,
      demoLogin,
      register,
      resetPassword,
      logout,
      updateProfile,
      isAuthenticated,
      hasRole,
      hasAnyRole,
    ],
  );

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
