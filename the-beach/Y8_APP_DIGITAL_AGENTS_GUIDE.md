# 🎮 Exploring Digital AI Agents in Y8 App

## Interactive Dashboard for NPE Agent Management and Lit Compute Network

**Last Updated:** November 6, 2025  
**Platform:** Y8 App (Next.js 15 + React 19)  
**Purpose:** User-friendly interface for interacting with AI agents and managing distributed computing jobs

---

## 🌟 What is Y8 App?

**Y8 App** is a modern web application built with Next.js 15 and React 19 that serves as the **control center** for:

1. 🤖 **NPE Agent Management** - Monitor, control, and interact with AI agents
2. 🔐 **Lit Compute Network** - Submit and track encryption jobs
3. 💰 **Node Operations** - Earn crypto by running compute nodes
4. 🔑 **Lit Protocol Auth** - Secure authentication via PKP (Programmable Key Pairs)

---

## 🚀 Quick Start

### Access Y8 App

```bash
# Clone the repository
cd /home/goodfaith/projects
git clone https://github.com/jasonsprouse/y8-app.git
cd y8-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3001
```

### First-Time Setup

1. **Create Account / Sign In**
   - Click "Sign In" button
   - Choose authentication method:
     - 🔑 **Google** - One-click OAuth
     - 💬 **Discord** - Link your Discord account
     - 💼 **Ethereum Wallet** - MetaMask, WalletConnect, etc.
     - 🔐 **Passkey** - Biometric authentication (fingerprint/face)

2. **Create Your PKP**
   - After signing in, Y8 App automatically mints a PKP for you
   - Your PKP is a **Programmable Key Pair** (blockchain wallet)
   - This PKP is your identity across The Beach ecosystem

3. **Explore the Dashboard**
   - Navigate to `/lit-compute` to see the Lit Compute Network
   - Navigate to `/npe-team` (coming soon) to manage AI agents

---

## 📊 Key Features

### 1. Lit Protocol Authentication

**Secure, decentralized identity management**

#### How It Works

```typescript
// When you sign in with Google
const authMethod = {
  authMethodType: AuthMethodType.Google,
  accessToken: 'ya29.xxx...' // From Google OAuth
};

// Y8 App mints a PKP for you
const pkp = await litClient.mintPKP({
  authMethod,
  // Your PKP is tied to your Google account
  // But controlled by Lit Protocol, not Google
});

// Your PKP public key
console.log(pkp.publicKey); // 0x04a1b2c3...

// You can now sign transactions with this PKP
const signature = await pkp.sign({
  message: 'Submit encryption job',
  chain: 'ethereum'
});
```

#### Supported Auth Methods

| Method | Security | Speed | Best For |
|--------|----------|-------|----------|
| 🔑 **Google** | High | Fast | General users |
| 💬 **Discord** | High | Fast | Gaming/community |
| 💼 **Ethereum Wallet** | Highest | Medium | Crypto natives |
| 🔐 **Passkey** | Highest | Fastest | Security-conscious |
| 📧 **Email OTP** | Medium | Slow | Fallback option |

#### Why PKP Matters

- ✅ **Self-Custody** - You own your keys, not Google/Discord
- ✅ **Multi-Chain** - Works on Ethereum, Polygon, Arbitrum, etc.
- ✅ **Programmable** - Can automate transactions based on conditions
- ✅ **Recoverable** - Lose your device? Recover via your auth method
- ✅ **Interoperable** - Same identity across all dApps

### 2. Lit Compute Network Interface

**Submit encryption jobs and earn rewards**

#### Job Submission

```typescript
// Navigate to http://localhost:3001/lit-compute

// You'll see:
┌─────────────────────────────────────────┐
│   🔐 Lit Compute Network                │
├─────────────────────────────────────────┤
│                                         │
│  📤 Submit Encryption Job               │
│                                         │
│  [ Upload File ]  OR  [ Enter IPFS CID ]│
│                                         │
│  Fee Amount: [ 0.1 ETH        ]        │
│                                         │
│  Your PKP: 0x04a1b2c3...               │
│                                         │
│  [ Submit Job ]                         │
│                                         │
├─────────────────────────────────────────┤
│  📊 Your Jobs                           │
│                                         │
│  Job #1234  [PENDING]    0.1 ETH       │
│  Job #1233  [COMPLETED]  0.1 ETH       │
│  Job #1232  [ACTIVE]     0.15 ETH      │
│                                         │
└─────────────────────────────────────────┘
```

