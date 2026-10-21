"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import type { Y8User } from '../lib/y8-client';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserProfile = {
  address: string;
  role?: 'admin' | 'user';
};

export type UserPreferences = {
  primaryDomain?: string;
  balancingStrategy?: string;
  tradePreference?: string;
  automationStyle?: string;
};

type AuthContextType = {
  /** Wallet address from NextAuth SIWE session */
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Legacy NextAuth session token (kept for backwards compat) */
  sessionToken: string | null;
  /** y8-server JWT — use as Bearer token for all y8 API calls */
  y8Token: string | null;
  /** Full y8-server user profile (tier, role, id, etc.) */
  y8User: Y8User | null;
  /** True when y8Token is present (i.e. y8-server is reachable and user is on Base) */
  isY8Authenticated: boolean;
  /** Persisted operator preferences (domain, balancing, trade, automation) */
  preferences: UserPreferences;
  updatePreference: (key: keyof UserPreferences, value: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() ?? '');
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const [user, setUser]               = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [y8Token, setY8Token]         = useState<string | null>(null);
  const [y8User, setY8User]           = useState<Y8User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  // hasResolved: stays false until session status has settled AND user state is synced.
  // This prevents the 1-render-cycle window where status='authenticated' but user=null
  // which was causing the RouteGuard to redirect to /auth on every page load.
  const [hasResolved, setHasResolved] = useState(false);

  const isLoading = status === 'loading' || !hasResolved;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('y8_user_preferences');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  const updatePreference = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem('y8_user_preferences', JSON.stringify(next));
      }
      return next;
    });
  };

  // ── Sync from NextAuth session ─────────────────────────────────────────────
  useEffect(() => {
    if (status === 'authenticated' && session?.address) {
      const addr = session.address as string;
      const mockUser = {
        id: (session as any)?.y8User?.id ?? 'user_mock_123',
        name: `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`,
        ethAddress: addr,
        primaryAddress: addr,
      };

      setUser({
        address: addr,
        role: (session as any)?.role ?? 'user',
      });

      // Legacy token path (kept for backward compat)
      if ((session as any)?.token) {
        setSessionToken((session as any).token);
      }

      // y8-server JWT (set when y8-server is reachable + user is on Base)
      setY8Token((session as any)?.y8Token ?? null);
      setY8User((session as any)?.y8User ?? null);

      localStorage.setItem('y8_user', JSON.stringify(mockUser));
      setCookie('y8_user', JSON.stringify(mockUser), 3600);
      setHasResolved(true);
    } else if (status === 'unauthenticated') {
      setUser(null);
      setSessionToken(null);
      setY8Token(null);
      setY8User(null);
      setHasResolved(true);
    }
    // status === 'loading': leave hasResolved as-is (keep showing spinner)
  }, [session, status]);

  const isAuthenticated   = user !== null;
  const isY8Authenticated = isAuthenticated && y8Token !== null;

  const logout = async () => {
    setUser(null);
    setSessionToken(null);
    setY8Token(null);
    setY8User(null);
    localStorage.removeItem('y8_user');
    deleteCookie('y8_user');
    await signOut({ redirect: true, callbackUrl: '/auth' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      sessionToken,
      y8Token,
      y8User,
      isY8Authenticated,
      preferences,
      updatePreference,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
