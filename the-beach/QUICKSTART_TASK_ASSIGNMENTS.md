# Quick Start: Task Assignment Authorization

Get started with the WebAuthn-based task assignment system in 5 minutes!

## 🚀 Quick Setup

### 1. Start the Server

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` with all services loaded.

### 2. Access the Monitor UI

Open in your browser:
```
http://localhost:3000/task-assignment-monitor.html?mainPKP=demo-pkp
```

You'll see:
- Stats dashboard (pending, active, sub-PKPs, monthly count)
- Pending assignments list (empty initially)
- Tier information
- Sub-PKP list

### 3. Request Your First Task Assignment

Using cURL:
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
      "taskTitle": "Setup Playwright Tests",
      "taskPriority": "high",
      "agentType": "TEST_RUNNER",
      "estimatedHours": 4
    }
  }'
```

Or using JavaScript:
```javascript
fetch('http://localhost:3000/npe/tasks/assignments/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mainPKP: 'demo-pkp',
    subPKP: 'demo-sub-1',
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
})
.then(r => r.json())
.then(console.log);
```

### 4. Review in Monitor UI

The UI will auto-refresh every 5 seconds and show:
- New pending assignment card
- Task details (title, ID, priority, agent type, hours)
- **Approve** and **Reject** buttons

### 5. Approve or Reject

Click the **✅ Approve** or **❌ Reject** button on the task card.

For freemium users, this manually approves the task assignment to the sub-PKP agent.

## 🎮 VR UI Quick Start

### 1. Open VR Interface

```
http://localhost:3000/vr-task-assignments.html?mainPKP=demo-pkp
```

### 2. Enter VR Mode

Click the **"Enter VR"** button to activate WebXR immersive mode (requires VR headset).

### 3. Interact with Tasks

- **Look around** to see 3D task cards floating in space
- **Point and click** with controllers to approve/reject tasks
- Tasks are color-coded: 🟠 Pending, 🟢 Approved, 🔴 Rejected

## 📊 Check Stats

```bash
curl http://localhost:3000/npe/tasks/assignments/stats/demo-pkp
```

Response:
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
    "pendingTasks": 1,
    "activeTasks": 0,
    "subPKPCount": 1,
    "assignmentsThisMonth": 1
  }
}
```

## 🎯 Test Different Tiers

### Freemium Tier

- ✅ Manual approval required
- ✅ 3 pending tasks max
- ✅ 1 active task per sub-PKP
- ❌ No bulk assignments

### Basic Tier

Change tier to test auto-approval:
```javascript
// Auto-approved immediately
fetch('http://localhost:3000/npe/tasks/assignments/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mainPKP: 'basic-tier-pkp',
    // ... same payload
  })
})
// Response will have status: 'approved' immediately
```

### Premium Tier

Test bulk assignments:
```bash
curl -X POST http://localhost:3000/npe/tasks/assignments/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "mainPKP": "premium-pkp",
    "assignments": [
      {
        "subPKP": "premium-sub-1",
        "taskId": 1,
        "agentType": "pkp_test_runner",
        "priority": "high",
        "estimatedHours": 4,
        "metadata": { "taskTitle": "Task 1", "taskPriority": "high", "agentType": "TEST_RUNNER", "estimatedHours": 4 }
      },
      {
        "subPKP": "premium-sub-2",
        "taskId": 2,
        "agentType": "pkp_code_reviewer",
        "priority": "medium",
        "estimatedHours": 6,
        "metadata": { "taskTitle": "Task 2", "taskPriority": "medium", "agentType": "CODE_REVIEWER", "estimatedHours": 6 }
      }
    ]
  }'
```

## 🔍 View All Endpoints

### List Pending Assignments
```bash
curl "http://localhost:3000/npe/tasks/assignments/pending?mainPKP=demo-pkp"
```

### List All Assignments
```bash
curl "http://localhost:3000/npe/tasks/assignments?mainPKP=demo-pkp"
```

### Filter by Status
```bash
curl "http://localhost:3000/npe/tasks/assignments?mainPKP=demo-pkp&status=approved"
```

### Get Specific Assignment
```bash
curl "http://localhost:3000/npe/tasks/assignments/req_abc123"
```

### Reject with Reason
```bash
curl -X POST http://localhost:3000/npe/tasks/assignments/req_abc123/reject \
  -H "Content-Type: application/json" \
  -d '{
    "mainPKP": "demo-pkp",
    "reason": "Not enough resources available"
  }'
```

## 🧪 Common Test Scenarios

### Scenario 1: Quota Limit (Freemium)

Request 4 tasks (exceeds limit of 3):
```bash
# Request 1, 2, 3 succeed
curl -X POST http://localhost:3000/npe/tasks/assignments/request -H "Content-Type: application/json" -d '{"mainPKP":"demo-pkp","subPKP":"demo-sub-1","taskId":1,"agentType":"pkp_test_runner","priority":"high","estimatedHours":4,"metadata":{"taskTitle":"Task 1","taskPriority":"high","agentType":"TEST_RUNNER","estimatedHours":4}}'

