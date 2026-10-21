# Task Assignment Authorization System

Complete WebAuthn-based authorization system for freemium users to assign tasks to their sub-PKP agents.

## 📋 Overview

The Task Assignment Authorization System provides a tier-based workflow for managing task assignments to sub-PKP agents. Freemium users must manually approve task assignments, while Basic and Premium users get automatic approval with higher quotas.

## 🎯 Features

### Three-Tier Authorization Model

| Feature | Freemium | Basic | Premium |
|---------|----------|-------|---------|
| **Pending Tasks** | 3 max | 25 max | Unlimited |
| **Active per Sub-PKP** | 1 max | 3 max | Unlimited |
| **Max Sub-PKPs** | 3 | 25 | Unlimited |
| **Approval Required** | ✅ Yes | ❌ No | ❌ No |
| **Bulk Assignments** | ❌ No | ✅ Yes | ✅ Yes |
| **Request Expiration** | 24 hours | 24 hours | 24 hours |

### Request/Approval Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Requests Task Assignment                       │
│    POST /npe/tasks/assignments/request                 │
│    - Task ID, Sub-PKP, Agent Type, Priority            │
│    - Automatic quota validation                        │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 2. System Creates Assignment Request                   │
│    - Status: PENDING                                    │
│    - Freemium: Requires manual approval                │
│    - Basic/Premium: Auto-approved immediately          │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Approval Decision (Freemium Only)                   │
│    POST /npe/tasks/assignments/:id/approve             │
│    POST /npe/tasks/assignments/:id/reject              │
│    - WebAuthn verification via PKPAuthService           │
│    - UI notifications via EventEmitter                  │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Task Assignment Execution                           │
│    - PKPTaskManagerService.assignTaskToAgent()         │
│    - Agent status updated                              │
│    - Event emitted: assignment.approved                │
└─────────────────────────────────────────────────────────┘
```

## 🗂️ Architecture

### Backend Services

**`src/npe/services/task-authorization.service.ts`** (450 lines)
- Core authorization logic
- Quota management and validation
- Request/approval workflow
- Event emission for real-time updates
- Automatic cleanup of expired requests

**`src/npe/task-assignment.controller.ts`** (140 lines)
- 8 REST API endpoints
- Request/approve/reject operations
- Bulk assignment support
- Stats and quota tracking

**`src/npe/pkp-task-manager.service.ts`** (enhanced)
- Added `getActiveTasksForPKP(mainPKP)`
- Added `getActiveTasksForSubPKP(subPKP)`
- Added `assignTaskToAgent(taskId, agentType)`

### Frontend UIs

**`public/task-assignment-monitor.html`** (600 lines)
- Monitor UI for desktop/web
- Real-time stats dashboard
- Pending assignments list with approve/reject
- Auto-refresh every 5 seconds
- Tier information and upgrade prompts

**`public/vr-task-assignments.html`** (Babylon.js VR)
- Immersive VR interface
- 3D task cards with spatial layout
- Hand controller interactions
- WebXR support

**`src/scenes/VRTaskAssignmentUI.ts`**
- Babylon.js VR component class
- 3D UI elements and interactions
- Real-time API integration

## 🔌 API Reference

### Request Task Assignment

```http
POST /npe/tasks/assignments/request
Content-Type: application/json

