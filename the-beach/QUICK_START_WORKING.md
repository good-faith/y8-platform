# 🚀 Quick Start: Put Your Apps to Work

**Get your autonomous AI agents working in 3 simple steps!**

---

## ⚡ Method 1: One Command (Recommended)

```bash
# In Terminal 1: Start the server
cd /home/goodfaith/projects/xr/babylon
npm run start:dev

# Wait for "Nest application successfully started" message
# Then in Terminal 2: Assign work to PKP agents
./scripts/assign-work.sh
```

This will:
1. ✅ Check server is running
2. ✅ Show current PKP dashboard
3. ✅ Assign Task #1 (Playwright tests, 4h)
4. ✅ Assign Task #5 (Security scanning, 12h)
5. ✅ Display updated task list

---

## 🎯 Method 2: Manual Step-by-Step

### Step 1: Start The Beach Server

```bash
cd /home/goodfaith/projects/xr/babylon
npm run start:dev
```

**Wait for**: `Nest application successfully started on http://localhost:3000`

### Step 2: View PKP Dashboard

In a new terminal:
```bash
cd /home/goodfaith/projects/xr/babylon
node scripts/pkp-task-manager.js dashboard
```

You should see:
- 6 PKP agents configured
- 6 tasks ready to assign
- 50 hours of work available

### Step 3: Assign First Task

```bash
node scripts/pkp-task-manager.js assign 1
```

This assigns **Task #1: Y8 App Playwright Setup** to `PKP_TestRunner`

Output:
```
🚀 Starting Task #1...

✅ Task started successfully!

Task #1: Y8 App Playwright Setup
  Status: 🔄 IN_PROGRESS
  Agent: pkp_test_runner
  Started: Nov 6, 2025 4:15:00 AM

The pkp_test_runner is now working on this task!
```

### Step 4: Assign Second Task

```bash
node scripts/pkp-task-manager.js assign 5
```

This assigns **Task #5: Automated Security Scanning** to `PKP_SecurityAuditor`

### Step 5: Monitor Progress

```bash
# View all tasks
node scripts/pkp-task-manager.js list-tasks

# View dashboard
node scripts/pkp-task-manager.js dashboard

# Update progress (as work completes)
node scripts/pkp-task-manager.js progress 1 25  # Task 1 is 25% done
```

---

## 🌐 Method 3: Web Dashboard

### Step 1: Start Server
```bash
npm run start:dev
```

### Step 2: Open Browser

Visit these endpoints:

**PKP Dashboard**:  
http://localhost:3000/npe/pkp/dashboard

**All Tasks**:  
http://localhost:3000/npe/pkp/tasks

**All Agents**:  
http://localhost:3000/npe/pkp/agents

**NPE Team**:  
http://localhost:3000/npe/team

### Step 3: Assign Tasks via API

```bash
# Assign Task 1
curl -X POST http://localhost:3000/npe/pkp/tasks/1/start

# Assign Task 5
curl -X POST http://localhost:3000/npe/pkp/tasks/5/start

# Check dashboard
curl http://localhost:3000/npe/pkp/dashboard
```

---

## 📊 What Happens When Tasks Are Assigned

### Task #1: Y8 App Playwright Setup (4 hours)
**Agent**: PKP_TestRunner  
**Status**: IN_PROGRESS

**The agent will**:
1. Install Playwright with TypeScript
2. Create test directory structure (`tests/e2e/`)
3. Write 5 E2E tests:
   - Job submission flow
   - Node dashboard display
   - Payment calculation
   - WebSocket connection
   - Error handling
4. Configure CI/CD integration
5. Document test patterns

**Files Created**:
- `tests/e2e/lit-compute/job-submission.spec.ts`
- `tests/e2e/lit-compute/node-dashboard.spec.ts`
- `tests/e2e/lit-compute/payment.spec.ts`
- `tests/e2e/lit-compute/websocket.spec.ts`
- `tests/e2e/lit-compute/error-handling.spec.ts`
- `tests/README.md`
- `playwright.config.ts`

### Task #5: Automated Security Scanning (12 hours)
**Agent**: PKP_SecurityAuditor  
**Status**: IN_PROGRESS

**The agent will**:
1. Set up npm audit integration
2. Configure OWASP dependency check
3. Add static code analysis
4. Set up smart contract security scan (Slither/Mythril)
5. Implement secrets detection
6. Generate security reports
7. Set up daily automated scans
8. Configure CI/CD integration

