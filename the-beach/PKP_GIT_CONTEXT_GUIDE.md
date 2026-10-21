# PKP Git Context Management

**Feature**: Git Branch and Commit Tracking for PKP Tasks  
**Version**: 1.0  
**Date**: November 6, 2025

---

## 🎯 Overview

PKP agents can now work on specific Git branches and track their commits. Each task can be assigned a Git branch, and all commits made by the PKP agent are tracked, making it easy to:

- See what branch a PKP is working on
- Track all commits made by a PKP for a specific task
- Associate Pull Requests with completed work
- Review PKP work history

---

## 📦 Git Context Interface

Each PKP task can have an optional `gitContext` object:

```typescript
interface PKPGitContext {
  branch: string;              // Target branch to work on
  baseBranch?: string;         // Base branch to branch from (default: master/main)
  startCommit?: string;        // Commit hash where work started
  currentCommit?: string;      // Current commit hash
  targetCommit?: string;       // Target commit to reach
  commits?: string[];          // List of commits made by PKP
  pullRequestUrl?: string;     // PR URL when work is ready for review
}
```

---

## 🌿 Pre-configured Branches

All PKP tasks now have Git contexts pre-configured:

| Task ID | Title | Branch | Base Branch |
|---------|-------|--------|-------------|
| 1 | Y8 App Playwright Setup | `feature/pkp-playwright-tests` | `master` |
| 2 | Continuous Job Submission Testing | `feature/pkp-continuous-testing` | `product/lit-compute-network` |
| 3 | GitHub PR Review Automation | `feature/pkp-pr-automation` | `product/lit-compute-network` |
| 4 | Lit Compute Network Metrics Dashboard | `feature/pkp-metrics-dashboard` | `master` |
| 5 | Automated Security Scanning | `feature/pkp-security-scanning` | `product/lit-compute-network` |
| 6 | Automated Deployment Pipeline | `feature/pkp-deployment-pipeline` | `product/lit-compute-network` |

---

## 🛠️ CLI Commands

### View Git Status for a Task

```bash
node scripts/pkp-task-manager.js git-status <taskId>
```

**Example**:
```bash
$ node scripts/pkp-task-manager.js git-status 1

📊 Git Status for Task #1

Task: Y8 App Playwright Setup
Status: 🔄 IN PROGRESS

🌿 Git Context:
  Branch: feature/pkp-playwright-tests
  Base Branch: master
  Start Commit: abc123def456
  Current Commit: xyz789abc123
  Total Commits: 5

  Recent Commits:
    1. abc123def456
    2. def456ghi789
    3. ghi789jkl012
    4. jkl012mno345
    5. xyz789abc123

  PR: https://github.com/jasonsprouse/y8-app/pull/42
```

### Set Git Branch (Override Default)

```bash
node scripts/pkp-task-manager.js set-branch <taskId> <branch> [baseBranch]
```

**Examples**:
```bash
# Set branch with default base (master)
node scripts/pkp-task-manager.js set-branch 1 feature/my-custom-branch

# Set branch with custom base
node scripts/pkp-task-manager.js set-branch 2 feature/my-work product/lit-compute-network
```

**Output**:
```
🌿 Setting Git branch for Task #1...

✅ Git branch set successfully!

Task #1: Y8 App Playwright Setup
  Branch: feature/my-custom-branch
  Base Branch: master
  Repository: jasonsprouse/y8-app
```

### Record a Commit

When a PKP agent makes a commit, record it:

```bash
node scripts/pkp-task-manager.js record-commit <taskId> <commitHash>
```

**Example**:
```bash
$ node scripts/pkp-task-manager.js record-commit 1 abc123def456

📝 Recording commit for Task #1...

✅ Commit recorded successfully!

Task #1: Y8 App Playwright Setup
  Commit: abc123def456
  Branch: feature/pkp-playwright-tests
  Total Commits: 1
```

**Automatic Tracking**:
- First commit is saved as `startCommit`
- Latest commit is saved as `currentCommit`
- All commits are stored in `commits` array

### Set Pull Request URL

When work is ready for review:

