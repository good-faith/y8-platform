import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentsService } from './agents.service';
import { BadRequestException } from '@nestjs/common';
import { AgentWalletService } from '../wallet/agent-wallet.service';

describe('AgentsService', () => {
  let service: AgentsService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          // AgentWalletService is @Optional() — provide a disabled stub so
          // tests run without real CDP credentials.
          provide: AgentWalletService,
          useValue: { isEnabled: () => false },
        },
      ],
    }).compile();

    service      = module.get<AgentsService>(AgentsService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── registerAgent ────────────────────────────────────────────────────────────

  describe('registerAgent', () => {
    it('should register a new agent with default values', async () => {
      const agent = await service.registerAgent({
        walletAddress: '0x1234567890123456789012345678901234567890',
        purpose: 'assistant',
        capabilities: ['chat'],
      });

      expect(agent).toBeDefined();
      expect(agent.id).toBeDefined();
      expect(agent.walletAddress).toBe('0x1234567890123456789012345678901234567890');
      expect(agent.purpose).toBe('assistant');
      expect(agent.capabilities).toEqual(['chat']);
      expect(agent.status).toBe('active');
      expect(agent.currentLoad).toBe(0);
      expect(agent.maxLoad).toBe(10);
      expect(eventEmitter.emit).toHaveBeenCalledWith('agent.registered', agent);
    });
  });

  // ── routing ──────────────────────────────────────────────────────────────────

  describe('routing', () => {
    it('should route request using least-load strategy', async () => {
      const agentA = await service.registerAgent({
        walletAddress: '0x1111111111111111111111111111111111111111',
        purpose: 'agent-a',
        capabilities: ['compute'],
        maxLoad: 5,
      });

      const agentB = await service.registerAgent({
        walletAddress: '0x2222222222222222222222222222222222222222',
        purpose: 'agent-b',
        capabilities: ['compute'],
        maxLoad: 5,
      });

      // Increase load on agent A
      service.createSession(agentA.id, 'customer-1', 'compute');

      const routedAgent = service.route({ service: 'compute' }, { strategy: 'least-load' });
      expect(routedAgent.id).toBe(agentB.id);
    });

    it('should route request using highest-rating strategy', async () => {
      const agentA = await service.registerAgent({
        walletAddress: '0x1111111111111111111111111111111111111111',
        purpose: 'agent-a',
        capabilities: ['compute'],
        performanceScore: 80,
      });

      const agentB = await service.registerAgent({
        walletAddress: '0x2222222222222222222222222222222222222222',
        purpose: 'agent-b',
        capabilities: ['compute'],
        performanceScore: 95,
      });

      const routedAgent = service.route({ service: 'compute' }, { strategy: 'highest-rating' });
      expect(routedAgent.id).toBe(agentB.id);
    });

    it('should route request using round-robin strategy', async () => {
      const agentA = await service.registerAgent({
        walletAddress: '0x1111111111111111111111111111111111111111',
        purpose: 'agent-a',
        capabilities: ['compute'],
      });

      const agentB = await service.registerAgent({
        walletAddress: '0x2222222222222222222222222222222222222222',
        purpose: 'agent-b',
        capabilities: ['compute'],
      });

      const route1 = service.route({ service: 'compute' }, { strategy: 'round-robin' });
      const route2 = service.route({ service: 'compute' }, { strategy: 'round-robin' });
      const route3 = service.route({ service: 'compute' }, { strategy: 'round-robin' });

      expect([route1.id, route2.id]).toContain(agentA.id);
      expect([route1.id, route2.id]).toContain(agentB.id);
      expect(route3.id).toBe(route1.id);
    });

    it('should throw BadRequestException if no active agents match capability', async () => {
      await service.registerAgent({
        walletAddress: '0x1111111111111111111111111111111111111111',
        purpose: 'agent-a',
        capabilities: ['compute'],
      });

      expect(() => {
        service.route({ service: 'payment' });
      }).toThrow(BadRequestException);
    });
  });

  // ── sessions & transactions ───────────────────────────────────────────────────

  describe('sessions & transactions', () => {
    it('should manage session lifecycle and track revenues', async () => {
      const agent = await service.registerAgent({
        walletAddress: '0x1111111111111111111111111111111111111111',
        purpose: 'agent-a',
        capabilities: ['compute'],
      });

      const session = service.createSession(agent.id, 'customer-1', 'compute');
      expect(session).toBeDefined();
      expect(session.status).toBe('active');
      expect(service.findById(agent.id).currentLoad).toBe(1);

      service.addTransaction(session.id, {
        amount: 100,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now(),
        description: 'Payment for compute',
      });

      expect(service.findById(agent.id).totalRevenue).toBe(100);

      service.completeSession(session.id);
      expect(service.findById(agent.id).currentLoad).toBe(0);
      expect(service.getSession(session.id).status).toBe('completed');
    });
  });
});