#### How Job Processing Works

1. **You Upload File**
   - File is encrypted locally (never sent in plain text)
   - Uploaded to IPFS (distributed storage)
   - IPFS returns CID: `QmXxxx...`

2. **You Submit Job**
   ```typescript
   const job = await litComputeAPI.submitJob({
     inputCID: 'QmXxxx...',
     pkpPublicKey: session.pkp.publicKey,
     feeAmount: '0.1',
     accessControl: {
       // Who can decrypt the result
       allowedAddresses: [session.pkp.ethAddress]
     }
   });
   ```

3. **Job Enters Queue**
   - The Beach receives your job
   - NPE agents coordinate node assignment
   - Job appears in pending queue

4. **Node Picks Up Job**
   - Available compute node (could be you!) accepts job
   - Node downloads encrypted file from IPFS
   - Node processes encryption using Lit Protocol
   - Node generates zero-knowledge proof of work

5. **You Receive Result**
   - Node uploads result to IPFS
   - Smart contract releases payment to node
   - You download result using your PKP
   - Real-time status updates via WebSocket

#### Earnings Dashboard

```typescript
// Navigate to http://localhost:3001/lit-compute/earnings

┌─────────────────────────────────────────┐
│   💰 Node Operator Earnings             │
├─────────────────────────────────────────┤
│                                         │
│  Total Earned:    12.5 ETH  ($25,000)  │
│  Jobs Completed:  1,247                 │
│  Success Rate:    99.8%                 │
│  Reputation:      ⭐⭐⭐⭐⭐ (5.0)      │
│                                         │
├─────────────────────────────────────────┤
│  📈 Performance Metrics                 │
│                                         │
│  ┌────────────────────────────┐        │
│  │ Jobs/Hour    │     24      │        │
│  │ Avg Time     │   2.5 min   │        │
│  │ Uptime       │   99.9%     │        │
│  │ Active Since │ 45 days ago │        │
│  └────────────────────────────┘        │
│                                         │
├─────────────────────────────────────────┤
│  💸 Recent Earnings                     │
│                                         │
│  Nov 6, 2:30 PM   +0.1 ETH   Job #4567 │
│  Nov 6, 2:15 PM   +0.15 ETH  Job #4566 │
│  Nov 6, 2:00 PM   +0.1 ETH   Job #4565 │
│                                         │
│  [ Withdraw Earnings ]                  │
│                                         │
└─────────────────────────────────────────┘
```

### 3. NPE Agent Dashboard (Coming Soon)

**Manage your AI development team**

#### Agent Overview

```typescript
// Navigate to http://localhost:3001/npe-team

┌─────────────────────────────────────────────────┐
│   🤖 NPE Development Team                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Active Agents: 7      Status: All Working     │
│  Current Phase: MVP (Phase 1)                   │
│  Good Faith Score: 100% ✅                      │
│                                                 │
├─────────────────────────────────────────────────┤
│  👥 Team Members                                │
│                                                 │
│  🎯 NPE_LitCompute_Lead                         │
│     Status: [WORKING] Code Review               │
│     Progress: 85%                               │
│     Last Active: 2 minutes ago                  │
│     [ View Details ] [ Chat ]                   │
│                                                 │
│  💻 NPE_NodeSoftware                            │
│     Status: [WORKING] Implementing job listener │
│     Progress: 67%                               │
│     Last Active: 5 minutes ago                  │
│     [ View Details ] [ Chat ]                   │
│                                                 │
│  🔗 NPE_SmartContracts                          │
│     Status: [IDLE] Awaiting next task           │
│     Progress: 100% (Last task complete)         │
│     Last Active: 1 hour ago                     │
│     [ View Details ] [ Assign Task ]            │
│                                                 │
│  🖥️ NPE_DesktopApp                              │
│     Status: [WORKING] Building Electron wrapper │
│     Progress: 42%                               │
│     Last Active: 3 minutes ago                  │
│     [ View Details ] [ Chat ]                   │
│                                                 │
│  [ + Create New Agent ]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Agent Details View

```typescript
// Click "View Details" on any agent