```bash
node scripts/pkp-task-manager.js set-pr <taskId> <prUrl>
```

**Example**:
```bash
$ node scripts/pkp-task-manager.js set-pr 1 https://github.com/jasonsprouse/y8-app/pull/42

🔗 Setting PR URL for Task #1...

✅ PR URL set successfully!

Task #1: Y8 App Playwright Setup
  PR: https://github.com/jasonsprouse/y8-app/pull/42
```

### List Tasks by Branch

See all tasks working on a specific branch:

```bash
node scripts/pkp-task-manager.js list-by-branch <branch>
```

**Example**:
```bash
$ node scripts/pkp-task-manager.js list-by-branch feature/pkp-playwright-tests

🌿 Tasks on branch: feature/pkp-playwright-tests

Task #1: Y8 App Playwright Setup
  Status: 🔄 IN PROGRESS
  Agent: pkp_test_runner
  Commits: 5
  PR: https://github.com/jasonsprouse/y8-app/pull/42

Total: 1 tasks on branch feature/pkp-playwright-tests
```

---

## 🌐 API Endpoints

### Update Git Context

```http
POST /npe/pkp/tasks/:id/git-context
Content-Type: application/json

{
  "branch": "feature/my-branch",
  "baseBranch": "master",
  "targetCommit": "abc123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Git context updated",
  "data": {
    "id": 1,
    "title": "Y8 App Playwright Setup",
    "gitContext": {
      "branch": "feature/my-branch",
      "baseBranch": "master",
      "targetCommit": "abc123"
    }
  }
}
```

### Record Commit

```http
POST /npe/pkp/tasks/:id/commit
Content-Type: application/json

{
  "commitHash": "abc123def456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Commit recorded",
  "data": {
    "id": 1,
    "gitContext": {
      "branch": "feature/pkp-playwright-tests",
      "startCommit": "abc123def456",
      "currentCommit": "abc123def456",
      "commits": ["abc123def456"]
    }
  }
}
```

### Set PR URL

```http
POST /npe/pkp/tasks/:id/pr
Content-Type: application/json

{
  "prUrl": "https://github.com/jasonsprouse/y8-app/pull/42"
}
```

**Response**:
```json
{
  "success": true,
  "message": "PR URL set",
  "data": {
    "id": 1,
    "gitContext": {
      "pullRequestUrl": "https://github.com/jasonsprouse/y8-app/pull/42"
    }
  }
}
```

### Get Tasks by Branch

```http
GET /npe/pkp/tasks/branch/:branch
```

**Example**:
```http
GET /npe/pkp/tasks/branch/feature%2Fpkp-playwright-tests
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Y8 App Playwright Setup",
      "gitContext": {
        "branch": "feature/pkp-playwright-tests",
        "commits": ["abc123", "def456"]
      }
    }
  ],
  "count": 1
}
```

### Get Tasks with Git Context

```http
GET /npe/pkp/tasks/with-git-context
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Y8 App Playwright Setup",
      "gitContext": { ... }
    },
    {
      "id": 2,
      "title": "Continuous Job Submission Testing",
      "gitContext": { ... }
    }
  ],
  "count": 6
}
```

---

## 🔄 Typical Workflow

### 1. PKP Agent Starts Task

```bash
# Agent is assigned task (already has Git context pre-configured)
node scripts/pkp-task-manager.js assign 1
```

**Task now has**:
- `branch`: `feature/pkp-playwright-tests`
- `baseBranch`: `master`

### 2. PKP Agent Creates Branch and Makes First Commit

```bash
# In the repository
git checkout -b feature/pkp-playwright-tests
# ... make changes ...
git add .
git commit -m "feat: Add Playwright test structure"

# Record commit (get hash from git log)
node scripts/pkp-task-manager.js record-commit 1 $(git rev-parse HEAD)
```

### 3. PKP Agent Makes Additional Commits

```bash
# ... more changes ...
git commit -m "feat: Add job submission test"
node scripts/pkp-task-manager.js record-commit 1 $(git rev-parse HEAD)

# ... more changes ...
git commit -m "feat: Add payment test"
node scripts/pkp-task-manager.js record-commit 1 $(git rev-parse HEAD)
```

