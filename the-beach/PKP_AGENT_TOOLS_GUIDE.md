# PKP AI Agent Tools Repository

**Feature**: Comprehensive toolset for PKP agents to perform automated work  
**Version**: 1.0  
**Date**: November 6, 2025

---

## 🎯 Overview

PKP agents now have access to a comprehensive suite of tools to perform a wide variety of automated tasks across your repositories. The tool system provides:

- **7 Tool Categories** with extensible architecture
- **Execution Tracking** with timing and metadata
- **Permission System** for controlled access
- **CLI Integration** for easy testing
- **API Endpoints** for programmatic access

---

## 🛠️ Available Tools

### 1. Git Operations (`git-operations`)

**Category**: `git`  
**Permissions**: `git:read`, `git:write`

Execute Git commands including cloning, branching, committing, pushing, and PR creation.

**Actions**:
- `clone` - Clone a repository
- `branch` - Create/switch branches
- `commit` - Commit changes
- `push` - Push to remote
- `create-pr` - Create pull request

**Example**:
```bash
# Create a branch
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"branch","branch":"feature/my-feature"}'

# Commit files
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"commit","message":"feat: Add new feature","files":["src/app.ts"]}'

# Push changes
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"push","branch":"feature/my-feature"}'
```

---

### 2. Code Analysis (`code-analysis`)

**Category**: `code_analysis`  
**Permissions**: `code:read`

Analyze code quality, complexity, and patterns.

**Actions**:
- `lint` - Run linting checks
- `complexity` - Analyze code complexity
- `security` - Static security analysis
- `coverage` - Code coverage analysis

**Example**:
```bash
# Run linting
node scripts/pkp-task-manager.js execute-tool 2 code-analysis \
  '{"action":"lint","path":"src"}'

# Check complexity
node scripts/pkp-task-manager.js execute-tool 2 code-analysis \
  '{"action":"complexity","files":["src/app.ts"]}'
```

---

### 3. Testing (`testing`)

**Category**: `testing`  
**Permissions**: `test:execute`

Run various types of tests with coverage reporting.

**Actions**:
- `unit` - Run unit tests
- `integration` - Run integration tests
- `e2e` - Run end-to-end tests
- `all` - Run all tests

**Example**:
```bash
# Run unit tests with coverage
node scripts/pkp-task-manager.js execute-tool 1 testing \
  '{"action":"unit","coverage":true}'

# Run e2e tests
node scripts/pkp-task-manager.js execute-tool 1 testing \
  '{"action":"e2e","path":"tests/e2e"}'

# Run all tests
node scripts/pkp-task-manager.js execute-tool 1 testing \
  '{"action":"all","coverage":true}'
```

**Output**:
```json
{
  "success": true,
  "output": "Tests passed for unit",
  "executionTime": 1250,
  "metadata": {
    "testsRun": 10,
    "testsPassed": 10,
    "testsFailed": 0,
    "coverage": 85
  }
}
```

---

### 4. Security Scanner (`security`)

**Category**: `security`  
**Permissions**: `security:scan`

Scan for vulnerabilities, secrets, and security issues.

**Actions**:
- `dependencies` - Scan dependencies for vulnerabilities
- `secrets` - Detect hardcoded secrets
- `sast` - Static Application Security Testing
- `dast` - Dynamic Application Security Testing

**Example**:
```bash
# Scan dependencies
node scripts/pkp-task-manager.js execute-tool 5 security \
  '{"action":"dependencies","path":"."}'

# Detect secrets
node scripts/pkp-task-manager.js execute-tool 5 security \
  '{"action":"secrets","path":"src"}'
```

**Output**:
```json
{
  "success": true,
  "output": "Security scan complete: dependencies",
  "executionTime": 2300,
  "metadata": {
    "vulnerabilities": {
      "critical": 0,
      "high": 0,
      "medium": 2,
      "low": 5
    }
  }
}
```

---

### 5. Deployment (`deployment`)

**Category**: `deployment`  
**Permissions**: `deploy:execute`

Deploy to various environments with rollback capability.

**Actions**:
- `deploy` - Deploy to environment
- `rollback` - Rollback deployment
- `status` - Check deployment status

**Environments**:
- `development`
- `staging`
- `production`

**Example**:
```bash
# Deploy to staging
node scripts/pkp-task-manager.js execute-tool 6 deployment \
  '{"action":"deploy","environment":"staging","service":"api"}'

# Check deployment status
node scripts/pkp-task-manager.js execute-tool 6 deployment \
  '{"action":"status","environment":"production"}'

# Rollback
node scripts/pkp-task-manager.js execute-tool 6 deployment \
  '{"action":"rollback","environment":"staging"}'
```

---

### 6. Documentation Generator (`documentation`)

