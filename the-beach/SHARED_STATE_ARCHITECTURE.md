# Shared State Architecture: Y8 App ↔ The Beach

## Overview

**Yes! Redis creates shared state between `y8-app` and `the-beach`.**

Both applications connect to the **same Redis instance**, enabling:
- ✅ Shared user sessions
- ✅ Distributed job queue
- ✅ Real-time node registry
- ✅ Cross-app pub/sub messaging
- ✅ Centralized payment tracking

## Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐
│    Y8 App       │         │   The Beach     │
│  (Frontend)     │         │   (Backend)     │
│                 │         │                 │
│  - User Login   │         │  - Node Mgmt    │
│  - NPE Tiers    │         │  - Job Queue    │
│  - Sessions     │         │  - IPLD Service │
│  - Payments     │         │  - WebSockets   │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │    Both connect to:       │
         │                           │
         └──────────┬────────────────┘
                    │
            ┌───────▼──────────┐
            │                  │
            │  Redis (Shared)  │
            │                  │
            │  Keys:           │
            │  ├─ session:*    │ ← User sessions
            │  ├─ nodes:*      │ ← Compute nodes
            │  ├─ jobs:*       │ ← Job queue
            │  ├─ payments:*   │ ← Pending payments
            │  └─ channel:*    │ ← Pub/sub events
            │                  │
            └──────────────────┘
```

## Shared Data Structures

### 1. **User Sessions** (Shared State)
```typescript
// Key: session:{userId}
{
  userId: "user_123",
  walletAddress: "0x...",
  nftTier: "gold",
  pkpPublicKey: "0x...",
  lastActivity: 1762442316036
}
```

**How it works:**
- User logs in via Y8 App → session stored in Redis
- The Beach reads the same session → authenticated automatically
- Single Sign-On (SSO) across both apps

### 2. **Node Registry** (Managed by The Beach, Read by Y8)
```typescript
// Key: nodes:{nodeId}:status
{
  nodeId: "zB4ppd...",
  walletAddress: "0x1234...",
  capacity: 5,
  reputation: 95,
  status: "online",
  lastHeartbeat: 1762442316036
}

// Key: nodes:available (Set of active node IDs)
["zB4ppd...", "zFX3fM...", ...]
```

**How it works:**
- Compute nodes register via The Beach → stored in Redis
- Y8 App queries available nodes → reads from Redis
- Real-time node health monitoring shared across apps

### 3. **Job Queue** (Distributed State)
```typescript
// Key: jobs:pending (Sorted Set by timestamp)
{
  jobId: "job_abc123",
  inputCID: "zFX3fM...",
  requester: "0x1234...",
  status: "pending",
  priority: 100
}

// Key: jobs:active:{nodeId} (Set of job IDs)
["job_abc123", "job_def456"]

// Key: job:{jobId}:status (Hash)
{
  status: "active",
  nodeId: "zB4ppd...",
  startedAt: 1762442316036,
  outputCID: null
}
```

**How it works:**
- Y8 App submits job → added to Redis queue
- The Beach assigns job to node → updates Redis
- Both apps track job status in real-time

### 4. **Payment Queue** (Shared Financial State)
```typescript
// Key: payments:pending:{nodeId}
[
  {
    jobId: "job_abc123",
    amount: "0.1 ETH",
    timestamp: 1762442316036
  }
]
```

**How it works:**
- Jobs complete → payment added to Redis queue
- Y8 App processes payments → reads from Redis
- The Beach tracks payment confirmations → updates Redis

### 5. **Real-time Events** (Pub/Sub)
```typescript
// Channels:
channel:global:events        // Global system events
channel:job:{jobId}:updates  // Job-specific updates
channel:node:{nodeId}:commands // Node commands
```

**How it works:**
- The Beach publishes events → Redis pub/sub
- Y8 App subscribes → receives real-time updates
- WebSocket clients get instant notifications

## Production Setup

### Current (Development)
```bash
REDIS_URL=redis://localhost:6379
```
- Both apps connect to local Redis
- Perfect for local development and testing

### Production (Vercel)
```bash
# Vercel KV (Upstash Redis)
REDIS_URL=redis://default:password@region.upstash.io:6379
KV_REST_API_URL=https://region.upstash.io
KV_REST_API_TOKEN=xxxxx
```

**Setup Steps:**
1. Create **ONE** Vercel KV database at https://vercel.com/dashboard/stores
2. Link it to **BOTH** projects:
   - `the-beach` project
   - `y8-app` project
3. Vercel automatically adds the same Redis URL to both
4. Both apps now share the same Redis instance in production

## State Sharing Examples

### Example 1: User Login Flow
```typescript
// 1. User logs in via Y8 App
await redisService.setSession('user_123', {
  walletAddress: '0x1234...',
  nftTier: 'gold'
});

