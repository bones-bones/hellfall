import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAuthApiUrl } from './getAuthApiUrl';
import type { AuthState, AuthUser } from './types';

const AuthContext = createContext<AuthState | null>(null);

async function fetchMe(baseUrl: string): Promise<AuthUser | null> {
  const res = await fetch(`${baseUrl}/api/me`, { credentials: 'include' });
  if (!res.ok) return null;
  const data = (await res.json()) as { user: AuthUser | null };
  return data.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const baseUrl = getAuthApiUrl();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!baseUrl);

  const refetch = useCallback(async () => {
    if (!baseUrl) return;
    setLoading(true);
    try {
      const u = await fetchMe(baseUrl);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (!baseUrl) {
      setLoading(false);
      return;
    }
    refetch();
  }, [baseUrl, refetch]);

  // After redirect from Discord callback, refetch so we have the user
  useEffect(() => {
    if (!baseUrl) return;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'ok' || auth === 'error') {
      refetch();
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [baseUrl, refetch]);

  const value: AuthState = {
    user,
    loading,
    loginUrl: baseUrl ? `${baseUrl}/api/discord/login` : '',
    logoutUrl: baseUrl
      ? `${baseUrl}/api/logout?redirect=${encodeURIComponent(window.location.origin + (window.location.pathname || '/hellfall'))}`
      : '',
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