┌─────────────────────────────────────────────────┐
│   💻 NPE_NodeSoftware                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Type: Engineer NPE                             │
│  Specialization: Distributed Systems            │
│  Complexity Level: 3-5 (Advanced)               │
│  Joined: October 15, 2025                       │
│                                                 │
├─────────────────────────────────────────────────┤
│  📊 Current Task                                │
│                                                 │
│  Title: Implement job listener for CLI          │
│  Goal: Build functional node software           │
│  Estimated: 4 hours                             │
│  Elapsed: 2.7 hours                             │
│  Progress: ████████████░░░░░░░░ 67%            │
│                                                 │
│  Sub-tasks:                                     │
│  ✅ Set up Socket.IO client                     │
│  ✅ Create job listener service                 │
│  🔄 Implement job validation                    │
│  ⏳ Add error handling                          │
│  ⏳ Write unit tests                            │
│                                                 │
├─────────────────────────────────────────────────┤
│  📈 Performance Metrics                         │
│                                                 │
│  Tasks Completed: 23                            │
│  Success Rate: 100%                             │
│  Avg Time vs Estimate: 0.87 (13% faster)       │
│  Code Quality Score: 94/100 (A)                 │
│  Test Coverage: 97%                             │
│  Documentation: 100%                            │
│                                                 │
├─────────────────────────────────────────────────┤
│  💬 Recent Activity                             │
│                                                 │
│  2 min ago: Committed code (234 lines)          │
│  5 min ago: Ran tests (all passing)             │
│  12 min ago: Updated documentation              │
│  25 min ago: Requested code review from Lead    │
│                                                 │
├─────────────────────────────────────────────────┤
│  💬 Chat with Agent                             │
│                                                 │
│  You: How's the job listener coming along?     │
│                                                 │
│  NPE_NodeSoftware: Great progress! I've        │
│  completed the Socket.IO client setup and       │
│  job listener service. Currently working on     │
│  validation logic. Found a useful pattern in    │
│  The Beach's events.gateway.ts that I'm         │
│  adapting. Should be done in ~1.3 hours.       │
│                                                 │
│  [ Type your message... ]  [ Send ]            │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Assign New Task

```typescript
// Click "Assign Task" on any agent

┌─────────────────────────────────────────────────┐
│   📝 Assign Task to NPE_SmartContracts          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Task Title:                                    │
│  [ Add gas optimization to coordinator contract]│
│                                                 │
│  Description:                                   │
│  ┌─────────────────────────────────────┐       │
│  │ Reduce gas costs for job submission │       │
│  │ from current 250k to target <200k.  │       │
│  │                                     │       │
│  │ Requirements:                       │       │
│  │ - Analyze current contract          │       │
│  │ - Identify gas-heavy operations     │       │
│  │ - Optimize storage patterns         │       │
│  │ - Maintain security                 │       │
│  │ - Test on Sepolia before mainnet    │       │
│  └─────────────────────────────────────┘       │
│                                                 │
│  Priority: [ High ▼ ]                           │
│  Estimated Hours: [ 8 ]                         │
│  Due Date: [ Nov 10, 2025 ]                     │
│                                                 │
│  Related Goal: [ Phase 1 - MVP ▼ ]              │
│                                                 │
│  Validation Criteria:                           │
│  ☑ Gas cost <200k per transaction               │
│  ☑ All tests passing                            │
│  ☑ Security audit approved                      │
│                                                 │
│  [ Cancel ]           [ Assign Task ]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. Real-Time Updates

**Stay connected with WebSocket magic**

#### How It Works

```typescript
// Y8 App automatically connects to The Beach via WebSocket