// 2. User navigates to The Beach
const session = await redisService.getSession('user_123');
// ✅ User already authenticated!
```

### Example 2: Job Submission & Processing
```typescript
// 1. Y8 App: Submit job
await redisService.enqueueJob({
  id: 'job_abc123',
  inputCID: 'zFX3fM...',
  requester: '0x1234...'
});

// 2. The Beach: Assign to node
const job = await redisService.dequeueJob();
await redisService.assignJobToNode(job.id, 'zB4ppd...');

// 3. Y8 App: Check status
const status = await redisService.getJobStatus('job_abc123');
// ✅ status: "active", nodeId: "zB4ppd..."
```

### Example 3: Node Monitoring
```typescript
// 1. The Beach: Node sends heartbeat
await redisService.registerNodeHeartbeat('zB4ppd...', {
  capacity: 5,
  walletAddress: '0x1234...'
});

// 2. Y8 App: Display available nodes
const nodes = await redisService.getAvailableNodes();
// ✅ ['zB4ppd...', 'zFX3fM...']
```

## Data Flow Patterns

### Pattern 1: Read-After-Write Consistency
```
Y8 App (write) → Redis → The Beach (read)
```
Example: User updates tier → The Beach sees new tier immediately

### Pattern 2: Event-Driven Updates
```
The Beach (publish) → Redis Pub/Sub → Y8 App (subscribe)
```
Example: Job completes → Y8 App WebSocket notifies user instantly

### Pattern 3: Distributed Queue
```
Y8 App (producer) → Redis Queue → The Beach (consumer)
```
Example: Jobs submitted from Y8 → processed by The Beach nodes

## Benefits of Shared State

### 1. **Single Source of Truth**
- No data duplication
- No sync conflicts
- Consistent state across apps

### 2. **Real-time Synchronization**
- Sub-second latency
- Pub/sub for instant updates
- No polling required

### 3. **Scalability**
- Both apps can scale independently
- Redis handles concurrent access
- Built-in connection pooling

### 4. **Simplified Architecture**
- No need for database replication
- No API calls between apps for shared data
- Reduced complexity

### 5. **User Experience**
- Seamless SSO
- Real-time job status
- Instant payment confirmations

## Verification

### Check Shared State:
```bash
# Register a node in The Beach
curl -X POST http://localhost:3001/lit-compute/nodes/register \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234...","publicKey":"0x04...","capabilities":{"maxConcurrentJobs":5}}'

# Verify in Redis
redis-cli KEYS "nodes:*"

# The data is now accessible to both apps!
```

### Test Session Sharing:
```bash
# Y8 App creates session
redis-cli HSET session:user_123 walletAddress "0x1234..." nftTier "gold"

# The Beach reads session
redis-cli HGETALL session:user_123
```

## Current Status

✅ **Redis configured and running**
✅ **The Beach connected to Redis**
✅ **Node registration tested and working**
✅ **Data persisting in Redis**
⏳ **Y8 App needs to connect to same Redis URL**

## Next Steps for Full Integration

1. **Configure Y8 App** to use the same Redis URL
2. **Test session sharing** between both apps
3. **Implement job submission** from Y8 App
4. **Add WebSocket listeners** in Y8 for real-time updates
5. **Deploy both to Vercel** with shared Vercel KV

---

**Summary:** Yes, this Redis setup creates **true shared state** between Y8 App and The Beach, enabling seamless data sharing, real-time updates, and distributed job processing across both applications! 🎉
