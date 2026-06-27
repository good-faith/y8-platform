export interface Agent {
  id: string;              // UUID
  walletAddress: string;   // Base wallet address (0x...)
  baseWalletId?: string;   // Coinbase CDP wallet ID
  purpose: string;
  role: string;
  capabilities: string[];
  status: 'active' | 'paused' | 'idle' | 'decommissioned';
  currentLoad: number;
  maxLoad: number;
  performanceScore: number;
  tier: 'alpha' | 'beta' | 'standard';
  location?: { lat: number; lng: number };
  serviceArea?: GeoFence;
  sessionsHandled: number;
  sessionsCompleted: number;
  totalRevenue: number;
  lastActivity: number;
  metadata?: Record<string, any>;
}

export interface GeoFence {
  type: 'circle' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number;
  points?: Array<{ lat: number; lng: number }>;
}

export interface Session {
  id: string;
  customerId: string;
  agentId: string;
  service: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'abandoned';
  context: Record<string, any>;
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
  txHash?: string; // Base chain tx hash (optional)
}

export interface ServiceRequest {
  service: string;
  location?: { lat: number; lng: number };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  customerId?: string;
  context?: Record<string, any>;
}

export interface RoutingStrategy {
  strategy: 'least-load' | 'nearest-location' | 'highest-rating' | 'round-robin';
  location?: { lat: number; lng: number };
}