import { io, Socket } from 'socket.io-client';

// Connection setup (happens automatically)
const socket: Socket = io('http://localhost:3000/lit-compute', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5
});

// Listen for job updates
socket.on('job:update', (data) => {
  console.log('Job status changed:', data);
  // {
  //   jobId: '1234',
  //   status: 'completed',
  //   nodeId: 'node_abc',
  //   outputCID: 'QmYyy...'
  // }
  
  // UI automatically updates
  updateJobCard(data.jobId, data.status);
  showToast(`Job ${data.jobId} is now ${data.status}!`);
});

// Listen for system stats
socket.on('system:stats', (stats) => {
  console.log('Network stats:', stats);
  // {
  //   pendingJobs: 5,
  //   completedJobs: 1247,
  //   activeNodes: 12,
  //   totalJobsProcessed: 1252
  // }
  
  // Update dashboard
  updateStatsCards(stats);
});

// Listen for NPE agent updates
socket.on('npe:update', (agent) => {
  console.log('Agent activity:', agent);
  // {
  //   agentId: 'npe_node_software',
  //   status: 'working',
  //   currentTask: 'Implementing job listener',
  //   progress: 67
  // }
  
  // Update agent card
  updateAgentCard(agent.agentId, agent);
});
```

#### What You See in Real-Time

1. **Job Status Changes**
   - PENDING → ACTIVE → COMPLETED
   - Green badge, toast notification, progress bar

2. **Earnings Updates**
   - New job completed → +0.1 ETH
   - Counter increments, animation, sound (optional)

3. **Agent Activity**
   - Agent commits code → Activity feed updates
   - Agent completes task → Progress bar jumps to 100%
   - Agent requests review → Notification badge

4. **Network Stats**
   - New node joins → Active nodes count increases
   - Job completed → Completed jobs counter increments
   - Performance metrics update every 30 seconds

---

## 🎯 User Journeys

### Journey 1: Submit Your First Job (5 Minutes)

**Goal:** Encrypt a document using the Lit Compute Network

**Steps:**

1. **Sign In** (1 minute)
   ```
   http://localhost:3001/
   → Click "Sign In"
   → Choose Google
   → Authorize
   → PKP created automatically
   ```

2. **Navigate to Lit Compute** (30 seconds)
   ```
   → Click "Lit Compute Network" in navbar
   → See dashboard with stats
   ```

3. **Prepare Your File** (1 minute)
   ```
   → Click "Choose File"
   → Select document (e.g., contract.pdf)
   → See file info: "contract.pdf (245 KB)"
   ```

4. **Submit Job** (30 seconds)
   ```
   → Set fee: 0.1 ETH (default is fine)
   → Click "Submit Job"
   → File uploads to IPFS
   → Job submitted to network
   → See toast: "Job submitted! ID: 1234"
   ```

5. **Watch Processing** (2 minutes)
   ```
   → Job status: [PENDING]
   → Node picks it up → [ACTIVE]
   → See node ID: node_abc
   → Progress updates in real-time
   → Status changes → [COMPLETED]
   → Output CID shown: QmYyy...
   ```

6. **Download Result** (30 seconds)
   ```
   → Click "Download Result"
   → Decrypted file downloads: contract_encrypted.pdf
   → Job complete! ✅
   ```

### Journey 2: Run a Compute Node (15 Minutes)

**Goal:** Earn money by processing encryption jobs

**Steps:**

1. **Sign In & Navigate** (1 minute)
   ```
   http://localhost:3001/
   → Sign in with PKP
   → Click "Node Dashboard"
   ```

2. **Register Node** (2 minutes)
   ```
   → Click "Register New Node"
   → Enter node details:
     - Name: "My MacBook Pro"
     - Wallet: (auto-filled from PKP)
     - CPU Cores: 8
     - Available: Yes
   → Click "Register"
   → See confirmation: "Node registered!"
   ```

3. **Download Node Software** (5 minutes)
   ```
   → Click "Download Node Software"
   → Choose platform: macOS
   → Download: lit-compute-node-v1.0.0.dmg
   → Install application
   → Launch "Lit Compute Node"
   ```

4. **Start Processing** (1 minute)
   ```
   → Node software starts
   → Connects to network automatically
   → Shows status: "Waiting for jobs..."
   → First job arrives!
   → Status: "Processing job #5678"
   ```

5. **Monitor Earnings** (ongoing)
   ```
   → Back in Y8 App dashboard
   → See real-time earnings:
     - Job #5678 complete → +0.1 ETH
     - Job #5679 complete → +0.15 ETH
     - Job #5680 complete → +0.1 ETH
   → Total earned: 0.35 ETH ($700)
   ```

6. **Withdraw Earnings** (2 minutes)
   ```
   → Click "Withdraw Earnings"
   → Enter amount: 0.35 ETH
   → Confirm transaction with PKP
   → Funds sent to your wallet
   → See confirmation: "Withdrawal successful!"
   ```

### Journey 3: Manage NPE Agents (10 Minutes)

**Goal:** Oversee your AI development team

**Steps:**

1. **Access NPE Dashboard** (30 seconds)
   ```
   http://localhost:3001/npe-team
   → See 7 active agents
   → All working on Phase 1 goals
   ```

2. **Check Team Progress** (2 minutes)
   ```
   → View overall metrics:
     - Tasks completed today: 12
     - Good Faith Score: 100%
     - Velocity: +15% above target
   → See current phase: MVP (Month 3)
   → 5 of 5 goals in progress
   ```

3. **Chat with an Agent** (3 minutes)
   ```
   → Click "NPE_NodeSoftware"
   → Click "Chat" tab
   
   You: "How's the job listener coming?"
   
   Agent: "Almost done! Currently at 67% completion.
           I've implemented the Socket.IO client and job
           listener service. Working on validation logic now.
           Found a great pattern in events.gateway.ts that
           I'm adapting. ETA: 1.3 hours."
   
   You: "Great! Can you add retry logic for failed jobs?"
   
   Agent: "Excellent suggestion! I'll add exponential backoff
           with max 3 retries. This aligns with our resilience
           goals. Adding to task list now. ETA will increase
           by ~30 minutes to 2 hours total."
   
   You: "Perfect, thanks!"
   ```

4. **Assign New Task** (2 minutes)
   ```
   → Click "NPE_SmartContracts"
   → Click "Assign Task"
   → Enter:
     - Title: "Add gas optimization"
     - Description: "Reduce gas from 250k to <200k"
     - Priority: High
     - Estimated: 8 hours
   → Click "Assign"
   → Agent starts immediately
   ```

5. **Review Code** (2 minutes)
   ```
   → Agent finishes task
   → Notification: "Pull request ready for review"
   → Click notification
   → See PR details:
     - Files changed: 3
     - Lines added: 87
     - Lines removed: 34
     - Tests added: 5
     - All tests passing ✅
   → Click "Approve & Merge"
   → Code deployed automatically
   ```

6. **Check Results** (30 seconds)
   ```
   → Gas costs now: 185k per tx ✅
   → Target was <200k
   → Agent exceeded expectations!
   → Good Faith Score: Still 100%
   ```

---

## 🔧 Advanced Features

### 1. Custom Agent Creation

**Build your own NPE agent for specific tasks**

```typescript
// Navigate to http://localhost:3001/npe-team/create

