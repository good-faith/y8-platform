# NPE Frontend Sprint: Y8 App 40% → 50% + QC Pipeline

**Date**: November 6, 2025  
**Sprint Goal**: Complete critical frontend components and establish automated QC pipeline  
**Current Progress**: 40% → **Target**: 50%  
**Assigned Agent**: NPE_Frontend_Evaluator + PKP Agents

---

## 🎯 Sprint Objectives

### Primary Goals
1. ✅ **Foundation Complete (40%)**
   - API Client (lib/lit-compute-api.ts)
   - WebSocket Hook (hooks/useLitComputeSocket.ts)
   - JobSubmission component
   - SystemStatsDashboard component
   - Landing page (/lit-compute/page.tsx)

2. 🚧 **Add Missing Components (40% → 45%)**
   - NodeDashboard.tsx - Full node operator interface
   - PaymentHistory.tsx - Transaction tracking
   - JobList.tsx - Browse all jobs
   - AnalyticsCharts.tsx - Visual metrics

3. 🚧 **Add Missing Pages (45% → 50%)**
   - /lit-compute/dashboard - User dashboard
   - /lit-compute/nodes - Node operator dashboard
   - /lit-compute/jobs/[id] - Job details page
   - /lit-compute/analytics - Platform analytics

4. 🤖 **QC Pipeline (Automated)**
   - Playwright E2E tests
   - PKP agent test runners
   - CI/CD quality gates
   - Automated monitoring

---

## 📋 Component Requirements

### 1. NodeDashboard.tsx (Priority: HIGH)

**Purpose**: Full interface for node operators to monitor earnings, jobs, and status

**Features**:
```typescript
interface NodeDashboardProps {
  nodeId: string;
  pkpWallet: string;
}

Features:
- Real-time earnings counter (ETH + USD)
- Jobs completed today/week/month
- Current active jobs with progress
- Reputation score (0-100)
- Performance metrics (avg time, success rate)
- Uptime tracking
- Recent earnings list
- Withdraw button (connects to smart contract)
- System health indicators
- WebSocket live updates
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  🖥️  Node Operator Dashboard                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 💰 Earnings  │ │ 📊 Jobs      │ │ ⭐ Reputation│   │
│  │ 12.5 ETH     │ │ 1,247        │ │ 99.8/100     │   │
│  │ $25,000      │ │ completed    │ │ ⭐⭐⭐⭐⭐  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔥 Active Jobs (3)                              │   │
│  │ ────────────────────────────────────────────    │   │
│  │ Job #4568  [████████░░░░] 67%  Est: 2m        │   │
│  │ Job #4569  [███░░░░░░░░░] 25%  Est: 5m        │   │
│  │ Job #4570  [█░░░░░░░░░░░] 8%   Est: 8m        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📈 Performance Metrics                          │   │
│  │                                                 │   │
│  │  Avg Job Time:    2.5 minutes                  │   │
│  │  Success Rate:    99.8%                        │   │
│  │  Uptime:          99.9% (45 days)              │   │
│  │  Jobs/Hour:       24                           │   │
│  │  Network Rank:    #42 of 1,250 nodes           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💸 Recent Earnings                              │   │
│  │                                                 │   │
│  │  Nov 6, 2:30 PM   +0.1 ETH    Job #4567        │   │
│  │  Nov 6, 2:15 PM   +0.15 ETH   Job #4566        │   │
│  │  Nov 6, 2:00 PM   +0.1 ETH    Job #4565        │   │
│  │  [View All Earnings →]                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [💰 Withdraw Earnings]  [⚙️ Node Settings]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Dependencies**:
- useLitComputeSocket (WebSocket updates)
- LitComputeAPI.getNodeStatus()
- LitComputeAPI.getNodeEarnings()
- react-hot-toast (notifications)
- recharts (earnings chart)

---

### 2. PaymentHistory.tsx (Priority: HIGH)

**Purpose**: Transaction history with filtering and CSV export

**Features**:
```typescript
interface PaymentHistoryProps {
  nodeId?: string;  // If viewing as node operator
  userId?: string;  // If viewing as job submitter
}

