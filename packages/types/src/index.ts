// ─── Users & Auth ─────────────────────────────────────────────────────────
export interface Y8User {
  id: string;
  walletAddress: string;
  tier: 'free' | 'basic' | 'pro' | 'elite';
  role: 'user' | 'admin';
  createdAt: number;
}

export interface AuthTokenPayload {
  sub: string;
  address: string;
  tier: Y8User['tier'];
  role: Y8User['role'];
  iat?: number;
  exp?: number;
}

// ─── Agents ───────────────────────────────────────────────────────────────
export interface Agent {
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
  location?: GeoCoord;
  serviceArea?: GeoFence;
  sessionsHandled: number;
  sessionsCompleted: number;
  totalRevenue: number;
  lastActivity: number;
  metadata?: Record<string, unknown>;
}

export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface GeoFence {
  type: 'circle' | 'polygon';
  center?: GeoCoord;
  radius?: number;
  points?: GeoCoord[];
}

// ─── Sessions & Transactions ───────────────────────────────────────────────
export interface Session {
  id: string;
  customerId: string;
  agentId: string;
  service: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'abandoned';
  context: Record<string, unknown>;
  transactions: Transaction[];
  previousAgent?: string;
  handoffReason?: string;
}

export interface Transaction {
  id: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  description?: string;
  txHash?: string;
}

// ─── Compute Jobs ─────────────────────────────────────────────────────────
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ComputeJob {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  result?: unknown;
  error?: string;
  agentId?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  attempts: number;
}

// ─── Geo Zones ────────────────────────────────────────────────────────────
export type ZoneShape = 'circle' | 'polygon';
export type SafetyRating = 'verified' | 'community' | 'unrated' | 'flagged';

export interface GeoZone {
  id: string;
  name: string;
  description?: string;
  shape: ZoneShape;
  center?: GeoCoord;
  radiusMeters?: number;
  points?: GeoCoord[];
  safetyScore: number;
  safetyRating: SafetyRating;
  categories: Array<'geo' | 'labor' | 'rides' | 'rooms' | 'market'>;
  createdBy: string;
  txHash?: string;
  countryCode?: string;
  region?: string;
  verified: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── Market / Finance ─────────────────────────────────────────────────────
export interface MarketTick {
  symbol: string;
  price: number;
  change24h: number;
  changePct24h: number;
  volume24h: number;
  timestamp: number;
}

export interface RelativeStrength {
  symbol: string;
  rsBtc: number;    // RS vs BTC
  rsEth: number;    // RS vs ETH
  rsUsd: number;    // RS vs USD
  score: number;    // Composite 0-100
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  timestamp: number;
}

// ─── API Responses ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