┌─────────────────────────────────────────────────┐
│   🤖 Create Custom NPE Agent                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Agent Name:                                    │
│  [ NPE_DataAnalyzer ]                           │
│                                                 │
│  Type: [ Engineer ▼ ]                           │
│                                                 │
│  Specialization:                                │
│  [ Data Science & Analytics ]                   │
│                                                 │
│  Complexity Level: [ 3-5 (Advanced) ▼ ]         │
│                                                 │
│  Capabilities (select all that apply):          │
│  ☑ Python development                           │
│  ☑ Data processing (pandas, numpy)              │
│  ☑ Machine learning (scikit-learn, PyTorch)     │
│  ☑ Data visualization (matplotlib, plotly)      │
│  ☑ SQL queries                                  │
│  ☐ Web scraping                                 │
│                                                 │
│  Initial Goal:                                  │
│  ┌─────────────────────────────────────┐       │
│  │ Analyze job processing metrics      │       │
│  │ and identify optimization           │       │
│  │ opportunities for the network       │       │
│  └─────────────────────────────────────┘       │
│                                                 │
│  AI Model: [ GPT-4 ▼ ]                          │
│  Budget: [ $100/month ]                         │
│                                                 │
│  [ Cancel ]              [ Create Agent ]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. Agent Training

**Teach agents new skills from your codebase**

