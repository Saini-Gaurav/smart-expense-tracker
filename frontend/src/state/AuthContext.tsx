import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import api, { setAccessToken } from '../api/client';
import type { LoginPayload, RegisterPayload, User } from '../types/auth';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', payload);
      setAccessToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', payload);
      setAccessToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      hydrate,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, hydrate, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
