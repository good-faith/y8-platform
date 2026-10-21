import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PKPAuthService } from './services/pkp-auth.service';

/**
 * Game Manager Service
 * 
 * Central orchestrator for all NPE agents in The Beach platform.
 * Manages agent lifecycle, service routing, load balancing, and session coordination.
 * 
 * Now integrated with PKPAuthService:
 * - Main PKPs are human-authenticated via WebAuthn/Social login
 * - Sub-PKPs are AI agents that do autonomous work
 * - All agents must be verified through PKP hierarchy
 */

export interface Agent {
  id: string; // PKP address
  pkp: {
    address: string;
    publicKey: string;
  };
  purpose: string; // 'ai-build#0', 'sales-agent-1', etc.
  role: string; // Human-readable role
  capabilities: string[]; // ['sales', 'support', 'consulting']
  status: 'active' | 'paused' | 'idle' | 'decommissioned';
  currentLoad: number; // Number of active sessions
  maxLoad: number; // Maximum concurrent sessions
  location?: {
    lat: number;
    lng: number;
  };
  serviceArea?: GeoFence;
  performanceScore?: number;
  lastActivity?: number;
  metadata?: Record<string, any>;
  
  // Analytics fields
  sessionsHandled?: number;
  sessionsCompleted?: number;
  totalRevenue?: number;
  uptime?: number;
  lastActive?: number;
}

export interface GeoFence {
  type: 'circle' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number; // meters
  points?: Array<{ lat: number; lng: number }>;
}

export interface AgentPool {
  purpose: string;
  agents: Agent[];
}

export interface Session {
  id: string;
  customerId: string;
  agentId: string;
  service: string;
  startTime: number;
  status: 'active' | 'completed' | 'abandoned';
  context: Record<string, any>;
  transactions: Transaction[];
  previousAgent?: string;
  handoffReason?: string;
  handoffTime?: number;
}

export interface Transaction {
  id: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  description?: string;
}

export interface ServiceRequest {
  service: string;
  location?: { lat: number; lng: number };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  customer?: any;
  context?: Record<string, any>;
}

export interface RoutingStrategy {
  strategy: 'least-load' | 'nearest-location' | 'highest-rating' | 'round-robin';
  location?: { lat: number; lng: number };
  priority?: string;
}

@Injectable()
export class GameManagerService {
  private readonly logger = new Logger(GameManagerService.name);
  
  // Core registries
  private agents = new Map<string, Agent>();
  private agentPools = new Map<string, Agent[]>();
  private sessions = new Map<string, Session>();
  private activeServices = new Map<string, any>();
  
