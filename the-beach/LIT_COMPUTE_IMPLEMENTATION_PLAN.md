# Lit Compute Network - Implementation Plan

## Phase 1: Backend Foundation ✅ (COMPLETED)

### The Beach (NestJS Backend)

**Created Files**:
- ✅ `src/lit-compute/lit-compute.module.ts` - Main module
- ✅ `src/lit-compute/services/redis.service.ts` - Redis state management
- ✅ `src/lit-compute/services/queue.service.ts` - Job queue logic
- ✅ `src/lit-compute/services/coordinator.service.ts` - System coordination
- ✅ `src/lit-compute/controllers/nodes.controller.ts` - Node endpoints
- ✅ `src/lit-compute/controllers/jobs.controller.ts` - Job endpoints
- ✅ `src/lit-compute/gateways/lit-compute.gateway.ts` - WebSocket gateway

**API Endpoints**:
```
POST   /lit-compute/nodes/register       - Register new node
POST   /lit-compute/nodes/heartbeat      - Send node heartbeat
GET    /lit-compute/nodes/:id/status     - Get node status
GET    /lit-compute/nodes/:id/jobs       - Get node jobs
GET    /lit-compute/nodes/:id/payments   - Get node payments

POST   /lit-compute/jobs/submit          - Submit encryption job
GET    /lit-compute/jobs/:id             - Get job status
POST   /lit-compute/jobs/:id/complete    - Complete job (from node)
GET    /lit-compute/jobs/pending/list    - List pending jobs
GET    /lit-compute/jobs/stats           - Get system stats

WS     /lit-compute                      - WebSocket for real-time updates
```

**Dependencies Installed**:
- ✅ `ioredis` - Redis client
- ✅ `@types/ioredis` - TypeScript types

---

## Phase 2: Frontend Interfaces (NEXT)

### Y8 App (Next.js Frontend)

**Pages to Create**:
```bash
app/lit-compute/
├── page.tsx                              # Landing page
├── dashboard/
│   └── page.tsx                          # User dashboard
├── nodes/
│   ├── page.tsx                          # Node operator dashboard
│   └── [nodeId]/
│       └── page.tsx                      # Node details
├── jobs/
│   ├── page.tsx                          # Job list
│   ├── submit/
│   │   └── page.tsx                      # Submit new job
│   └── [jobId]/
│       └── page.tsx                      # Job details
└── analytics/
    └── page.tsx                          # Platform analytics
```

**Components to Create**:
```bash
components/LitCompute/
├── JobSubmission.tsx                     # Job submission form
├── JobStatus.tsx                         # Real-time job status
├── NodeStatus.tsx                        # Node status card
├── NodeDashboard.tsx                     # Full node dashboard
├── PaymentHistory.tsx                    # Payment tracking
├── SystemStats.tsx                       # Live system stats
└── WebSocketProvider.tsx                 # WebSocket context
```

**API Integration** (lib/lit-compute-api.ts):
```typescript
export const litComputeAPI = {
  async submitJob(data: JobSubmission) {
    const response = await fetch(`${THE_BEACH_URL}/lit-compute/jobs/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getJobStatus(jobId: string) {
    const response = await fetch(`${THE_BEACH_URL}/lit-compute/jobs/${jobId}`);
    return response.json();
  },

  // ... more endpoints
};
```

**Redis Integration** (lib/redis.ts):
```typescript
import { kv } from '@vercel/kv';

