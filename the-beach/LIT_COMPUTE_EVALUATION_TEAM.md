# Lit Compute Network - Evaluation & Implementation Team

## Executive Summary

This document defines the evaluation team responsible for determining the best codebase architecture to implement the complete Lit Compute Network project, utilizing:

1. **Y8 App** - Next.js 15, Lit Protocol authentication, Web3 integration
2. **The Beach (test branch)** - NestJS backend, WebXR, Socket.IO multiplayer
3. **Redis Vercel** - State management between applications

## Team Structure

### 1. NPE_Architect (Team Lead)
**Role**: Chief Technical Architect & Evaluation Coordinator

**Responsibilities**:
- Coordinate evaluation team activities
- Make final architectural decisions
- Ensure Redis state management strategy
- Design microservices architecture
- Define API contracts between apps

**Initial Assessment**:
- Y8 App: Frontend-heavy, Next.js with authentication ✅
- The Beach: Real-time backend, WebSocket infrastructure ✅
- Gap: Need Redis state layer for cross-app communication

---

### 2. NPE_Frontend_Evaluator
**Role**: Frontend Architecture Analysis

**Evaluation Criteria**:
1. **UI Framework Suitability**
   - Y8 App: Next.js 15 with React 18 ✅
   - The Beach: Static HTML/vanilla JS
   - **Recommendation**: Use Y8 App for all user-facing interfaces

2. **Authentication Layer**
   - Y8 App: Lit Protocol PKP integration ✅
   - The Beach: No authentication
   - **Recommendation**: Y8 App handles all auth flows

3. **Wallet Integration**
   - Y8 App: Web3Modal, WalletConnect, MetaMask ✅
   - The Beach: None
   - **Recommendation**: Y8 App for wallet connections

4. **Components to Build**:
   - Node operator dashboard (Y8 App)
   - Job submission interface (Y8 App)
   - Desktop node app UI (Y8 App + Electron)
   - SDK documentation site (Y8 App)

**Assignment**: Build all frontend interfaces in Y8 App

---

### 3. NPE_Backend_Evaluator
**Role**: Backend Services & API Design

**Evaluation Criteria**:
1. **Framework Maturity**
   - Y8 App: Next.js API routes (serverless)
   - The Beach: NestJS (full backend framework) ✅
   - **Recommendation**: Use NestJS for core services

2. **Real-time Capabilities**
   - Y8 App: Limited (Vercel serverless constraints)
   - The Beach: Socket.IO WebSocket gateway ✅
   - **Recommendation**: The Beach for real-time job coordination

3. **Service Architecture**
   - Y8 App: Monolithic Next.js
   - The Beach: Modular NestJS (modules/controllers/services) ✅
   - **Recommendation**: Extend The Beach with Lit Compute modules

4. **Services to Build**:
   - Job coordination service (The Beach)
   - Node registration/heartbeat (The Beach)
   - Payment processing (The Beach)
   - Encryption queue manager (The Beach)

**Assignment**: Build backend services in The Beach (NestJS)

---

### 4. NPE_Database_Evaluator
**Role**: Data Storage & State Management

**Evaluation Criteria**:
1. **State Management Strategy**
   - Redis Vercel KV: Session state, job queues ✅
   - PostgreSQL: Persistent data (nodes, jobs, payments)
   - IPFS: Encrypted payloads, results

2. **Redis Use Cases**:
   ```typescript
   // Job Queue (Redis)
   interface JobQueue {
     pending: Job[];      // Jobs waiting for nodes
     active: Job[];       // Currently processing
     completed: Job[];    // Finished jobs
   }

   // Node Registry (Redis + TTL)
   interface NodeRegistry {
     [nodeId: string]: {
       lastHeartbeat: number;
       availableCapacity: number;
       reputation: number;
     }
   }

   // Session State (Redis)
   interface UserSession {
     userId: string;
     pkp: string;
     activeSessions: WebSocket[];
   }
   ```