  // Round-robin counter
  private roundRobinIndex = 0;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly pkpAuthService: PKPAuthService,
  ) {
    this.logger.log('🎮 Game Manager initialized with PKP authentication');
  }

  /**
   * Register a new agent with the system
   * 
   * IMPORTANT: All agents must be either:
   * 1. Main PKPs (human-authenticated via PKPAuthService)
   * 2. Sub-PKPs (delegated from main PKPs)
   * 
   * This ensures all agents have proper authorization
   */
  async registerAgent(
    agentPKP: { address: string; publicKey: string },
    purpose: string,
    capabilities: string[],
    options?: Partial<Agent>,
  ): Promise<Agent> {
    // Verify PKP is authenticated (main or sub-PKP)
    const isMain = this.pkpAuthService.isMainPKP(agentPKP.address);
    const isSub = this.pkpAuthService.isSubPKP(agentPKP.address);

    if (!isMain && !isSub) {
      this.logger.warn(`⚠️ Registering unauthenticated PKP: ${agentPKP.address} (${purpose})`);
      this.logger.warn('   → This PKP should be authenticated via /pkp/auth/login first');
    } else if (isSub) {
      const parentPKP = this.pkpAuthService.getParentPKP(agentPKP.address);
      this.logger.log(`🤖 Registering sub-PKP: ${agentPKP.address} (parent: ${parentPKP})`);
    } else {
      this.logger.log(`👤 Registering main PKP: ${agentPKP.address} (human-owned)`);
    }

    const agent: Agent = {
      id: agentPKP.address,
      pkp: agentPKP,
      purpose,
      role: options?.role || purpose,
      capabilities,
      status: 'active',
      currentLoad: 0,
      maxLoad: options?.maxLoad || 10,
      location: options?.location,
      serviceArea: options?.serviceArea,
      performanceScore: 100,
      lastActivity: Date.now(),
      metadata: {
        ...options?.metadata,
        pkpType: isMain ? 'main' : isSub ? 'sub' : 'unverified',
        parentPKP: isSub ? this.pkpAuthService.getParentPKP(agentPKP.address) : undefined,
      },
    };

    this.agents.set(agent.id, agent);
    this.addToPool(purpose, agent);

    this.logger.log(`✅ Agent registered: ${agent.id} (${purpose})`);
    
    // Emit event for monitoring
    this.eventEmitter.emit('agent.registered', { agent });

    return agent;
  }

  /**
   * Add agent to purpose-specific pool
   */
  private addToPool(purpose: string, agent: Agent): void {
    if (!this.agentPools.has(purpose)) {
      this.agentPools.set(purpose, []);
    }
    this.agentPools.get(purpose)!.push(agent);
  }

  /**
   * Spawn a new agent on-demand
   */
  async spawnAgent(
    purpose: string,
    location?: { lat: number; lng: number },
  ): Promise<Agent> {
    this.logger.log(`⚡ Spawning new ${purpose} agent on-demand`);

    // In production, this would mint a new PKP
    // For now, create a placeholder
    const subPKP = {
      address: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`,
      publicKey: `0x04${Math.random().toString(16).slice(2)}`,
    };

    const capabilities = this.getDefaultCapabilities(purpose);
    
    return this.registerAgent(subPKP, purpose, capabilities, {
      location,
      role: `Dynamic ${purpose} agent`,
    });
  }

  /**
   * Get default capabilities for a purpose
   */
  private getDefaultCapabilities(purpose: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      'sales': ['product-presentation', 'negotiation', 'closing'],
      'support': ['troubleshooting', 'refunds', 'escalation'],
      'concierge': ['booking', 'recommendations', 'coordination'],
      'development': ['code-generation', 'testing', 'deployment'],
      'analytics': ['data-collection', 'reporting', 'insights'],
    };

    // Try to match purpose to category
    for (const [category, capabilities] of Object.entries(capabilityMap)) {
      if (purpose.toLowerCase().includes(category)) {
        return capabilities;
      }
    }

    return ['general-assistance'];
  }

  /**
   * Decommission an agent gracefully
   */
  async decommissionAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      this.logger.warn(`Agent ${agentId} not found for decommission`);
      return;
    }

    // Migrate active sessions to other agents
    if (agent.currentLoad > 0) {
      await this.migrateActiveSessions(agentId);
    }

    // Mark as decommissioned
    agent.status = 'decommissioned';
    this.agents.delete(agentId);

    // Remove from pool
    const pool = this.agentPools.get(agent.purpose);
    if (pool) {
      const index = pool.findIndex(a => a.id === agentId);
      if (index !== -1) {
        pool.splice(index, 1);
      }
    }

    this.logger.log(`🔴 Agent ${agentId} decommissioned`);
    this.eventEmitter.emit('agent.decommissioned', { agentId });
  }

  /**
   * Migrate active sessions from one agent to others
   */
  private async migrateActiveSessions(fromAgentId: string): Promise<void> {
    const sessionsToMigrate = Array.from(this.sessions.values())
      .filter(s => s.agentId === fromAgentId && s.status === 'active');

    this.logger.log(`🔀 Migrating ${sessionsToMigrate.length} sessions from ${fromAgentId}`);

    for (const session of sessionsToMigrate) {
      const fromAgent = this.agents.get(fromAgentId);
      const toAgent = await this.routeRequest({
        service: session.service,
        priority: 'high',
      });

      if (toAgent && fromAgent) {
        await this.handoffSession(session.id, fromAgent, toAgent, 'agent-decommission');
      }
    }
  }

  /**
   * Route service request to best available agent
   */
  async routeRequest(request: ServiceRequest): Promise<Agent | null> {
    const { service, location, priority } = request;

    // Get agents capable of handling this service
    const capableAgents = Array.from(this.agents.values()).filter(
      agent =>
        agent.capabilities.includes(service) &&
        agent.status === 'active' &&
        agent.currentLoad < agent.maxLoad,
    );

    if (capableAgents.length === 0) {
      // No available agents - spawn new one
      this.logger.log(`⚡ No agents available for ${service}, spawning new agent`);
      return await this.spawnAgent(service, location);
    }

    // Apply routing strategy
    const strategy: RoutingStrategy = {
      strategy: priority === 'urgent' ? 'highest-rating' : 'least-load',
      location,
      priority,
    };

    const selectedAgent = this.selectAgent(capableAgents, strategy);

    if (selectedAgent) {
      selectedAgent.currentLoad++;
      selectedAgent.lastActivity = Date.now();
    }

    return selectedAgent;
  }

  /**
   * Select best agent based on routing strategy
   */
  private selectAgent(agents: Agent[], options: RoutingStrategy): Agent | null {
    if (agents.length === 0) return null;

    switch (options.strategy) {
      case 'least-load':
        return agents.reduce((best, agent) =>
          agent.currentLoad < best.currentLoad ? agent : best,
        );

      case 'nearest-location':
        if (!options.location) return agents[0];
        return this.findNearestAgent(agents, options.location);

      case 'highest-rating':
        return agents.sort((a, b) =>
          (b.performanceScore || 0) - (a.performanceScore || 0),
        )[0];

      case 'round-robin':
        const agent = agents[this.roundRobinIndex % agents.length];
        this.roundRobinIndex++;
        return agent;

      default:
        return agents[0];
    }
  }

  /**
   * Find nearest agent to a location
   */
  private findNearestAgent(
    agents: Agent[],
    location: { lat: number; lng: number },
  ): Agent {
    const agentsWithLocation = agents.filter(a => a.location);

    if (agentsWithLocation.length === 0) {
      return agents[0];
    }

    return agentsWithLocation.reduce((nearest, agent) => {
      const distanceToAgent = this.calculateDistance(location, agent.location!);
      const distanceToNearest = this.calculateDistance(location, nearest.location!);
      return distanceToAgent < distanceToNearest ? agent : nearest;
    });
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number },
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Create a new customer-agent session
   */
  async createSession(
    customer: any,
    agent: Agent,
    service: string,
  ): Promise<Session> {
    const session: Session = {
      id: this.generateSessionId(),
      customerId: customer.id,
      agentId: agent.id,
      service,
      startTime: Date.now(),
      status: 'active',
      context: {},
      transactions: [],
    };

    this.sessions.set(session.id, session);

    this.logger.log(`🆕 Session created: ${session.id} (${customer.id} → ${agent.id})`);
    this.eventEmitter.emit('session.created', { session });

    return session;
  }

  /**
   * Handoff session from one agent to another
   */
  async handoffSession(
    sessionId: string,
    fromAgent: Agent,
    toAgent: Agent,
    reason: string,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn(`Session ${sessionId} not found for handoff`);
      return;
    }

    session.previousAgent = fromAgent.id;
    session.agentId = toAgent.id;
    session.handoffReason = reason;
    session.handoffTime = Date.now();

    // Update agent loads
    fromAgent.currentLoad = Math.max(0, fromAgent.currentLoad - 1);
    toAgent.currentLoad++;

    this.logger.log(`🔀 Session ${sessionId} handed off: ${fromAgent.id} → ${toAgent.id} (${reason})`);
    this.eventEmitter.emit('session.handoff', { session, fromAgent, toAgent, reason });
  }

  /**
   * Get all agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by purpose
   */
  getAgentsByPurpose(purpose: string): Agent[] {
    return this.agentPools.get(purpose) || [];
  }

  /**
   * Get network statistics
   */
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): any {
    const agents = this.getAgents();
    const activeSessions = this.getActiveSessions();

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      idleAgents: agents.filter(a => a.status === 'active' && a.currentLoad === 0).length,
      busyAgents: agents.filter(a => a.currentLoad > 0).length,
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      avgLoad: agents.reduce((sum, a) => sum + a.currentLoad, 0) / agents.length || 0,
      avgPerformance: agents.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / agents.length || 0,
      purposes: Array.from(this.agentPools.keys()),
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Update agent performance score
   */
  async updatePerformanceScore(agentId: string, score: number): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.performanceScore = Math.max(0, Math.min(100, score));
      this.eventEmitter.emit('agent.performance.updated', { agentId, score });
    }
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return;
    }

    session.status = 'completed';
    
    const agent = this.agents.get(session.agentId);
    if (agent) {
      agent.currentLoad = Math.max(0, agent.currentLoad - 1);
    }

    this.logger.log(`✅ Session completed: ${sessionId}`);
    this.eventEmitter.emit('session.completed', { session });
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }
}