### 4. Check Progress

```bash
$ node scripts/pkp-task-manager.js git-status 1

📊 Git Status for Task #1
  Total Commits: 3
  Recent Commits:
    1. abc123 - Add Playwright test structure
    2. def456 - Add job submission test
    3. ghi789 - Add payment test
```

### 5. Create Pull Request

```bash
# Push to GitHub
git push origin feature/pkp-playwright-tests

# Create PR on GitHub, then record it
node scripts/pkp-task-manager.js set-pr 1 https://github.com/jasonsprouse/y8-app/pull/42
```

### 6. Mark Complete

```bash
# After PR is merged
node scripts/pkp-task-manager.js complete 1
```

---

## 📊 Tracking PKP Work

### View All Work on a Specific Branch

```bash
node scripts/pkp-task-manager.js list-by-branch feature/pkp-security-scanning
```

### View All Tasks with Git Context

Via API:
```bash
curl http://localhost:3000/npe/pkp/tasks/with-git-context | jq
```

---

## 🎯 Use Cases

### 1. Automated Git Workflow

PKP agents can:
- Create feature branches automatically
- Commit their work incrementally
- Track all changes made
- Create PRs when ready

### 2. Work Audit Trail

Track exactly what a PKP did:
- See every commit made
- Review commit history
- Link work to PRs
- Measure productivity (commits/hour)

### 3. Multi-Repository Coordination

For tasks spanning both repos (repository: "both"):
- Track work in y8-app on one branch
- Track work in the-beach on another branch
- Coordinate PR creation across repos

### 4. Resume Interrupted Work

If a PKP task is blocked or paused:
- Know exact commit where it stopped
- Resume from `currentCommit`
- Continue on same branch

---

## 🚀 Advanced Scenarios

### Scenario 1: PKP Working on Multiple Branches

```bash
# Task 1: Working on y8-app
node scripts/pkp-task-manager.js set-branch 1 feature/y8-tests master

# Task 2: Working on the-beach
node scripts/pkp-task-manager.js set-branch 2 feature/beach-tests product/lit-compute-network
```

### Scenario 2: Target Commit for Catch-Up Work

```bash
# Set a target commit to reach
curl -X POST http://localhost:3000/npe/pkp/tasks/1/git-context \
  -H "Content-Type: application/json" \
  -d '{
    "targetCommit": "abc123def456"
  }'
```

### Scenario 3: Automated Commit Recording

Integrate with Git hooks:

```bash
# .git/hooks/post-commit
#!/bin/bash
COMMIT_HASH=$(git rev-parse HEAD)
TASK_ID=1  # Or detect from branch name

curl -X POST http://localhost:3000/npe/pkp/tasks/$TASK_ID/commit \
  -H "Content-Type: application/json" \
  -d "{\"commitHash\": \"$COMMIT_HASH\"}"
```

---

## 🔍 Monitoring & Reporting

### Generate Work Report

```bash
# Get all tasks with commits
curl http://localhost:3000/npe/pkp/tasks/with-git-context | jq '.data[] | {
  id,
  title,
  branch: .gitContext.branch,
  commits: (.gitContext.commits | length),
  pr: .gitContext.pullRequestUrl
}'
```

### Check PKP Productivity

```typescript
const task = await getTask(1);
const commitCount = task.gitContext.commits.length;
const hours = task.actualHours || task.estimatedHours;
const commitsPerHour = commitCount / hours;

console.log(`PKP made ${commitCount} commits in ${hours}h (${commitsPerHour} commits/hour)`);
```

---

## ✅ Summary

Git Context Management enables:

✅ **Branch Tracking** - Know what branch each PKP is working on  
✅ **Commit History** - Track every commit made by a PKP  
✅ **PR Integration** - Link completed work to Pull Requests  
✅ **Work Audit** - Complete history of PKP contributions  
✅ **Resume Capability** - Pick up where a PKP left off  
✅ **Multi-Repo Support** - Coordinate work across repositories  

**Your PKP agents are now Git-aware!** 🎉
