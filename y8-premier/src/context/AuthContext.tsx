import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  ethAddress: string;
  primaryAddress: string;
  authorizedIntegrations?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPremium: boolean;
  loginWithWallet: (address: string) => void;
  updatePrimaryAddress: (newAddress: string) => void;
  authorizeIntegration: (integration: string) => void;
  setBankLinked: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

const Y8_APP_ORIGIN: string = (() => {
  const env = (import.meta as any).env?.VITE_Y8_APP_URL as string | undefined;
  if (env) return env.replace(/\/$/, '');
  return 'http://localhost:3000';
})();

function isOriginAllowed(origin: string): boolean {
  if (origin === Y8_APP_ORIGIN) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

function getAuthSyncUrl(): string {
  return `${Y8_APP_ORIGIN}/auth-sync`;
}

function getAppOrigin(): string {
  return Y8_APP_ORIGIN;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean>(
    () => localStorage.getItem('y8_bank_linked') === 'true'
  );

  useEffect(() => {
    const stored = localStorage.getItem('y8_user') || getCookie('y8_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        localStorage.setItem('y8_user', JSON.stringify(parsed));
        setCookie('y8_user', JSON.stringify(parsed), 3600);
      } catch (e) {
        console.error('Failed to parse stored user in premier', e);
      }
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isOriginAllowed(event.origin)) return;

      if (event.data?.type === 'Y8_APP_AUTH_STATE') {
        const { isAuthenticated, address } = event.data;
        if (isAuthenticated && address) {
          const newUser = {
            id: '1',
            name: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
            ethAddress: address,
            primaryAddress: address,
          };
          setUser(newUser);
          localStorage.setItem('y8_user', JSON.stringify(newUser));
          setCookie('y8_user', JSON.stringify(newUser), 3600);
        } else if (!isAuthenticated) {
          setUser(null);
          localStorage.removeItem('y8_user');
          localStorage.removeItem('y8_auth_sig');
          deleteCookie('y8_user');
        }
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const loginWithWallet = (address: string) => {
    const newUser = {
      id: '1',
      name: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      ethAddress: address,
      primaryAddress: address,
    };
    setUser(newUser);
    localStorage.setItem('y8_user', JSON.stringify(newUser));
    setCookie('y8_user', JSON.stringify(newUser), 3600);

    const iframe = document.getElementById('auth-sync-iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      const storedSig = localStorage.getItem('y8_auth_sig');
      let message = '';
      let signature = '';
      if (storedSig) {
        try {
          const parsedSig = JSON.parse(storedSig);
          message = parsedSig.message;
          signature = parsedSig.signature;
        } catch (e) {}
      }
      iframe.contentWindow.postMessage({ type: 'LOGIN', address, message, signature }, getAppOrigin());
    }
  };

  const updatePrimaryAddress = (newAddress: string) => {
    if (user) {
      const updatedUser = { ...user, primaryAddress: newAddress };
      setUser(updatedUser);
      localStorage.setItem('y8_user', JSON.stringify(updatedUser));
      setCookie('y8_user', JSON.stringify(updatedUser), 3600);
    }
  };

  const authorizeIntegration = (integration: string) => {
    if (user) {
      const authorizedIntegrations = user.authorizedIntegrations || [];
      if (!authorizedIntegrations.includes(integration)) {
        const updatedUser = { ...user, authorizedIntegrations: [...authorizedIntegrations, integration] };
        setUser(updatedUser);
        localStorage.setItem('y8_user', JSON.stringify(updatedUser));
        setCookie('y8_user', JSON.stringify(updatedUser), 3600);
      }
    }
  };

  const setBankLinked = () => {
    setIsPremium(true);
    localStorage.setItem('y8_bank_linked', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('y8_user');
    deleteCookie('y8_user');

    const iframe = document.getElementById('auth-sync-iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'LOGOUT' }, getAppOrigin());
    }

    fetch('/api/auth/logout', { method: 'POST' }).catch(err => {
      console.error('Error logging out from server session', err);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isPremium,
      loginWithWallet,
      updatePrimaryAddress,
      authorizeIntegration,
      setBankLinked,
      logout,
    }}>
      {children}
      <iframe
        id="auth-sync-iframe"
        src={`${getAuthSyncUrl()}?parentOrigin=${encodeURIComponent(window.location.origin)}`}
        style={{ display: 'none' }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
