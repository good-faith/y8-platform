/**
 * y8-client.ts
 * Typed API client for y8-server.
 * All methods accept an explicit Bearer token so this module works
 * in React components (via useAuth) and server-side (Next.js API routes).
 */

const Y8_SERVER =
  process.env.NEXT_PUBLIC_Y8_SERVER_URL || 'http://localhost:3001/api/v1';

// ─── Shared types ──────────────────────────────────────────────────────────────

export interface Y8User {
  id: string;
  walletAddress: string;
  tier: 'free' | 'basic' | 'pro' | 'elite';
  role: 'user' | 'admin';
  createdAt: number;
}

export interface Y8Agent {
  id: string;
  walletAddress: string;
  baseWalletId?: string;
  purpose: string;
  role: string;
  capabilities: string[];
  status: 'active' | 'paused' | 'idle' | 'decommissioned';
  currentLoad: number;
  maxLoad: number;
  performanceScore: number;
  tier: 'alpha' | 'beta' | 'standard';
  location?: { lat: number; lng: number };
  sessionsHandled: number;
  sessionsCompleted: number;
  totalRevenue: number;
  lastActivity: number;
  metadata?: Record<string, unknown>;
}

export interface Y8DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalSessions: number;
  activeSessions: number;
  totalRevenue: number;
  averagePerformanceScore: number;
  topAgents: Y8Agent[];
}

export interface Y8Job {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  payload: Record<string, unknown>;
  result?: unknown;
  error?: string;
  agentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Y8StateEntry {
  cid: string;
  owner: string;
  data: unknown;
  createdAt: number;
}

export interface Y8BlockInfo {
  number: bigint | string;
  hash: string;
  timestamp: bigint | string;
  baseFeePerGas: bigint | string | null;
}

export interface Y8BalanceInfo {
  address: string;
  balance: string;
  balanceEth: string;
  chainId: number;
}

// ─── Internal fetch helper ─────────────────────────────────────────────────────

async function api<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${Y8_SERVER}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`y8-server ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const y8Auth = {
  /** Step 1: get a one-time nonce to embed in the SIWE message */
  nonce(): Promise<{ nonce: string; expiresAt: number }> {
    return api('/auth/nonce', null);
  },

  /**
   * Step 2: verify a signed SIWE message, returns a y8-server JWT.
   * Called server-side inside NextAuth authorize() — no token needed.
   */
  verify(message: string, signature: string): Promise<{ accessToken: string; user: Y8User }> {
    return api('/auth/siwe/verify', null, {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    });
  },

  /** Get the current authenticated user profile */
  me(token: string): Promise<Y8User> {
    return api('/auth/me', token);
  },
};

// ─── Agents ───────────────────────────────────────────────────────────────────

export const y8Agents = {
  list(token: string): Promise<Y8Agent[]> {
    return api('/agents', token);
  },

  dashboard(token: string): Promise<Y8DashboardStats> {
    return api('/agents/dashboard', token);
  },

  leaderboard(token: string): Promise<Y8Agent[]> {
    return api('/agents/leaderboard', token);
  },

  getById(id: string, token: string): Promise<Y8Agent> {
    return api(`/agents/${id}`, token);
  },

  register(
    data: Pick<Y8Agent, 'walletAddress' | 'purpose' | 'capabilities'> & Partial<Y8Agent>,
    token: string,
  ): Promise<Y8Agent> {
    return api('/agents', token, { method: 'POST', body: JSON.stringify(data) });
  },

  updateStatus(
    id: string,
    status: Y8Agent['status'],
    token: string,
  ): Promise<Y8Agent> {
    return api(`/agents/${id}/status`, token, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  route(
    request: { service: string; location?: { lat: number; lng: number }; priority?: string },
    token: string,
  ): Promise<Y8Agent> {
    return api('/agents/route', token, {
      method: 'POST',
      body: JSON.stringify({ request, strategy: { strategy: 'least-load' } }),
    });
  },

  sessions(agentId: string, token: string): Promise<unknown[]> {
    return api(`/agents/${agentId}/sessions`, token);
  },
};

// ─── Compute ──────────────────────────────────────────────────────────────────

export const y8Compute = {
  submit(
    type: string,
    payload: Record<string, unknown>,
    token: string,
    agentId?: string,
  ): Promise<Y8Job> {
    return api('/compute/jobs', token, {
      method: 'POST',
      body: JSON.stringify({ type, payload, agentId }),
    });
  },

  get(id: string, token: string): Promise<Y8Job> {
    return api(`/compute/jobs/${id}`, token);
  },

  list(token: string, agentId?: string): Promise<Y8Job[]> {
    const qs = agentId ? `?agentId=${agentId}` : '';
    return api(`/compute/jobs${qs}`, token);
  },
};

// ─── State ────────────────────────────────────────────────────────────────────

export const y8State = {
  put(data: unknown, token: string): Promise<Y8StateEntry> {
    return api('/state', token, { method: 'POST', body: JSON.stringify({ data }) });
  },

  get(cid: string, token: string): Promise<Y8StateEntry> {
    return api(`/state/${cid}`, token);
  },

  listByOwner(address: string, token: string): Promise<Y8StateEntry[]> {
    return api(`/state/owner/${address}`, token);
  },

  remove(cid: string, token: string): Promise<void> {
    return api(`/state/${cid}`, token, { method: 'DELETE' });
  },
};

// ─── Chain (Base) ─────────────────────────────────────────────────────────────

export const y8Chain = {
  block(token: string): Promise<Y8BlockInfo> {
    return api('/chain/block', token);
  },

  balance(address: string, token: string): Promise<Y8BalanceInfo> {
    return api(`/chain/balance/${address}`, token);
  },

  resolve(name: string, token: string): Promise<{ name: string; address: string | null }> {
    return api(`/chain/resolve/${name}`, token);
  },

  verify(address: string, token: string): Promise<{ address: string; isValid: boolean; isContract: boolean }> {
    return api(`/chain/verify/${address}`, token);
  },
};

// ─── Default export (namespaced) ──────────────────────────────────────────────

const y8 = { auth: y8Auth, agents: y8Agents, compute: y8Compute, state: y8State, chain: y8Chain };
export default y8;