3. **Database Schema** (PostgreSQL):
   ```sql
   -- Nodes table
   CREATE TABLE lit_compute_nodes (
     id UUID PRIMARY KEY,
     wallet_address VARCHAR(42) UNIQUE,
     public_key TEXT,
     reputation_score INTEGER DEFAULT 0,
     total_jobs_completed INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Jobs table
   CREATE TABLE encryption_jobs (
     id UUID PRIMARY KEY,
     submitter_address VARCHAR(42),
     node_id UUID REFERENCES lit_compute_nodes(id),
     status VARCHAR(20), -- pending, active, completed, failed
     input_cid VARCHAR(64),
     output_cid VARCHAR(64),
     fee_amount DECIMAL(18,8),
     created_at TIMESTAMP DEFAULT NOW(),
     completed_at TIMESTAMP
   );

   -- Payments table
   CREATE TABLE node_payments (
     id UUID PRIMARY KEY,
     node_id UUID REFERENCES lit_compute_nodes(id),
     job_id UUID REFERENCES encryption_jobs(id),
     amount DECIMAL(18,8),
     tx_hash VARCHAR(66),
     paid_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Redis Configuration** (Vercel KV):
   ```typescript
   // vercel.json for both apps
   {
     "env": {
       "REDIS_URL": "@lit-compute-redis-url",
       "REDIS_TOKEN": "@lit-compute-redis-token"
     }
   }
   ```

**Assignment**: Design and implement Redis + PostgreSQL architecture

---

### 5. NPE_Integration_Evaluator
**Role**: Inter-App Communication & API Design

**Evaluation Criteria**:
1. **Communication Patterns**:
   - Y8 App → The Beach: REST API (job submission)
   - The Beach → Y8 App: WebSocket (real-time updates)
   - Both → Redis: State sync (session sharing)

2. **API Contracts**:
   ```typescript
   // Y8 App exposes (Next.js API Routes)
   POST /api/auth/lit-session        // Create PKP session
   GET  /api/user/profile             // User profile
   POST /api/jobs/submit              // Submit encryption job

   // The Beach exposes (NestJS Controllers)
   POST /lit-compute/nodes/register   // Node registration
   POST /lit-compute/nodes/heartbeat  // Node status
   GET  /lit-compute/jobs/pending     // Get available jobs
   POST /lit-compute/jobs/:id/accept  // Accept job
   POST /lit-compute/jobs/:id/complete // Submit result
   WS   /lit-compute/events           // Real-time job updates
   ```

3. **Redis State Sharing**:
   ```typescript
   // Shared Redis keys structure
   const REDIS_KEYS = {
     USER_SESSION: `session:${userId}`,
     JOB_QUEUE: `jobs:pending`,
     NODE_STATUS: `nodes:${nodeId}:status`,
     JOB_STATUS: `jobs:${jobId}:status`,
     PAYMENT_PENDING: `payments:pending:${nodeId}`
   };
   ```

4. **Integration Flow**:
   ```
   User (Y8 App) → Submit Job → Redis Queue → The Beach picks up
                                    ↓
   The Beach → Assign to Node → Node processes → Result to IPFS
       ↓                                               ↓
   Update Redis → Y8 App receives WebSocket → Display to user
   ```

**Assignment**: Build integration layer and API gateway

---

### 6. NPE_SmartContract_Evaluator
**Role**: Blockchain Integration & Smart Contract Deployment

**Evaluation Criteria**:
1. **Deployment Platform**:
   - Y8 App: Has ethers.js integration ✅
   - The Beach: No blockchain code
   - **Recommendation**: Deploy contracts via Y8 App, call from both

2. **Contract Suite**:
   ```solidity
   // 1. LitComputeCoordinator.sol (main contract)
   contract LitComputeCoordinator {
     mapping(address => Node) public nodes;
     mapping(bytes32 => Job) public jobs;
     
     function registerNode(bytes calldata publicKey) external;
     function submitJob(bytes32 inputCID) external payable;
     function completeJob(bytes32 jobId, bytes32 outputCID) external;
     function claimPayment(bytes32[] calldata jobIds) external;
   }

   // 2. LitComputeToken.sol (payment token - optional)
   contract LitComputeToken is ERC20 {
     // Standard ERC20 for platform payments
   }

   // 3. NodeRegistry.sol (reputation & staking)
   contract NodeRegistry {
     mapping(address => uint256) public stakes;
     mapping(address => uint256) public reputationScores;
     
     function stakeTokens(uint256 amount) external;
     function slashNode(address node) external onlyCoordinator;
   }
   ```

3. **Deployment Strategy**:
   - Testnet first: Sepolia, Mumbai
   - Mainnet: Ethereum, Polygon
   - Deploy from Y8 App using Hardhat

**Assignment**: Deploy smart contracts and integrate with both apps

---

### 7. NPE_Security_Evaluator
**Role**: Security Audit & Best Practices

**Evaluation Criteria**:
1. **Authentication Security**:
   - Y8 App Lit Protocol: PKP-based auth ✅
   - Node authentication: Wallet signatures ✅
   - API security: JWT tokens + Redis sessions

2. **Data Security**:
   - Encryption at rest: IPFS + Lit Protocol
   - Transport security: HTTPS/WSS only
   - Redis security: TLS connections, token auth

3. **Smart Contract Security**:
   - Reentrancy protection
   - Access control (OpenZeppelin)
   - Pausable contracts
   - Rate limiting

4. **Security Checklist**:
   - [ ] All API endpoints require authentication
   - [ ] Redis keys use proper namespacing
   - [ ] Smart contracts audited (Slither, Mythril)
   - [ ] Environment variables never committed
   - [ ] CORS properly configured
   - [ ] Rate limiting on job submission
   - [ ] Node staking mechanism implemented

**Assignment**: Conduct security audit before mainnet launch

---

## Codebase Assignment Matrix

| Component | Y8 App | The Beach | Redis | Smart Contracts |
|-----------|--------|-----------|-------|-----------------|
| **User Dashboard** | ✅ Primary | - | Session | Read-only |
| **Node Dashboard** | ✅ Primary | - | Session | Read/Write |
| **Job Submission UI** | ✅ Primary | - | Write | Write |
| **Authentication** | ✅ Primary | - | Session | - |
| **Job Coordination** | - | ✅ Primary | Read/Write | Write |
| **Node Registration** | - | ✅ Primary | Write | Write |
| **Real-time Updates** | WebSocket Client | ✅ WebSocket Server | Pub/Sub | Events |
| **Payment Processing** | - | ✅ Primary | Write | Read/Write |
| **Encryption Queue** | - | ✅ Primary | Queue | - |
| **Node Software** | - | ✅ Primary | Heartbeat | Read |

---

## Redis Vercel Architecture

### Redis Key Schema

```typescript
// User sessions (TTL: 24 hours)
session:{userId}:pkp                    // PKP data
session:{userId}:wallet                 // Wallet address
session:{userId}:sessionSigs            // Lit session signatures