Features:
- Paginated transaction list
- Filter by: date range, type (earned/spent), status
- Search by job ID or transaction hash
- CSV export
- Running balance
- Blockchain explorer links
- Pending/confirmed/failed status
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  💸 Payment History                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filters: [All Types ▼] [Last 30 Days ▼] [Search...]  │
│           [Export CSV]                                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Date       │ Type    │ Amount  │ Job ID │ Status│   │
│  ├───────────┼─────────┼─────────┼────────┼───────┤   │
│  │ Nov 6 2PM │ Earned  │ +0.1 Ξ  │ #4567  │ ✅    │   │
│  │ Nov 6 1PM │ Earned  │ +0.15 Ξ │ #4566  │ ✅    │   │
│  │ Nov 6 12PM│ Spent   │ -0.1 Ξ  │ #4565  │ ✅    │   │
│  │ Nov 5 11PM│ Earned  │ +0.1 Ξ  │ #4564  │ ⏳    │   │
│  │ Nov 5 10PM│ Earned  │ +0.12 Ξ │ #4563  │ ✅    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Page 1 of 42  [← Previous] [Next →]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3. JobList.tsx (Priority: MEDIUM)

**Purpose**: Browse and search all jobs in the network

**Features**:
- Real-time job list with status
- Filter by status (pending/active/completed/failed)
- Search by job ID or submitter
- Sort by date, fee amount, status
- Click to view job details
- Auto-refresh every 5 seconds

---

### 4. AnalyticsCharts.tsx (Priority: MEDIUM)

**Purpose**: Visual metrics for platform performance

**Charts**:
- Jobs over time (line chart)
- Success rate (donut chart)
- Node distribution (bar chart)
- Earnings distribution (histogram)
- Network latency (area chart)

**Library**: Recharts (already in dependencies)

---

## 🌐 Page Requirements

### 1. /lit-compute/dashboard/page.tsx

**Purpose**: Personalized user dashboard

**Sections**:
- User's submitted jobs (recent 5)
- Total spent on jobs
- If node operator: earnings summary
- Quick actions (submit job, view nodes)
- System health status

---

### 2. /lit-compute/nodes/page.tsx

**Purpose**: Node operator interface (uses NodeDashboard component)

**Access Control**:
```typescript
// Only accessible if user has registered node
const hasNode = await LitComputeAPI.getNodeByWallet(pkpWallet);
if (!hasNode) {
  return <RegisterNodeCTA />;
}
```

---

### 3. /lit-compute/jobs/[id]/page.tsx

**Purpose**: Individual job details

**Displays**:
- Job metadata (ID, submitter, timestamps)
- Input/Output CIDs (with IPFS links)
- Fee amount and payment status
- Processing node info
- Status timeline
- Download buttons

---

### 4. /lit-compute/analytics/page.tsx

**Purpose**: Platform-wide analytics (uses AnalyticsCharts)

**Sections**:
- Network overview (total nodes, jobs, volume)
- Charts (jobs/time, success rate, earnings)
- Leaderboard (top nodes by earnings)
- System health metrics

---

## 🤖 QC Pipeline Setup

### Phase 1: Playwright E2E Tests

**File Structure**:
```bash
tests/
├── e2e/
│   ├── lit-compute/
│   │   ├── job-submission.spec.ts
│   │   ├── node-dashboard.spec.ts
│   │   ├── payment-history.spec.ts
│   │   └── websocket-updates.spec.ts
│   └── fixtures/
│       ├── mock-jobs.ts
│       ├── mock-nodes.ts
│       └── mock-payments.ts
└── playwright.config.ts
```

**Test Coverage**:
- ✅ Job submission flow (upload → submit → status → complete)
- ✅ Node dashboard real-time updates
- ✅ Payment history pagination
- ✅ WebSocket reconnection
- ✅ Error handling (network failures, validation)

---

### Phase 2: PKP Agent Test Runners

**Concept**: Autonomous agents that continuously test the live system

**Agents**:
1. **PKP_JobSubmitter** - Submits test jobs every 5 minutes
2. **PKP_NodeMonitor** - Watches node uptime and alerts on failures
3. **PKP_PaymentAuditor** - Verifies payment calculations
4. **PKP_PerformanceTracker** - Logs metrics to PostgreSQL

