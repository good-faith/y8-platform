import type {
  Y8User,
  Agent,
  Session,
  ComputeJob,
  GeoZone,
  ApiResponse,
} from '@y8/types';

// ─── Config ───────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_Y8_API_URL ??
       process.env.Y8_API_URL ??
       'http://localhost:3001')
    : (process.env.Y8_API_URL ?? 'http://localhost:3001');

// ─── Client ───────────────────────────────────────────────────────────────

class Y8ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setToken(token: string | null) {
    this.token = token;
    return this;
  }

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(init?.headers as Record<string, string>),
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message ?? `Y8 API error ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  // ── Auth ────────────────────────────────────────────────────────────────

  auth = {
    nonce: () =>
      this.fetch<{ nonce: string; expiresAt: number }>('/api/v1/auth/nonce'),

    verify: (message: string, signature: string) =>
      this.fetch<{ accessToken: string; user: Y8User }>('/api/v1/auth/siwe/verify', {
        method: 'POST',
        body: JSON.stringify({ message, signature }),
      }),

    me: () => this.fetch<Y8User>('/api/v1/auth/me'),
  };

  // ── Agents ──────────────────────────────────────────────────────────────

  agents = {
    list: () => this.fetch<Agent[]>('/api/v1/agents'),
    get: (id: string) => this.fetch<Agent>(`/api/v1/agents/${id}`),
    dashboard: () => this.fetch<{
      totalAgents: number;
      activeAgents: number;
      totalSessions: number;
      activeSessions: number;
      totalRevenue: number;
      leaderboard: Agent[];
    }>('/api/v1/agents/dashboard'),
    leaderboard: () => this.fetch<Agent[]>('/api/v1/agents/leaderboard'),
    register: (data: Partial<Agent>) =>
      this.fetch<Agent>('/api/v1/agents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: Agent['status']) =>
      this.fetch<Agent>(`/api/v1/agents/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  };

  // ── Geo Zones ───────────────────────────────────────────────────────────

  geo = {
    list: () => this.fetch<GeoZone[]>('/api/v1/geo/zones'),
    get: (id: string) => this.fetch<GeoZone>(`/api/v1/geo/zones/${id}`),
    nearby: (lat: number, lng: number, radiusKm: number) =>
      this.fetch<GeoZone[]>(
        `/api/v1/geo/zones/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`,
      ),
  };

  // ── Compute Jobs ────────────────────────────────────────────────────────

  compute = {
    enqueue: (type: string, payload: Record<string, unknown>) =>
      this.fetch<ComputeJob>('/api/v1/compute/jobs', {
        method: 'POST',
        body: JSON.stringify({ type, payload }),
      }),
    getJob: (id: string) => this.fetch<ComputeJob>(`/api/v1/compute/jobs/${id}`),
    listJobs: () => this.fetch<ComputeJob[]>('/api/v1/compute/jobs'),
  };

  // ── Health ──────────────────────────────────────────────────────────────

  health = {
    check: () => this.fetch<{ status: string; ts: number }>('/api/v1/health'),
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────

export const y8 = new Y8ApiClient();
export { Y8ApiClient };
export type { Y8User, Agent, Session, ComputeJob, GeoZone };