```typescript
// Navigate to http://localhost:3001/npe-team/npe_node_software/train

┌─────────────────────────────────────────────────┐
│   🎓 Train NPE_NodeSoftware                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Training Mode:                                 │
│  ● Learn from files                             │
│  ○ Learn from documentation                     │
│  ○ Learn from examples                          │
│                                                 │
│  Select files to learn from:                    │
│  ☑ src/events/events.gateway.ts                 │
│  ☑ src/lit-compute/gateways/lit-compute.gateway│
│  ☐ src/app.module.ts                            │
│  ☐ public/js/xr-scene.js                        │
│                                                 │
│  Focus areas:                                   │
│  ☑ WebSocket patterns                           │
│  ☑ Error handling                               │
│  ☑ Event naming conventions                     │
│  ☐ Testing patterns                             │
│                                                 │
│  Duration: [ 30 minutes ]                       │
│  Cost: ~$5 (API calls)                          │
│                                                 │
│  [ Start Training ]                             │
│                                                 │
│  Expected Outcomes:                             │
│  • Agent learns WebSocket best practices        │
│  • Improves code quality by 15-20%              │
│  • Reduces bugs in future implementations       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3. Multi-Agent Workflows

**Orchestrate complex tasks across multiple agents**

```typescript
// Navigate to http://localhost:3001/npe-team/workflows/create

┌─────────────────────────────────────────────────┐
│   🔄 Create Multi-Agent Workflow                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Workflow Name:                                 │
│  [ Deploy to Production ]                       │
│                                                 │
│  Steps:                                         │
│                                                 │
│  1. NPE_SmartContracts                          │
│     Task: Deploy contracts to mainnet           │
│     Estimated: 30 min                           │
│     [ ↓ Then ↓ ]                                │
│                                                 │
│  2. NPE_Security                                │
│     Task: Run final security audit              │
│     Wait for: Step 1 complete                   │
│     Estimated: 1 hour                           │
│     [ ↓ Then ↓ ]                                │
│                                                 │
│  3. NPE_Backend + NPE_Frontend (Parallel)       │
│     Tasks:                                      │
│     - Update API endpoints (Backend)            │
│     - Update UI with contract addresses (Front) │
│     Wait for: Step 2 approved                   │
│     Estimated: 45 min                           │
│     [ ↓ Then ↓ ]                                │
│                                                 │
│  4. NPE_GameManager                             │
│     Task: Validate all deployments              │
│     Run health checks                           │
│     Wait for: Step 3 complete                   │
│     Estimated: 15 min                           │
│                                                 │
│  Total Estimated Time: 2.5 hours                │
│                                                 │
│  Approval Required: ☑ Before Step 1             │
│                     ☑ After Step 2              │
│                                                 │
│  [ Save Workflow ]        [ Execute Now ]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📱 Mobile Experience

**Y8 App is fully responsive for mobile devices**

### Mobile Features

- ✅ Touch-optimized controls
- ✅ Swipe gestures for navigation
- ✅ Mobile push notifications
- ✅ Biometric authentication (Face ID, Touch ID)
- ✅ Offline mode (limited functionality)
- ✅ Progressive Web App (PWA)

### Install as App

```
On iOS:
1. Open http://localhost:3001 in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Icon appears on home screen

On Android:
1. Open http://localhost:3001 in Chrome
2. Tap menu (3 dots)
3. Tap "Install app"
4. Icon appears in app drawer
```

---

## 🔗 Integration with The Beach

