import { Injectable, Logger, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { Agent, Session, ServiceRequest, RoutingStrategy, Transaction } from './agents.types';
import { AgentWalletService } from '../wallet/agent-wallet.service';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);
  private agents = new Map<string, Agent>();
  private sessions = new Map<string, Session>();
  private roundRobinIndex = 0;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Optional() private readonly walletService?: AgentWalletService,
  ) {
    this.logger.log('🎮 AgentsService initialized');
  }

  // ─── Agent Lifecycle ──────────────────────────────────────────────────────

  async registerAgent(
    data: Pick<Agent, 'walletAddress' | 'purpose' | 'capabilities'> & Partial<Agent>,
  ): Promise<Agent> {
    const agent: Agent = {
      id: randomUUID(),
      tier: 'standard',
      role: data.purpose,
      status: 'active',
      currentLoad: 0,
      maxLoad: data.maxLoad ?? 10,
      performanceScore: 100,
      sessionsHandled: 0,
      sessionsCompleted: 0,
      totalRevenue: 0,
      lastActivity: Date.now(),
      ...data,
    };

    // Auto-provision a CDP wallet if AgentKit is configured
    if (this.walletService?.isEnabled() && !agent.baseWalletId) {
      const wallet = await this.walletService.provisionAgentWallet(agent.id).catch(() => null);
      if (wallet) {
        agent.baseWalletId  = wallet.walletId;
        agent.walletAddress = wallet.address; // override with on-chain address
      }
    }

    this.agents.set(agent.id, agent);
    this.eventEmitter.emit('agent.registered', agent);
    this.logger.log(`➕ Agent registered: ${agent.id} (${agent.purpose}) @ ${agent.walletAddress}`);
    return agent;
  }

  findAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  findById(id: string): Agent {
    const agent = this.agents.get(id);
    if (!agent) throw new NotFoundException(`Agent ${id} not found`);
    return agent;
  }

  findByWallet(walletAddress: string): Agent | undefined {
    return Array.from(this.agents.values()).find(
      (a) => a.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
    );
  }

  updateStatus(id: string, status: Agent['status']): Agent {
    const agent = this.findById(id);
    agent.status = status;
    agent.lastActivity = Date.now();
    this.eventEmitter.emit('agent.status_change', { agentId: id, status });
    return agent;
  }

  decommission(id: string): Agent {
    return this.updateStatus(id, 'decommissioned');
  }

  // ─── Routing ──────────────────────────────────────────────────────────────

  route(request: ServiceRequest, strategy: RoutingStrategy = { strategy: 'least-load' }): Agent {
    const candidates = Array.from(this.agents.values()).filter(
      (a) =>
        a.status === 'active' &&
        a.currentLoad < a.maxLoad &&
        (a.capabilities.includes(request.service) || a.capabilities.includes('*')),
    );

    if (candidates.length === 0) {
      throw new BadRequestException(`No available agents for service "${request.service}"`);
    }

    switch (strategy.strategy) {
      case 'least-load':
        return candidates.sort((a, b) => a.currentLoad - b.currentLoad)[0];
      case 'highest-rating':
        return candidates.sort((a, b) => b.performanceScore - a.performanceScore)[0];
      case 'nearest-location': {
        if (!strategy.location) return candidates[0];
        return candidates.sort((a, b) => {
          const distA = this.haversine(strategy.location!, a.location);
          const distB = this.haversine(strategy.location!, b.location);
          return distA - distB;
        })[0];
      }
      case 'round-robin': {
        const agent = candidates[this.roundRobinIndex % candidates.length];
        this.roundRobinIndex++;
        return agent;
      }
      default:
        return candidates[0];
    }
  }

  // ─── Sessions ────────────────────────────────────────────────────────────

  createSession(agentId: string, customerId: string, service: string, context = {}): Session {
    const agent = this.findById(agentId);
    const session: Session = {
      id: randomUUID(),
      customerId,
      agentId,
      service,
      startTime: Date.now(),
      status: 'active',
      context,
      transactions: [],
    };
    agent.currentLoad++;
    agent.sessionsHandled++;
    this.sessions.set(session.id, session);
    this.eventEmitter.emit('session.created', session);
    return session;
  }

  completeSession(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
    session.status = 'completed';
    session.endTime = Date.now();
    const agent = this.agents.get(session.agentId);
    if (agent) {
      agent.currentLoad = Math.max(0, agent.currentLoad - 1);
      agent.sessionsCompleted++;
    }
    this.eventEmitter.emit('session.completed', session);
    return session;
  }

  addTransaction(sessionId: string, tx: Omit<Transaction, 'id' | 'sessionId'>): Transaction {
    const session = this.sessions.get(sessionId);
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
    const transaction: Transaction = { id: randomUUID(), sessionId, ...tx };
    session.transactions.push(transaction);
    const agent = this.agents.get(session.agentId);
    if (agent && tx.status === 'completed') agent.totalRevenue += tx.amount;
    this.eventEmitter.emit('transaction.added', transaction);
    return transaction;
  }

  getSession(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
    return session;
  }

  getAgentSessions(agentId: string): Session[] {
    return Array.from(this.sessions.values()).filter((s) => s.agentId === agentId);
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  getLeaderboard(): Agent[] {
    return Array.from(this.agents.values())
      .filter((a) => a.status !== 'decommissioned')
      .sort((a, b) => b.performanceScore - a.performanceScore);
  }

  getDashboard() {
    const all = Array.from(this.agents.values());
    return {
      totalAgents: all.length,
      activeAgents: all.filter((a) => a.status === 'active').length,
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter((s) => s.status === 'active').length,
      totalRevenue: all.reduce((sum, a) => sum + a.totalRevenue, 0),
      leaderboard: this.getLeaderboard().slice(0, 5),
    };
  }

  // ─── Utility ─────────────────────────────────────────────────────────────

  private haversine(
    a: { lat: number; lng: number },
    b?: { lat: number; lng: number },
  ): number {
    if (!b) return Infinity;
    const R = 6371e3;
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
    const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
    const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
}