curl -X POST http://localhost:3000/npe/tasks/assignments/request -H "Content-Type: application/json" -d '{"mainPKP":"demo-pkp","subPKP":"demo-sub-1","taskId":2,"agentType":"pkp_test_runner","priority":"high","estimatedHours":4,"metadata":{"taskTitle":"Task 2","taskPriority":"high","agentType":"TEST_RUNNER","estimatedHours":4}}'

curl -X POST http://localhost:3000/npe/tasks/assignments/request -H "Content-Type: application/json" -d '{"mainPKP":"demo-pkp","subPKP":"demo-sub-1","taskId":3,"agentType":"pkp_test_runner","priority":"high","estimatedHours":4,"metadata":{"taskTitle":"Task 3","taskPriority":"high","agentType":"TEST_RUNNER","estimatedHours":4}}'

# Request 4 fails with quota exceeded error
curl -X POST http://localhost:3000/npe/tasks/assignments/request -H "Content-Type: application/json" -d '{"mainPKP":"demo-pkp","subPKP":"demo-sub-1","taskId":4,"agentType":"pkp_test_runner","priority":"high","estimatedHours":4,"metadata":{"taskTitle":"Task 4","taskPriority":"high","agentType":"TEST_RUNNER","estimatedHours":4}}'
```

Expected: 400 error "Pending task quota exceeded"

### Scenario 2: Auto-Approval (Basic/Premium)

```bash
curl -X POST http://localhost:3000/npe/tasks/assignments/request \
  -H "Content-Type: application/json" \
  -d '{"mainPKP":"basic-pkp","subPKP":"basic-sub-1","taskId":1,"agentType":"pkp_test_runner","priority":"high","estimatedHours":4,"metadata":{"taskTitle":"Auto Task","taskPriority":"high","agentType":"TEST_RUNNER","estimatedHours":4}}'
```

Expected: Response with `status: "approved"` immediately

### Scenario 3: Bulk Assignment Blocked (Freemium)

```bash
curl -X POST http://localhost:3000/npe/tasks/assignments/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "mainPKP": "demo-pkp",
    "assignments": [
      {"subPKP":"demo-sub-1","taskId":1,"agentType":"pkp_test_runner","priority":"high","estimatedHours":4,"metadata":{"taskTitle":"Task 1","taskPriority":"high","agentType":"TEST_RUNNER","estimatedHours":4}},
      {"subPKP":"demo-sub-2","taskId":2,"agentType":"pkp_code_reviewer","priority":"medium","estimatedHours":6,"metadata":{"taskTitle":"Task 2","taskPriority":"medium","agentType":"CODE_REVIEWER","estimatedHours":6}}
    ]
  }'
```

Expected: 403 error "Bulk assignments not allowed for freemium tier"

## 📱 Monitor UI Features

### Dashboard Cards

1. **Pending Tasks** - Orange badge, count of pending approvals
2. **Active Tasks** - Blue badge, count of running tasks
3. **Sub-PKPs** - Purple badge, number of sub-PKP agents
4. **Monthly Assignments** - Green badge, assignments this month

### Task Cards

Each pending assignment shows:
- 📋 Task title
- 🔢 Task ID
- 🎯 Priority badge (HIGH/MEDIUM/LOW)
- 🤖 Agent type
- ⏱️ Estimated hours
- ⏰ Request timestamp
- ✅ Approve button (green)
- ❌ Reject button (red)

### Auto-Refresh

The UI automatically refreshes every 5 seconds to show new assignments.

## 🎮 VR UI Features

### 3D Interface

- 📋 Main dashboard panel at eye level (3m forward)
- 📊 Stats bar with 4 stat cards
- 📦 3D task cards in grid layout (2 per row)
- 🎨 Color-coded by priority
- 👆 Click interactions with controllers

### Spatial Layout

Tasks are positioned spatially based on priority:
- **High priority**: Closer to user
- **Medium priority**: Mid-distance
- **Low priority**: Further away

### Notifications

Approve/reject actions show floating 3D notifications with:
- ✅ Success messages (green)
- ❌ Error messages (red)
- Auto-fade after 3 seconds

## 🐛 Troubleshooting

### "PKP not found" Error

Make sure the mainPKP exists in PKPAuthService. For testing, use `demo-pkp`.

### "Sub-PKP not found" Error

The sub-PKP must belong to the main PKP. Check `PKPAuthService.getHierarchy()`.

### UI Not Refreshing

Check browser console for fetch errors. Server must be running on port 3000.

### VR Mode Not Working

Requires:
- HTTPS or localhost
- WebXR-compatible browser (Chrome, Edge, Firefox Reality)
- VR headset connected

## 📚 Next Steps

1. ✅ Try all API endpoints
2. ✅ Test freemium quota limits
3. ✅ Test auto-approval for Basic/Premium
4. ✅ Explore VR UI in headset
5. ✅ Review full documentation in `TASK_ASSIGNMENT_AUTHORIZATION.md`

## 🆘 Need Help?

- 📖 Full docs: `TASK_ASSIGNMENT_AUTHORIZATION.md`
- 🔍 API reference: See "API Reference" section in full docs
- 🎨 UI code: `public/task-assignment-monitor.html`, `public/vr-task-assignments.html`
- ⚙️ Backend: `src/npe/services/task-authorization.service.ts`

Happy task assigning! 🚀