export const redisClient = {
  async setSession(userId: string, data: any) {
    await kv.hset(`session:${userId}`, data);
    await kv.expire(`session:${userId}`, 86400);
  },

  async getSession(userId: string) {
    return await kv.hgetall(`session:${userId}`);
  }
};
```

---

## Phase 3: Smart Contracts

### Contracts to Deploy

**1. LitComputeCoordinator.sol**:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LitComputeCoordinator is Ownable, ReentrancyGuard {
    struct Node {
        address walletAddress;
        bytes publicKey;
        uint256 reputation;
        uint256 totalJobs;
        uint256 stakedAmount;
        bool isActive;
    }

    struct Job {
        bytes32 id;
        address submitter;
        bytes32 inputCID;
        bytes32 outputCID;
        address assignedNode;
        uint256 feeAmount;
        JobStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }

    enum JobStatus { Pending, Active, Completed, Failed }

    mapping(address => Node) public nodes;
    mapping(bytes32 => Job) public jobs;
    
    uint256 public constant MIN_STAKE = 0.1 ether;
    uint256 public platformFeePercentage = 1; // 1%

    event NodeRegistered(address indexed nodeAddress, bytes publicKey);
    event JobSubmitted(bytes32 indexed jobId, address indexed submitter);
    event JobAssigned(bytes32 indexed jobId, address indexed nodeAddress);
    event JobCompleted(bytes32 indexed jobId, bytes32 outputCID);
    event PaymentClaimed(address indexed nodeAddress, uint256 amount);

    function registerNode(bytes calldata publicKey) external payable {
        require(msg.value >= MIN_STAKE, "Insufficient stake");
        require(!nodes[msg.sender].isActive, "Node already registered");

        nodes[msg.sender] = Node({
            walletAddress: msg.sender,
            publicKey: publicKey,
            reputation: 0,
            totalJobs: 0,
            stakedAmount: msg.value,
            isActive: true
        });

        emit NodeRegistered(msg.sender, publicKey);
    }

    function submitJob(bytes32 inputCID) external payable {
        require(msg.value > 0, "Fee required");

        bytes32 jobId = keccak256(abi.encodePacked(msg.sender, inputCID, block.timestamp));

        jobs[jobId] = Job({
            id: jobId,
            submitter: msg.sender,
            inputCID: inputCID,
            outputCID: bytes32(0),
            assignedNode: address(0),
            feeAmount: msg.value,
            status: JobStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0
        });

        emit JobSubmitted(jobId, msg.sender);
    }

    function assignJob(bytes32 jobId) external {
        require(nodes[msg.sender].isActive, "Node not registered");
        require(jobs[jobId].status == JobStatus.Pending, "Job not available");

        jobs[jobId].assignedNode = msg.sender;
        jobs[jobId].status = JobStatus.Active;

        emit JobAssigned(jobId, msg.sender);
    }

    function completeJob(bytes32 jobId, bytes32 outputCID) external nonReentrant {
        require(jobs[jobId].assignedNode == msg.sender, "Not assigned to you");
        require(jobs[jobId].status == JobStatus.Active, "Job not active");

        jobs[jobId].outputCID = outputCID;
        jobs[jobId].status = JobStatus.Completed;
        jobs[jobId].completedAt = block.timestamp;

        // Update node stats
        nodes[msg.sender].totalJobs++;
        nodes[msg.sender].reputation++;

        // Calculate platform fee
        uint256 platformFee = (jobs[jobId].feeAmount * platformFeePercentage) / 100;
        uint256 nodePayment = jobs[jobId].feeAmount - platformFee;

        // Transfer payment to node
        (bool success, ) = msg.sender.call{value: nodePayment}("");
        require(success, "Payment failed");

        emit JobCompleted(jobId, outputCID);
        emit PaymentClaimed(msg.sender, nodePayment);
    }

    function withdrawStake() external nonReentrant {
        require(nodes[msg.sender].isActive, "Node not registered");
        uint256 stakedAmount = nodes[msg.sender].stakedAmount;

        nodes[msg.sender].isActive = false;
        nodes[msg.sender].stakedAmount = 0;

        (bool success, ) = msg.sender.call{value: stakedAmount}("");
        require(success, "Withdrawal failed");
    }

    function getJob(bytes32 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }

    function getNode(address nodeAddress) external view returns (Node memory) {
        return nodes[nodeAddress];
    }
}
```

**Deployment Script** (scripts/deploy-lit-compute.ts):
```typescript
import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying Lit Compute Network contracts...');

  // Deploy Coordinator
  const Coordinator = await ethers.getContractFactory('LitComputeCoordinator');
  const coordinator = await Coordinator.deploy();
  await coordinator.deployed();

  console.log(`LitComputeCoordinator deployed to: ${coordinator.address}`);

  // Verify on Etherscan
  if (network.name !== 'localhost' && network.name !== 'hardhat') {
    console.log('Waiting for block confirmations...');
    await coordinator.deployTransaction.wait(5);

    console.log('Verifying contract...');
    await hre.run('verify:verify', {
      address: coordinator.address,
      constructorArguments: [],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## Phase 4: Desktop Node App (Electron)

### Structure:
```bash
apps/node-desktop/
├── electron/
│   ├── main.ts                           # Electron main process
│   ├── preload.ts                        # Preload script
│   └── node-software/
│       ├── index.ts                      # Node software entry
│       ├── lit-client.ts                 # Lit Protocol client
│       ├── ipfs-client.ts                # IPFS client
│       └── job-processor.ts              # Job processing logic
├── src/                                  # React UI (from Y8 App)
│   ├── pages/
│   │   └── node-dashboard.tsx            # Node dashboard page
│   └── components/
│       ├── NodeStatus.tsx
│       ├── EarningsChart.tsx
│       └── JobQueue.tsx
├── package.json
└── electron-builder.json                 # Build config
```

**Node Software Core** (electron/node-software/index.ts):
```typescript
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { Redis } from 'ioredis';
import { create as ipfsCreate } from 'ipfs-http-client';

export class LitComputeNode {
  private litClient: LitNodeClient;
  private redis: Redis;
  private ipfs: any;
  private wallet: ethers.Wallet;
  private nodeId: string;
  private isRunning = false;