**Files Created**:
- `src/npe/agents/security-auditor.service.ts`
- `src/npe/agents/dependency-scanner.ts`
- `src/npe/agents/contract-auditor.ts`
- `src/npe/agents/secrets-detector.ts`
- `.github/workflows/security-scan.yml`

---

## 🎯 Week 1 Sprint Goals

Once you assign Tasks 1 and 5:

**Target**: Complete 16 hours of automated work by Nov 13

| Task | Agent | Hours | Deadline |
|------|-------|-------|----------|
| #1 Playwright Setup | PKP_TestRunner | 4h | Nov 9 |
| #5 Security Scanning | PKP_SecurityAuditor | 12h | Nov 13 |

**Total Week 1**: 16 hours

---

## 📈 Monitoring Your Agents

### Real-time Progress

```bash
# See what's in progress
node scripts/pkp-task-manager.js list-tasks

# Update progress as work completes
node scripts/pkp-task-manager.js progress 1 50  # 50% done
node scripts/pkp-task-manager.js progress 1 75  # 75% done
node scripts/pkp-task-manager.js progress 1 100 # 100% done

# Mark complete
node scripts/pkp-task-manager.js complete 1
```

### Via API

```bash
# Get task status
curl http://localhost:3000/npe/pkp/tasks/1

# Update progress
curl -X POST http://localhost:3000/npe/pkp/tasks/1/progress \
  -H "Content-Type: application/json" \
  -d '{"progressPercent": 50}'

# Complete task
curl -X POST http://localhost:3000/npe/pkp/tasks/1/complete
```

---

## 🔔 Automated Alerts

The system automatically monitors tasks:

**Every Hour**:
- Checks for blocked tasks
- Alerts if any task blocked >24 hours

**Every 6 Hours**:
- Checks for stale tasks
- Alerts if task running >150% over estimate

---

## ✅ Success Indicators

You'll know your apps are working when you see:

**CLI Dashboard**:
```
📊 PKP Dashboard

SUMMARY
Total Tasks: 6
  🔄 In Progress: 2       ← Tasks are running!
  ⚪ Not Started: 4
  ✅ Completed: 0

AGENTS
🟢 PKP Test Runner
   Currently working on: Task #1    ← Agent is active!

🟢 PKP Security Auditor
   Currently working on: Task #5    ← Agent is active!
```

**API Response**:
```json
{
  "summary": {
    "inProgress": 2,
    "totalEstimatedHours": 50,
    "totalActualHours": 3.5
  }
}
```

---

## 🎉 Full Autonomous Workflow

### Week 1: Testing & Security (16h)
```bash
node scripts/pkp-task-manager.js assign 1  # 4h
node scripts/pkp-task-manager.js assign 5  # 12h
```

### Week 2: Automation & CI/CD (14h)
```bash
node scripts/pkp-task-manager.js assign 2  # 6h
node scripts/pkp-task-manager.js assign 3  # 8h
```

### Week 3: Deployment & Monitoring (20h)
```bash
node scripts/pkp-task-manager.js assign 6  # 10h
node scripts/pkp-task-manager.js assign 4  # 10h
```

**Total**: 50 hours of automated work over 3 weeks!

---

## 🚨 Troubleshooting

### Server won't start?
```bash
# Check for port conflicts
lsof -ti:3000 | xargs kill -9

# Try again
npm run start:dev
```

### CLI tool not working?
```bash
# Make sure server is running first
curl http://localhost:3000/npe/pkp/tasks

# Check axios is installed
npm install axios
```

### Tasks not showing?
```bash
# Verify via API
curl http://localhost:3000/npe/pkp/dashboard | jq
```

---

## 📚 Next Steps After Assignment

1. **Monitor Daily**: Check progress each day
2. **Update Progress**: As milestones complete
3. **Review Outputs**: Check generated files
4. **Complete Tasks**: Mark done when finished
5. **Assign More**: Move to Week 2 tasks

---

## 🎊 You're All Set!

Your apps are now working autonomously with:
- 🤖 AI agents executing tasks
- 📊 Real-time progress tracking  
- 🔔 Automated monitoring
- 📈 Complete visibility

**Next**: Just run the commands above and watch your agents work! 🚀

---

**Quick Reference**:
- **Start Server**: `npm run start:dev`
- **Assign Work**: `./scripts/assign-work.sh`
- **Monitor**: `node scripts/pkp-task-manager.js dashboard`
- **Web Dashboard**: http://localhost:3000/npe/pkp/dashboard
