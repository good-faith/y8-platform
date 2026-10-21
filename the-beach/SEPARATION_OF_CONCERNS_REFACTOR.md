# Game Manager Separation of Concerns Analysis

## Current Architecture Issues

### 1. **GameManagerService** - Too Many Responsibilities
Currently handles:
- ✅ Agent registration and lifecycle
- ✅ Agent pool management
- ✅ Service routing and load balancing
- ❌ Session management (should be separate)
- ❌ Transaction handling (should be separate)
- ❌ Analytics tracking (should be separate)
- ❌ Geographic/location services (should be separate)

**Problem**: Violates Single Responsibility Principle - doing too much

### 2. **NPETierManagerService** - Mixed Concerns
Currently handles:
- ✅ Tier/subscription management
- ✅ Tier limit enforcement
- ❌ NPE creation (overlaps with GameManagerService)
- ❌ Schema validation (should be separate)
- ❌ Billing/pricing logic (should be separate)

**Problem**: Mixes business logic (tiers/pricing) with agent lifecycle

### 3. **PKPTaskManagerService** - Correctly Scoped ✅
Currently handles:
- ✅ Task assignment for development agents
- ✅ PKP agent coordination
- ✅ Git workflow management
- ✅ Tool registry integration

**Status**: This one is well-designed!

## Proposed Refactoring

### New Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NPE DOMAIN LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AgentRegistryService                                    │  │
│  │  - Register/deregister agents                            │  │
│  │  - Agent lifecycle (spawn, pause, decommission)          │  │
│  │  - Agent metadata and capabilities                       │  │
│  │  - Agent health monitoring                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AgentRoutingService                                     │  │
│  │  - Route service requests to agents                      │  │
│  │  - Load balancing strategies                             │  │
│  │  - Geographic routing                                    │  │
│  │  - Priority queuing                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SessionManagerService                                   │  │
│  │  - Create/manage customer sessions                       │  │
│  │  - Session state management                              │  │
│  │  - Agent handoffs                                        │  │
│  │  - Session analytics                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TierManagerService (Renamed)                            │  │
│  │  - Subscription tier management                          │  │
│  │  - Tier limits and quotas                                │  │
│  │  - Feature flags per tier                                │  │
│  │  - Usage tracking                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PKPTaskManagerService (Unchanged - Already Good!)       │  │
│  │  - Development task management                           │  │
│  │  - PKP agent coordination                                │  │
│  │  - Git workflow automation                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                   SUPPORTING SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ GeoLocationSvc   │  │ AnalyticsSvc     │  │ TransactionSvc│ │
│  │ - Distance calc  │  │ - Metrics        │  │ - Payments    │ │
│  │ - Geofencing     │  │ - Performance    │  │ - Revenue     │ │
│  │ - Area routing   │  │ - Reporting      │  │ - Billing     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Refactoring Plan

### Phase 1: Extract Core Services ✅ PRIORITY

#### 1.1 Create `AgentRegistryService`
**Responsibilities**:
- Agent registration/deregistration
- Agent pool management
- Agent lifecycle (spawn, pause, decommission)
- Agent metadata and capabilities
- Agent health checks

**Extracted from**: GameManagerService

#### 1.2 Create `AgentRoutingService`
**Responsibilities**:
- Route service requests to best agent
- Load balancing (least-load, round-robin, etc.)
- Geographic routing
- Priority queuing
- Fallback strategies

**Extracted from**: GameManagerService

#### 1.3 Create `SessionManagerService`
**Responsibilities**:
- Create/manage customer sessions
- Session state management
- Agent handoffs between sessions
- Session completion/abandonment
- Session analytics

**Extracted from**: GameManagerService

### Phase 2: Supporting Services

#### 2.1 Create `GeoLocationService`
**Responsibilities**:
- Distance calculations
- Geofence validation
- Geographic area routing
- Location-based agent discovery

**Extracted from**: GameManagerService, NPETierManagerService

#### 2.2 Create `AnalyticsService`
**Responsibilities**:
- Agent performance metrics
- Session analytics
- Revenue tracking
- Performance reporting

**Extracted from**: GameManagerService, SessionManagerService

#### 2.3 Create `TransactionService`
**Responsibilities**:
- Payment processing
- Transaction tracking
- Revenue distribution
- Billing integration

**Extracted from**: GameManagerService

### Phase 3: Refactor Existing Services

#### 3.1 Simplify GameManagerService → `AgentCoordinatorService`
**New Role**: High-level orchestration only
- Delegates to AgentRegistryService
- Delegates to AgentRoutingService
- Delegates to SessionManagerService
- Coordinates cross-service workflows
- Handles events and notifications

#### 3.2 Rename NPETierManagerService → `SubscriptionTierService`
**Focused Role**: Subscription and tier management only
- Tier definitions and limits
- Subscription management
- Quota enforcement
- Feature flags
- Usage tracking

## Implementation Steps