{
  "mainPKP": "0x1234...abcd",
  "subPKP": "0x5678...ef01",
  "taskId": 1,
  "agentType": "pkp_test_runner",
  "priority": "high",
  "estimatedHours": 4,
  "metadata": {
    "taskTitle": "Setup Playwright Tests",
    "taskPriority": "high",
    "agentType": "TEST_RUNNER",
    "estimatedHours": 4
  }
}
```

**Response:**
```json
{
  "id": "req_abc123",
  "mainPKP": "0x1234...abcd",
  "subPKP": "0x5678...ef01",
  "taskId": 1,
  "agentType": "pkp_test_runner",
  "status": "pending",
  "requiresApproval": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

### Approve Assignment

```http
POST /npe/tasks/assignments/:id/approve
Content-Type: application/json

{
  "mainPKP": "0x1234...abcd"
}
```

### Reject Assignment

```http
POST /npe/tasks/assignments/:id/reject
Content-Type: application/json

{
  "mainPKP": "0x1234...abcd",
  "reason": "Not enough resources available"
}
```

### Bulk Assignment (Basic/Premium only)

```http
POST /npe/tasks/assignments/bulk
Content-Type: application/json

{
  "mainPKP": "0x1234...abcd",
  "assignments": [
    {
      "subPKP": "0x5678...ef01",
      "taskId": 1,
      "agentType": "pkp_test_runner",
      "priority": "high",
      "estimatedHours": 4,
      "metadata": { ... }
    },
    {
      "subPKP": "0x5678...ef02",
      "taskId": 2,
      "agentType": "pkp_code_reviewer",
      "priority": "medium",
      "estimatedHours": 6,
      "metadata": { ... }
    }
  ]
}
```

### Get Pending Assignments

```http
GET /npe/tasks/assignments/pending?mainPKP=0x1234...abcd
```

### Get All Assignments

```http
GET /npe/tasks/assignments?mainPKP=0x1234...abcd&status=pending
```

### Get User Stats

```http
GET /npe/tasks/assignments/stats/0x1234...abcd
```

**Response:**
```json
{
  "tier": "freemium",
  "quota": {
    "maxPendingTasks": 3,
    "maxActivePerSubPKP": 1,
    "maxSubPKPs": 3,
    "requiresApproval": true,
    "bulkAssignmentAllowed": false
  },
  "usage": {
    "pendingTasks": 2,
    "activeTasks": 1,
    "subPKPCount": 2,
    "assignmentsThisMonth": 15
  }
}
```

## 🚀 Usage Examples

### Freemium User Workflow

```typescript
// 1. Request task assignment
const request = await fetch('/npe/tasks/assignments/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mainPKP: '0x1234...abcd',
    subPKP: '0x5678...ef01',
    taskId: 1,
    agentType: 'pkp_test_runner',
    priority: 'high',
    estimatedHours: 4,
    metadata: {
      taskTitle: 'Setup Playwright Tests',
      taskPriority: 'high',
      agentType: 'TEST_RUNNER',
      estimatedHours: 4
    }
  })
});

const assignment = await request.json();
// assignment.status === 'pending'
// assignment.requiresApproval === true

// 2. User reviews in Monitor UI or VR UI
// 3. User approves
const approve = await fetch(`/npe/tasks/assignments/${assignment.id}/approve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mainPKP: '0x1234...abcd' })
});

// 4. Task is now assigned to agent
// assignment.status === 'approved'
```

### Basic/Premium User Workflow

```typescript
// Request is auto-approved
const request = await fetch('/npe/tasks/assignments/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* ... */ })
});

const assignment = await request.json();
// assignment.status === 'approved' (immediately)
// assignment.requiresApproval === false

// Or use bulk assignment
const bulk = await fetch('/npe/tasks/assignments/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mainPKP: '0x1234...abcd',
    assignments: [
      { subPKP: '0x5678...ef01', taskId: 1, /* ... */ },
      { subPKP: '0x5678...ef02', taskId: 2, /* ... */ },
      { subPKP: '0x5678...ef03', taskId: 3, /* ... */ },
    ]
  })
});
```

## 🎨 UI Access

### Monitor UI (Web)
```
http://localhost:3000/task-assignment-monitor.html?mainPKP=0x1234...abcd
```

Features:
- Real-time stats dashboard
- Pending assignments list
- Approve/reject buttons
- Tier information
- Sub-PKP list
- Upgrade prompts

### VR UI (Immersive)
```
http://localhost:3000/vr-task-assignments.html?mainPKP=0x1234...abcd
```

Features:
- 3D task cards in space
- Hand controller interactions
- Spatial audio notifications
- WebXR immersive mode

## 🔔 Real-time Events

The system emits events via EventEmitter2 for real-time updates:

```typescript
// Listen for assignment events
eventEmitter.on('assignment.requested', (data) => {
  console.log('New assignment requested:', data);
});