**Implementation**:
```typescript
// Example: PKP_JobSubmitter agent
export class PKPJobSubmitter {
  private pkpWallet: string;
  private sessionSigs: any;
  
  async runContinuously() {
    setInterval(async () => {
      // 1. Generate test file
      const testData = generateRandomTestData();
      
      // 2. Upload to IPFS
      const cid = await uploadToIPFS(testData);
      
      // 3. Submit job
      const job = await litComputeAPI.submitJob({
        inputCID: cid,
        accessControl: this.pkpWallet,
        feeAmount: '0.01', // Small test amount
        submitter: this.pkpWallet
      });
      
      // 4. Monitor completion
      const result = await this.waitForCompletion(job.id, 300); // 5 min timeout
      
      // 5. Log results
      await logTestResult({
        timestamp: new Date(),
        jobId: job.id,
        success: result.status === 'completed',
        duration: result.completedAt - result.submittedAt,
        nodeId: result.nodeId
      });
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}
```

**Deployment**:
- Run as NestJS cron jobs in The Beach
- Store results in PostgreSQL
- Alert on Slack/Discord if failures > 5%

---

### Phase 3: CI/CD Quality Gates

**GitHub Actions Workflow**:
```yaml
name: Y8 App - Lit Compute QC

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
      - run: npm run lint
      - run: npm run type-check
      
  lighthouse-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3001/lit-compute
            http://localhost:3001/lit-compute/dashboard
          
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: preactjs/compressed-size-action@v2
```

**Quality Gates**:
- ✅ All Playwright tests pass
- ✅ TypeScript builds with 0 errors
- ✅ Lighthouse score > 90
- ✅ Bundle size < 300 KB
- ✅ No ESLint errors

---

## 📊 Success Metrics

### Completion Criteria (50%)

**Component Checklist**:
- [x] JobSubmission.tsx (40%)
- [x] SystemStatsDashboard.tsx (40%)
- [ ] NodeDashboard.tsx (45%)
- [ ] PaymentHistory.tsx (45%)
- [ ] JobList.tsx (48%)
- [ ] AnalyticsCharts.tsx (50%)

**Page Checklist**:
- [x] /lit-compute (landing) (40%)
- [ ] /lit-compute/dashboard (45%)
- [ ] /lit-compute/nodes (48%)
- [ ] /lit-compute/jobs/[id] (48%)
- [ ] /lit-compute/analytics (50%)

**QC Checklist**:
- [ ] Playwright tests (5 specs)
- [ ] PKP agent runners (4 agents)
- [ ] CI/CD pipeline
- [ ] Monitoring dashboard

**Timeline**:
- Components: 2-3 hours (NPE_Frontend_Evaluator)
- Pages: 1-2 hours (NPE_Frontend_Evaluator)
- QC Setup: 2-3 hours (NPE_Frontend_Evaluator + PKP agents)
- **Total**: 5-8 hours

---

## 🚀 Deployment Plan

### Step 1: Build Components (Now)
```bash
cd /home/goodfaith/projects/y8-app

# Create components
touch components/LitCompute/NodeDashboard.tsx
touch components/LitCompute/PaymentHistory.tsx
touch components/LitCompute/JobList.tsx
touch components/LitCompute/AnalyticsCharts.tsx
```

### Step 2: Build Pages (Next)
```bash
# Create page directories
mkdir -p app/lit-compute/dashboard
mkdir -p app/lit-compute/nodes
mkdir -p app/lit-compute/jobs/[id]
mkdir -p app/lit-compute/analytics

# Create page files
touch app/lit-compute/dashboard/page.tsx
touch app/lit-compute/nodes/page.tsx
touch app/lit-compute/jobs/[id]/page.tsx
touch app/lit-compute/analytics/page.tsx
```

### Step 3: Add Tests (Then)
```bash
# Create test structure
mkdir -p tests/e2e/lit-compute
mkdir -p tests/fixtures

# Create test files
touch tests/e2e/lit-compute/job-submission.spec.ts
touch tests/e2e/lit-compute/node-dashboard.spec.ts
```

### Step 4: Deploy PKP Agents (Finally)
```bash
cd /home/goodfaith/projects/xr/babylon

# Create agent service
touch src/npe/pkp-agents.service.ts
touch src/npe/agents/pkp-job-submitter.ts
```

---

## 🎯 Next Actions (Immediate)

1. **Create NodeDashboard.tsx** - Highest priority component
2. **Create PaymentHistory.tsx** - Critical for node operators
3. **Create /lit-compute/dashboard page** - User entry point
4. **Set up Playwright** - Foundation for QC
5. **Deploy first PKP agent** - PKP_JobSubmitter for continuous testing

---

**Status**: 🚧 Sprint Active  
**ETA**: 40% → 50% in next 6-8 hours  
**NPE Agent**: Standing by for work assignment