### Step 1: Create AgentRegistryService
```typescript
// src/npe/services/agent-registry.service.ts
@Injectable()
export class AgentRegistryService {
  private agents = new Map<string, Agent>();
  private agentPools = new Map<string, Agent[]>();
  
  async registerAgent(params): Promise<Agent> { ... }
  async deregisterAgent(agentId: string): Promise<void> { ... }
  async spawnAgent(purpose: string): Promise<Agent> { ... }
  async getAgent(agentId: string): Promise<Agent> { ... }
  async getAgentsByPurpose(purpose: string): Promise<Agent[]> { ... }
  async updateAgentStatus(agentId: string, status): Promise<void> { ... }
}
```

### Step 2: Create AgentRoutingService
```typescript
// src/npe/services/agent-routing.service.ts
@Injectable()
export class AgentRoutingService {
  constructor(
    private agentRegistry: AgentRegistryService,
    private geoLocation: GeoLocationService,
  ) {}
  
  async routeRequest(request: ServiceRequest): Promise<Agent | null> { ... }
  async findBestAgent(strategy: RoutingStrategy): Promise<Agent | null> { ... }
  async balanceLoad(): Promise<void> { ... }
}
```

### Step 3: Create SessionManagerService
```typescript
// src/npe/services/session-manager.service.ts
@Injectable()
export class SessionManagerService {
  private sessions = new Map<string, Session>();
  
  async createSession(params): Promise<Session> { ... }
  async endSession(sessionId: string): Promise<void> { ... }
  async handoffSession(sessionId: string, newAgentId: string): Promise<void> { ... }
  async getActiveSessions(): Promise<Session[]> { ... }
}
```

### Step 4: Update GameManagerService
```typescript
// src/npe/services/agent-coordinator.service.ts (renamed)
@Injectable()
export class AgentCoordinatorService {
  constructor(
    private agentRegistry: AgentRegistryService,
    private routing: AgentRoutingService,
    private sessions: SessionManagerService,
    private analytics: AnalyticsService,
    private eventEmitter: EventEmitter2,
  ) {}
  
  // High-level orchestration methods only
  async handleServiceRequest(request: ServiceRequest): Promise<Session> {
    const agent = await this.routing.routeRequest(request);
    const session = await this.sessions.createSession({ agent, request });
    this.eventEmitter.emit('session.created', session);
    return session;
  }
}
```

## Benefits

### 1. **Single Responsibility**
Each service has ONE clear purpose

### 2. **Easier Testing**
Mock dependencies, test in isolation

### 3. **Better Maintainability**
Changes are localized to specific services

### 4. **Reusability**
Services can be composed in different ways

### 5. **Clearer API**
Each service has a focused, understandable interface

### 6. **Scalability**
Services can be scaled independently

## Migration Strategy

### Option A: Big Bang (Not Recommended)
- Refactor everything at once
- High risk, long development time
- Hard to test incrementally

### Option B: Gradual Migration (Recommended ✅)
1. Create new services
2. Deprecate methods in old services
3. Update consumers to use new services
4. Remove deprecated methods
5. Slim down old services

### Example Migration:
```typescript
// GameManagerService (during migration)
@Injectable()
export class GameManagerService {
  constructor(
    private agentRegistry: AgentRegistryService, // NEW
  ) {}
  
  /**
   * @deprecated Use AgentRegistryService.registerAgent() instead
   */
  async registerAgent(...): Promise<Agent> {
    this.logger.warn('registerAgent is deprecated, use AgentRegistryService');
    return this.agentRegistry.registerAgent(...);
  }
}
```

## File Structure

```
src/npe/
├── services/
│   ├── agent-registry.service.ts           # NEW
│   ├── agent-routing.service.ts            # NEW
│   ├── session-manager.service.ts          # NEW
│   ├── geo-location.service.ts             # NEW
│   ├── analytics.service.ts                # NEW
│   ├── transaction.service.ts              # NEW
│   ├── agent-coordinator.service.ts        # RENAMED from game-manager
│   ├── subscription-tier.service.ts        # RENAMED from npe-tier-manager
│   ├── pkp-task-manager.service.ts         # UNCHANGED ✅
│   └── ai-agent.service.ts                 # UNCHANGED ✅
├── interfaces/
│   ├── agent.interface.ts
│   ├── session.interface.ts
│   ├── routing.interface.ts
│   └── tier.interface.ts
└── npe.module.ts                           # Updated imports
```

## Next Steps

1. **Review this analysis** - Confirm approach
2. **Create AgentRegistryService** - Start with core service
3. **Create AgentRoutingService** - Extract routing logic
4. **Create SessionManagerService** - Extract session logic
5. **Update GameManagerService** - Delegate to new services
6. **Update tests** - Test new services in isolation
7. **Update controllers** - Use new services
8. **Documentation** - Update API docs

## Priority Order

1. **HIGH**: AgentRegistryService (foundational)
2. **HIGH**: AgentRoutingService (critical path)
3. **MEDIUM**: SessionManagerService (important but less critical)
4. **MEDIUM**: GeoLocationService (supporting)
5. **LOW**: AnalyticsService (can wait)
6. **LOW**: TransactionService (can wait)

---

**Decision Required**: Should we proceed with the gradual migration approach?