**Seamless connection between Y8 App and The Beach**

### How They Work Together

```
┌──────────────┐         ┌──────────────┐
│   Y8 App     │◄───────►│  The Beach   │
│ (Frontend UI)│  API    │  (Backend)   │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ WebSocket              │ Redis
       │ (Real-time)            │ (State)
       │                        │
       └────────────┬───────────┘
                    │
             ┌──────▼───────┐
             │   NPE Agents │
             │   Redis KV   │
             └──────────────┘
```

### Shared State

Both apps share:
- **User sessions** (via Redis)
- **Job queue** (via Redis)
- **Agent status** (via Redis Pub/Sub)
- **WebSocket events** (via Socket.IO)

### Example: Job Submission Flow

```
User in Y8 App:
1. Uploads file
2. Clicks "Submit Job"
3. Y8 App → POST to The Beach API

The Beach:
1. Receives job
2. Stores in Redis queue
3. NPE agents coordinate assignment
4. Broadcasts event via WebSocket

Y8 App receives:
1. WebSocket event: job:update
2. Updates UI: Status = ACTIVE
3. Shows node ID assigned

Node processes:
1. Downloads from IPFS
2. Processes encryption
3. Uploads result to IPFS
4. The Beach → Broadcasts completion

Y8 App receives:
1. WebSocket event: job:update
2. Updates UI: Status = COMPLETED
3. Shows output CID
4. User downloads result
```

---

## 🎓 Best Practices

### 1. Authentication

- ✅ **Use Passkeys** - Most secure, fastest
- ✅ **Enable 2FA** - Add extra layer
- ✅ **Back up recovery phrase** - Don't lose access
- ⚠️ **Never share PKP private key** - Self-custody = your responsibility

### 2. Job Submission

- ✅ **Start with small files** - Test first (<10MB)
- ✅ **Set appropriate fees** - Higher fees = faster processing
- ✅ **Monitor job status** - Use WebSocket for real-time updates
- ⚠️ **Encrypt sensitive data** - Always encrypt before upload

### 3. Node Operations

- ✅ **Keep node online** - 99%+ uptime = better reputation
- ✅ **Monitor system resources** - Don't overload CPU
- ✅ **Update software regularly** - Security patches important
- ⚠️ **Secure your wallet** - Earnings stored in PKP

### 4. Agent Management

- ✅ **Review agent work** - Check code before merge
- ✅ **Set clear goals** - Specific validation criteria
- ✅ **Monitor Good Faith scores** - Should stay >90%
- ⚠️ **Don't micromanage** - Let agents work autonomously

---

## 🚀 Coming Soon

### Q1 2026

- 📱 **Native Mobile Apps** (iOS & Android)
- 🎮 **Agent Playground** - Test agents in sandbox
- 📊 **Advanced Analytics** - Deep dive into metrics
- 🤝 **Team Collaboration** - Multiple users per NPE team

### Q2 2026

- 🌍 **Multi-Language Support** - 10+ languages
- 🔔 **Smart Notifications** - AI-powered alerts
- 🎨 **Customizable Dashboards** - Drag-and-drop widgets
- 💬 **Voice Chat with Agents** - Talk instead of type

### Q3 2026

- 🧠 **Agent Marketplace** - Buy/sell trained agents
- 🏆 **Reputation System** - Leaderboards, badges
- 💰 **Staking & Governance** - Vote on network changes
- 🔐 **Enterprise Features** - SSO, RBAC, audit logs

---

## 📞 Support

**Need Help?**

- 📧 **Email**: [support@y8.app](mailto:support@y8.app)
- 💬 **Discord**: [Y8 App Community](https://discord.gg/y8app)
- 📚 **Docs**: [docs.y8.app](https://docs.y8.app)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/jasonsprouse/y8-app/issues)

**Response Times:**
- Critical issues: <2 hours
- General support: <24 hours
- Feature requests: <1 week

---

**Built with ❤️ using Next.js 15, React 19, and Lit Protocol v7**

**Y8 App** - Your gateway to the future of AI-powered development 🚀