// Job queue (sorted sets by priority/timestamp)
jobs:pending                            // Pending jobs (sorted by timestamp)
jobs:active:{nodeId}                    // Jobs assigned to specific node
jobs:completed                          // Completed jobs (TTL: 7 days)

// Node registry (hashes with TTL: 5 minutes)
nodes:{nodeId}:status                   // Node status and capabilities
nodes:{nodeId}:heartbeat                // Last heartbeat timestamp
nodes:available                         // Set of available node IDs

// Job status (hashes)
job:{jobId}:status                      // Current job status
job:{jobId}:progress                    // Processing progress (0-100)
job:{jobId}:node                        // Assigned node ID

// Payment queue (lists)
payments:pending:{nodeId}               // Pending payments for node
payments:completed                      // Payment history (TTL: 30 days)

// Real-time pub/sub channels
channel:job:{jobId}:updates             // Job-specific updates
channel:node:{nodeId}:commands          // Commands to node
channel:global:events                   // Global system events
```

### Redis Client Setup

```typescript
// Y8 App - lib/redis.ts
import { kv } from '@vercel/kv';

export const redis = {
  // Session management
  async setSession(userId: string, data: any) {
    await kv.hset(`session:${userId}`, data);
    await kv.expire(`session:${userId}`, 86400); // 24 hours
  },

  async getSession(userId: string) {
    return await kv.hgetall(`session:${userId}`);
  },

  // Job queue
  async enqueueJob(job: Job) {
    await kv.zadd('jobs:pending', {
      score: Date.now(),
      member: JSON.stringify(job)
    });
  },

  // Pub/Sub
  async publishJobUpdate(jobId: string, update: any) {
    await kv.publish(`channel:job:${jobId}:updates`, JSON.stringify(update));
  }
};