eventEmitter.on('assignment.approved', (data) => {
  console.log('Assignment approved:', data);
});

eventEmitter.on('assignment.rejected', (data) => {
  console.log('Assignment rejected:', data);
});

eventEmitter.on('assignment.expired', (data) => {
  console.log('Assignment expired:', data);
});
```

## 🧪 Testing

### Manual Testing

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Open Monitor UI:**
   ```
   http://localhost:3000/task-assignment-monitor.html?mainPKP=demo-pkp
   ```

3. **Request an assignment:**
   ```bash
   curl -X POST http://localhost:3000/npe/tasks/assignments/request \
     -H "Content-Type: application/json" \
     -d '{
       "mainPKP": "demo-pkp",
       "subPKP": "demo-sub-1",
       "taskId": 1,
       "agentType": "pkp_test_runner",
       "priority": "high",
       "estimatedHours": 4,
       "metadata": {
         "taskTitle": "Test Task",
         "taskPriority": "high",
         "agentType": "TEST_RUNNER",
         "estimatedHours": 4
       }
     }'
   ```

4. **Check pending assignments in UI**

5. **Approve or reject via UI buttons**

### E2E Testing Scenarios

- ✅ Freemium quota enforcement (3 pending, 1 active/sub-PKP, 3 sub-PKPs)
- ✅ Basic/Premium auto-approval
- ✅ Bulk assignment blocking for freemium
- ✅ Request expiration after 24 hours
- ✅ Reject with reason tracking
- ✅ Stats accuracy
- ✅ Event emission

## 🔒 Security

### WebAuthn Integration

The system integrates with `PKPAuthService` for WebAuthn-based authentication:

```typescript
// PKP hierarchy verification
const hierarchy = await this.pkpAuthService.getHierarchy(mainPKP);

// Sub-PKP ownership verification
const subPKP = hierarchy.subPKPs.get(params.subPKP);
if (!subPKP) {
  throw new ForbiddenException('Sub-PKP not owned by main PKP');
}
```

### Authorization Checks

- ✅ Main PKP existence verification
- ✅ Sub-PKP ownership validation
- ✅ Quota enforcement before assignment
- ✅ Tier-based feature gating
- ✅ Request expiration cleanup

## 📊 Monitoring

### Quota Usage Dashboard

The Monitor UI displays:
- Pending tasks count
- Active tasks count
- Sub-PKP count
- Monthly assignment count
- Quota limits by tier
- Upgrade prompts

### Automatic Cleanup

The service runs a cleanup cron job every hour:
```typescript
@Cron(CronExpression.EVERY_HOUR)
cleanupExpiredRequests() {
  // Remove requests older than 24 hours
}
```

## 🚀 Deployment

The system is integrated into the NPE module and deployed with the main application:

```typescript
// src/npe/npe.module.ts
@Module({
  imports: [EventEmitterModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [
    // ...
    TaskAssignmentController,
  ],
  providers: [
    // ...
    TaskAuthorizationService,
  ],
  exports: [
    // ...
    TaskAuthorizationService,
  ],
})
export class NPEModule {}
```

## 📈 Future Enhancements

- [ ] WebSocket/SSE for true real-time updates (replace polling)
- [ ] Email notifications for freemium approvals
- [ ] Assignment history view
- [ ] Analytics dashboard
- [ ] Database persistence (currently in-memory)
- [ ] Rate limiting on endpoints
- [ ] Admin dashboard
- [ ] Audit logging
- [ ] Voice commands in VR UI
- [ ] Haptic feedback in VR

## 📝 License

Part of The Beach project. See main LICENSE file.

## 👥 Contributors

Built by the NPE Team for The Beach Lit Compute Network.