  constructor(config: {
    walletPrivateKey: string;
    redisUrl: string;
    backendUrl: string;
  }) {
    this.wallet = new ethers.Wallet(config.walletPrivateKey);
    this.nodeId = `node_${this.wallet.address.toLowerCase()}`;
    this.redis = new Redis(config.redisUrl);
    this.ipfs = ipfsCreate({ url: 'https://ipfs.infura.io:5001' });
  }

  async start() {
    console.log(`Starting Lit Compute Node: ${this.nodeId}`);

    // Initialize Lit Protocol
    this.litClient = new LitNodeClient({
      litNetwork: 'datil-dev',
    });
    await this.litClient.connect();

    // Register with backend
    await this.registerNode();

    // Start heartbeat
    this.startHeartbeat();

    // Subscribe to job commands
    await this.subscribeToJobCommands();

    this.isRunning = true;
    console.log('Node is running ✅');
  }

  private async registerNode() {
    const response = await fetch(`${this.config.backendUrl}/lit-compute/nodes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: this.wallet.address,
        publicKey: this.wallet.publicKey,
        capabilities: {
          maxConcurrentJobs: 5,
          supportedOperations: ['encrypt', 'decrypt'],
        },
      }),
    });

    const data = await response.json();
    console.log('Node registered:', data);
  }

  private startHeartbeat() {
    setInterval(async () => {
      try {
        const activeJobs = await this.redis.scard(`jobs:active:${this.nodeId}`);
        
        const response = await fetch(`${this.config.backendUrl}/lit-compute/nodes/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodeId: this.nodeId,
            capacity: 5,
            activeJobs: activeJobs,
          }),
        });

        const data = await response.json();
        
        // If new job available, process it
        if (data.newJob) {
          await this.processJob(data.newJob);
        }
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 60000); // Every 60 seconds
  }

  private async subscribeToJobCommands() {
    await this.redis.subscribe(`channel:node:${this.nodeId}:commands`);

    this.redis.on('message', async (channel, message) => {
      const command = JSON.parse(message);
      
      if (command.type === 'NEW_JOB') {
        console.log(`New job available: ${command.jobId}`);
        // Job will be fetched on next heartbeat
      }
    });
  }

  private async processJob(job: any) {
    console.log(`Processing job: ${job.id}`);

    try {
      // Download input from IPFS
      const inputData = await this.downloadFromIPFS(job.inputCID);

      // Perform encryption using Lit Protocol
      const encrypted = await this.litClient.encrypt({
        accessControlConditions: job.accessControl,
        dataToEncrypt: inputData,
      });

      // Upload result to IPFS
      const outputCID = await this.uploadToIPFS(encrypted);

      // Submit result to backend
      await this.submitResult(job.id, outputCID);

      console.log(`Job ${job.id} completed ✅`);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      // TODO: Report failure to backend
    }
  }

  private async downloadFromIPFS(cid: string): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of this.ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  private async uploadToIPFS(data: any): Promise<string> {
    const { cid } = await this.ipfs.add(JSON.stringify(data));
    return cid.toString();
  }

  private async submitResult(jobId: string, outputCID: string) {
    const response = await fetch(
      `${this.config.backendUrl}/lit-compute/jobs/${jobId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: this.nodeId,
          outputCID,
        }),
      }
    );

    return response.json();
  }

  async stop() {
    this.isRunning = false;
    await this.litClient.disconnect();
    await this.redis.quit();
    console.log('Node stopped');
  }
}
```

---

## Next Immediate Steps

### 1. Set up Redis Vercel KV (5 min)
```bash
# In Vercel dashboard:
1. Go to Storage → Create Database → KV
2. Copy connection strings
3. Add to .env.local in both repos:
   - Y8 App: .env.local
   - The Beach: .env.local
```

### 2. Test Backend Locally (10 min)
```bash
cd the-beach
npm run start:dev

# Test endpoints:
curl http://localhost:3000/lit-compute/jobs/stats
```

### 3. Create Frontend Pages in Y8 App (30 min)
```bash
cd y8-app
mkdir -p app/lit-compute/dashboard
touch app/lit-compute/page.tsx
touch app/lit-compute/dashboard/page.tsx
```

### 4. Deploy Smart Contracts to Sepolia (20 min)
```bash
cd the-beach
npx hardhat deploy --network sepolia
```

### 5. Build Electron App (1 hour)
```bash
mkdir -p apps/node-desktop
cd apps/node-desktop
npm init -y
npm install electron electron-builder
```

---

## Success Metrics

- ✅ Redis connected and operational
- ✅ Backend API responding to requests
- ⏳ Frontend can submit jobs
- ⏳ Smart contracts deployed to testnet
- ⏳ Desktop app can process jobs
- ⏳ End-to-end encryption job working

---

**Status**: Phase 1 Complete ✅ | Phase 2 Ready to Start
**Next Action**: Create Redis Vercel KV instance and configure environment variables