// The Beach - src/redis/redis.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async assignJobToNode(jobId: string, nodeId: string) {
    // Atomic operation: move from pending to active
    const job = await this.redis.zpopmin('jobs:pending', 1);
    if (job) {
      await this.redis.sadd(`jobs:active:${nodeId}`, jobId);
      await this.redis.hset(`job:${jobId}:status`, {
        status: 'active',
        nodeId,
        startedAt: Date.now()
      });
    }
    return job;
  }

  async registerNodeHeartbeat(nodeId: string, capacity: number) {
    await this.redis.hset(`nodes:${nodeId}:status`, {
      lastHeartbeat: Date.now(),
      capacity,
      status: 'online'
    });
    await this.redis.expire(`nodes:${nodeId}:status`, 300); // 5 min TTL
    await this.redis.sadd('nodes:available', nodeId);
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Team**: NPE_Database_Evaluator, NPE_Integration_Evaluator

- [ ] Set up Redis Vercel KV for both apps
- [ ] Define Redis key schema
- [ ] Implement session sharing
- [ ] Set up PostgreSQL (Vercel Postgres or Supabase)
- [ ] Create database migrations

**Deliverables**:
- Redis client libraries for Y8 App and The Beach
- Database schema deployed
- Basic session management working

---

### Phase 2: Backend Services (Week 3-4)
**Team**: NPE_Backend_Evaluator, NPE_SmartContract_Evaluator

**The Beach (NestJS)**:
```bash
# Create new modules
nest g module lit-compute
nest g controller lit-compute/nodes
nest g controller lit-compute/jobs
nest g service lit-compute/coordinator
nest g service lit-compute/queue
nest g gateway lit-compute/events
```

- [ ] Node registration endpoint
- [ ] Job queue service (Redis-backed)
- [ ] WebSocket gateway for real-time updates
- [ ] Payment processing service
- [ ] Smart contract deployment scripts

**Deliverables**:
- NestJS modules for Lit Compute
- WebSocket gateway operational
- Smart contracts deployed to testnet

---

### Phase 3: Frontend Interfaces (Week 5-6)
**Team**: NPE_Frontend_Evaluator

**Y8 App (Next.js)**:
```bash
# Create new pages
app/lit-compute/page.tsx                 # Landing page
app/lit-compute/dashboard/page.tsx       # User dashboard
app/lit-compute/nodes/page.tsx           # Node operator dashboard
app/lit-compute/jobs/[id]/page.tsx       # Job details

# Create components
components/LitCompute/JobSubmission.tsx
components/LitCompute/NodeStatus.tsx
components/LitCompute/PaymentHistory.tsx
```

- [ ] Job submission interface
- [ ] Node operator dashboard
- [ ] Real-time job status updates
- [ ] Payment tracking UI

**Deliverables**:
- Complete frontend in Y8 App
- WebSocket client for real-time updates
- Integration with The Beach APIs

---

### Phase 4: Node Software (Week 7-8)
**Team**: NPE_Backend_Evaluator, NPE_Frontend_Evaluator

**Desktop App (Electron + Y8 App UI)**:
```typescript
// electron/main.ts
import { app, BrowserWindow } from 'electron';
import { LitComputeNode } from './node-software';

let mainWindow: BrowserWindow;
let nodeInstance: LitComputeNode;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load Y8 App UI
  mainWindow.loadURL('http://localhost:3000/lit-compute/nodes');

  // Start node software
  nodeInstance = new LitComputeNode({
    backendUrl: 'https://the-beach.vercel.app',
    redisUrl: process.env.REDIS_URL
  });

  nodeInstance.start();
});

// electron/node-software.ts
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Redis } from 'ioredis';

export class LitComputeNode {
  private litClient: LitNodeClient;
  private redis: Redis;
  private walletAddress: string;

  async start() {
    // Initialize Lit Protocol client
    this.litClient = new LitNodeClient({
      litNetwork: 'datil-dev'
    });
    await this.litClient.connect();

    // Connect to Redis
    this.redis = new Redis(this.config.redisUrl);

    // Register with backend
    await this.registerNode();

    // Start heartbeat
    this.startHeartbeat();

    // Listen for jobs
    this.listenForJobs();
  }

  private async registerNode() {
    const response = await fetch(`${this.config.backendUrl}/lit-compute/nodes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: this.walletAddress,
        publicKey: this.publicKey,
        capabilities: this.getCapabilities()
      })
    });
  }

  private async listenForJobs() {
    // Subscribe to Redis channel
    await this.redis.subscribe(`channel:node:${this.walletAddress}:commands`);

    this.redis.on('message', async (channel, message) => {
      const command = JSON.parse(message);
      if (command.type === 'NEW_JOB') {
        await this.processJob(command.jobId);
      }
    });
  }

  private async processJob(jobId: string) {
    // Fetch job details
    const job = await this.fetchJob(jobId);

    // Download input from IPFS
    const input = await this.downloadFromIPFS(job.inputCID);

    // Perform encryption using Lit Protocol
    const encrypted = await this.litClient.encrypt({
      accessControlConditions: job.accessControl,
      dataToEncrypt: input
    });

    // Upload result to IPFS
    const outputCID = await this.uploadToIPFS(encrypted);

    // Submit result
    await this.submitResult(jobId, outputCID);
  }
}
```

- [ ] Electron app wrapper
- [ ] Node software core logic
- [ ] Lit Protocol integration
- [ ] IPFS integration

**Deliverables**:
- Desktop app for Windows, macOS, Linux
- Automated job processing
- Earnings dashboard

---

### Phase 5: Testing & Security (Week 9-10)
**Team**: NPE_Security_Evaluator, All Team

- [ ] Security audit of smart contracts
- [ ] Penetration testing of APIs
- [ ] Load testing (100+ nodes, 1000+ jobs/hr)
- [ ] End-to-end testing
- [ ] Bug bounty program

**Deliverables**:
- Security audit report
- Performance benchmarks
- Bug fixes

---

### Phase 6: Mainnet Launch (Week 11-12)
**Team**: NPE_Architect, All Team

- [ ] Deploy smart contracts to mainnet
- [ ] Configure production Redis
- [ ] Update both apps with mainnet configs
- [ ] Marketing materials
- [ ] Node operator onboarding

**Deliverables**:
- Live mainnet platform
- Documentation
- Support infrastructure

---

## Success Metrics

### Technical Metrics
- [ ] 99.9% uptime for The Beach backend
- [ ] <100ms job assignment latency
- [ ] <2s WebSocket message delivery
- [ ] <5min average job completion time
- [ ] 100+ active nodes at launch

### Business Metrics
- [ ] $10k+ daily job volume
- [ ] 1000+ registered node operators
- [ ] $1M+ TVL in node stakes
- [ ] 95%+ node operator satisfaction

---

## Next Steps

1. **Immediate**: Set up Redis Vercel KV and connect both apps
2. **Week 1**: Implement session sharing between Y8 App and The Beach
3. **Week 2**: Build first NestJS module for node registration
4. **Week 3**: Deploy smart contracts to Sepolia testnet
5. **Week 4**: Build job submission UI in Y8 App

---

## Team Communication

- **Daily Standup**: 9 AM UTC (Slack)
- **Weekly Review**: Fridays 3 PM UTC (Zoom)
- **Async Updates**: GitHub Projects + Slack
- **Documentation**: Notion workspace

---

**Approved by**: NPE_Architect
**Last Updated**: November 5, 2025
**Version**: 1.0