**Category**: `documentation`  
**Permissions**: `docs:write`

Generate and update various types of documentation.

**Actions**:
- `generate` - Generate new documentation
- `update` - Update existing docs
- `validate` - Validate documentation

**Types**:
- `api` - API documentation
- `code` - Code documentation
- `readme` - README files
- `guides` - User guides

**Example**:
```bash
# Generate API docs
node scripts/pkp-task-manager.js execute-tool 3 documentation \
  '{"action":"generate","type":"api","output":"docs/api"}'

# Update README
node scripts/pkp-task-manager.js execute-tool 3 documentation \
  '{"action":"update","type":"readme"}'
```

---

### 7. Monitoring (`monitoring`)

**Category**: `monitoring`  
**Permissions**: `monitoring:read`

Monitor application health, metrics, logs, and alerts.

**Actions**:
- `health` - Health check
- `metrics` - Collect metrics
- `logs` - Retrieve logs
- `alerts` - Check alerts

**Example**:
```bash
# Health check
node scripts/pkp-task-manager.js execute-tool 4 monitoring \
  '{"action":"health","service":"api"}'

# Get metrics
node scripts/pkp-task-manager.js execute-tool 4 monitoring \
  '{"action":"metrics","service":"api","timeRange":"1h"}'
```

**Output**:
```json
{
  "success": true,
  "output": "Monitoring health retrieved",
  "executionTime": 450,
  "metadata": {
    "status": "healthy",
    "uptime": "99.9%",
    "responseTime": "150ms"
  }
}
```

---

## 🌐 API Endpoints

### Get All Tools

```http
GET /npe/pkp/tools
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "git-operations",
      "name": "Git Operations",
      "category": "git",
      "description": "Execute Git commands...",
      "requiredPermissions": ["git:read", "git:write"]
    }
  ],
  "count": 7
}
```

### Get Tools by Category

```http
GET /npe/pkp/tools/category/:category
```

**Example**:
```http
GET /npe/pkp/tools/category/testing
```

### Execute Tool

```http
POST /npe/pkp/tasks/:id/execute-tool
Content-Type: application/json

{
  "toolId": "testing",
  "params": {
    "action": "unit",
    "coverage": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Tool executed successfully",
  "data": {
    "success": true,
    "output": "Tests passed for unit",
    "executionTime": 1250,
    "metadata": {
      "testsRun": 10,
      "testsPassed": 10,
      "testsFailed": 0,
      "coverage": 85
    }
  }
}
```

---

## 🖥️ CLI Commands

### List All Tools

```bash
node scripts/pkp-task-manager.js list-tools
```

**Output**:
```
🛠️  Available PKP Tools

📦 GIT
  git-operations - Git Operations
    Execute Git commands (clone, branch, commit, push, PR creation)
    Permissions: git:read, git:write

📦 TESTING
  testing - Testing
    Run tests (unit, integration, e2e)
    Permissions: test:execute

Total: 7 tools available
```

### Execute a Tool

```bash
node scripts/pkp-task-manager.js execute-tool <taskId> <toolId> '<params-json>'
```

**Examples**:
```bash
# Run tests
node scripts/pkp-task-manager.js execute-tool 1 testing '{"action":"unit"}'

# Git commit
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"commit","message":"feat: Add feature","files":["src/app.ts"]}'

# Security scan
node scripts/pkp-task-manager.js execute-tool 5 security \
  '{"action":"dependencies"}'

# Deploy to staging
node scripts/pkp-task-manager.js execute-tool 6 deployment \
  '{"action":"deploy","environment":"staging"}'
```

---

## 🔄 Complete PKP Workflow with Tools

### Example: Task #1 (Playwright Setup)

```bash
# 1. Start the task
node scripts/pkp-task-manager.js assign 1

# 2. Create feature branch (using Git tool)
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"branch","branch":"feature/pkp-playwright-tests"}'

# 3. Record the branch
node scripts/pkp-task-manager.js set-branch 1 feature/pkp-playwright-tests

# 4. PKP writes test files...

# 5. Run linting (using Code Analysis tool)
node scripts/pkp-task-manager.js execute-tool 1 code-analysis \
  '{"action":"lint","path":"tests"}'

# 6. Run tests (using Testing tool)
node scripts/pkp-task-manager.js execute-tool 1 testing \
  '{"action":"e2e","coverage":true}'

# 7. Security scan (using Security tool)
node scripts/pkp-task-manager.js execute-tool 1 security \
  '{"action":"secrets","path":"tests"}'

# 8. Commit changes (using Git tool)
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"commit","message":"feat: Add Playwright tests","files":["tests/"]}'

# 9. Record the commit
node scripts/pkp-task-manager.js record-commit 1 $(git rev-parse HEAD)

# 10. Push to GitHub (using Git tool)
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"push","branch":"feature/pkp-playwright-tests"}'

# 11. Create PR (using Git tool)
node scripts/pkp-task-manager.js execute-tool 1 git-operations \
  '{"action":"create-pr"}'

# 12. Set PR URL
node scripts/pkp-task-manager.js set-pr 1 https://github.com/user/repo/pull/123

# 13. Mark complete
node scripts/pkp-task-manager.js complete 1
```

---

## 🏗️ Tool Architecture

### Tool Interface

```typescript
interface PKPTool {
  id: string;                      // Unique identifier
  name: string;                    // Display name
  category: PKPToolCategory;       // Tool category
  description: string;             // What the tool does
  requiredPermissions: string[];   // Required permissions
  execute: (params: any) => Promise<ToolExecutionResult>;
}
```

### Execution Result

```typescript
interface ToolExecutionResult {
  success: boolean;       // Was execution successful?
  output?: any;           // Primary output
  error?: string;         // Error message if failed
  executionTime?: number; // Execution time in ms
  metadata?: Record<string, any>;  // Additional data
}
```

### Tool Registry

The `PKPToolRegistry` manages all available tools:

```typescript
class PKPToolRegistry {
  register(tool: PKPTool): void
  get(toolId: string): PKPTool | undefined
  getByCategory(category: PKPToolCategory): PKPTool[]
  getAll(): PKPTool[]
  async executeTool(toolId: string, params: any): Promise<ToolExecutionResult>
}
```

---

## 🔌 Extending the Tool System

### Creating a Custom Tool

```typescript
import { PKPTool, PKPToolCategory, ToolExecutionResult } from './pkp-agent-tools';

export class CustomTool implements PKPTool {
  id = 'custom-tool';
  name = 'Custom Tool';
  category = PKPToolCategory.CODE_ANALYSIS;
  description = 'My custom tool';
  requiredPermissions = ['custom:execute'];

  async execute(params: any): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Your custom logic here
      return {
        success: true,
        output: 'Custom tool executed',
        executionTime: Date.now() - startTime,
        metadata: {
          customData: 'value'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      };
    }
  }
}
```

### Registering Custom Tools

```typescript
// In pkp-task-manager.service.ts
constructor() {
  this.toolRegistry = new PKPToolRegistry();
  this.toolRegistry.register(new CustomTool());  // Add custom tool
  this.initializeAgents();
  this.initializeTasks();
}
```

---

## 📊 Tool Usage Tracking

All tool executions are logged:

```
[PKPTaskManagerService] Executing tool testing for task 1 by pkp_test_runner
[PKPTaskManagerService] Tool testing completed successfully in 1250ms
```

View logs:
```bash
tail -f logs/server.log | grep "tool"
```

---

## 🎯 Use Cases

### 1. Automated Testing Pipeline
PKP runs tests at every stage:
```bash
# Lint → Unit Tests → Integration Tests → E2E Tests
execute-tool 1 code-analysis '{"action":"lint"}'
execute-tool 1 testing '{"action":"unit","coverage":true}'
execute-tool 1 testing '{"action":"integration"}'
execute-tool 1 testing '{"action":"e2e"}'
```

### 2. Security-First Development
PKP scans for vulnerabilities before committing:
```bash
execute-tool 5 security '{"action":"dependencies"}'
execute-tool 5 security '{"action":"secrets"}'
execute-tool 5 security '{"action":"sast"}'
```

### 3. Automated Deployment
PKP deploys through all environments:
```bash
execute-tool 6 deployment '{"action":"deploy","environment":"development"}'
# Wait for tests...
execute-tool 6 deployment '{"action":"deploy","environment":"staging"}'
# Wait for approval...
execute-tool 6 deployment '{"action":"deploy","environment":"production"}'
```

### 4. Documentation Maintenance
PKP keeps docs up to date:
```bash
execute-tool 3 documentation '{"action":"generate","type":"api"}'
execute-tool 3 documentation '{"action":"update","type":"readme"}'
execute-tool 3 documentation '{"action":"validate","type":"guides"}'
```

---

## ✅ Summary

The PKP AI Agent Tools repository provides:

✅ **7 Comprehensive Tools** - Git, Testing, Security, Deployment, and more  
✅ **CLI Integration** - Easy testing and execution from terminal  
✅ **API Access** - Programmatic tool execution  
✅ **Execution Tracking** - Timing and metadata for all operations  
✅ **Permission System** - Controlled access to sensitive operations  
✅ **Extensible Architecture** - Easy to add custom tools  
✅ **Production Ready** - Used by active PKP tasks

**Your PKP agents can now perform a full range of automated development tasks!** 🚀
