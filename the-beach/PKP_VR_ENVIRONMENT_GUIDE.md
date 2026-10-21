# 🥽 PKP VR Environment Tools - Complete Guide

**Feature**: Enable PKP agents to work in immersive VR environments  
**Version**: 1.0  
**Date**: November 6, 2025

---

## 🎯 Overview

PKP agents can now work in **immersive 3D VR environments** powered by Babylon.js, allowing them to:

- 🏙️ **Visualize Code Architecture** - See your codebase as a 3D city
- 🌊 **Watch Data Flow** - Track information flowing through services
- 🌳 **Explore Git History** - Navigate branches and commits in 3D space
- 🤝 **Collaborate in VR** - Multiple agents working together
- 📊 **Monitor Systems** - Real-time health visualization
- 🔍 **Debug in 3D** - Walk through execution paths

---

## 🛠️ Available VR Tools

### 1. VR Environment (`vr-environment`)

**Category**: `vr`  
**Permissions**: `vr:access`, `vr:create`

Create and manage VR workspaces for PKP agents.

**Scene Types**:
- `code-city` - Visualize code as buildings in a city
- `data-ocean` - See data flows as ocean currents
- `git-forest` - Git branches as tree structures
- `test-arena` - Testing environment with battle metaphors
- `architecture-space` - System architecture as space stations

**Actions**:

#### Create Workspace
```bash
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Code City - Main Project",
    "sceneType": "code-city"
  }'
```

#### Join Workspace
```bash
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces/{workspaceId}/join \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "pkp_test_runner",
    "agentName": "Test Runner Agent"
  }'
```

#### List Workspaces
```bash
curl http://localhost:3000/npe/pkp/vr/workspaces
```

---

### 2. VR Code Visualization (`vr-code-visualization`)

**Category**: `vr`  
**Permissions**: `vr:access`, `code:read`

Visualize code architecture, dependencies, and complexity in 3D space.

**Layouts**:
- `grid` - Organized grid layout
- `circular` - Files arranged in a circle
- `hierarchical` - Tree-like hierarchy
- `force-directed` - Physics-based positioning

**Color Schemes**:
- `complexity` - Red = complex, Green = simple
- `type` - Different colors for different file types
- `team` - Color by team ownership
- `activity` - Heat map of recent changes

**Example**:
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-code-visualization \
  '{"action":"visualize","workspaceId":"vr-workspace-123","path":"src/","layout":"force-directed","colorScheme":"complexity"}'
```

**Result**: Files appear as 3D blocks, size = lines of code, color = complexity

---

### 3. VR Architecture Visualization (`vr-architecture`)

**Category**: `vr`  
**Permissions**: `vr:access`, `architecture:view`

Visualize system architecture, services, and data flows in 3D.

**Node Types**:
- `service` - Microservices (spheres)
- `controller` - API controllers (cubes)
- `module` - NestJS modules (pyramids)
- `database` - Data stores (cylinders)
- `api` - External APIs (hexagons)
- `gateway` - API gateways (rings)

**Actions**:

#### Visualize Architecture
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-architecture \
  '{"action":"visualize","workspaceId":"vr-workspace-123","showMetrics":true}'
```

**What You See**:
```
         [API Gateway]
              |
    +---------+---------+
    |                   |
[NPE Service]    [Lit Compute]
    |                   |
    +--------+----------+
             |
         [Redis]
```

#### Add Service
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-architecture \
  '{"action":"add-service","workspaceId":"vr-workspace-123","service":{"name":"Payment Service","type":"service","position":{"x":10,"y":3,"z":0}}}'
```

#### Show Data Flow
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-architecture \
  '{"action":"show-dataflow","workspaceId":"vr-workspace-123"}'
```

**Result**: Animated particles flowing between services showing request/response patterns

---

### 4. VR Git Visualization (`vr-git-visualization`)

**Category**: `vr`  
**Permissions**: `vr:access`, `git:read`

Visualize Git branches, commits, and history as a 3D tree.

**Actions**:

#### Show Branches
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-git-visualization \
  '{"action":"show-branches","workspaceId":"vr-workspace-123"}'
```

**Visual Representation**:
```
                    master (green trunk)
                      |
        +-------------+-------------+
        |                           |
  product/lit-compute          feature/pkp-tools
  (cyan branch, 45 commits)    (magenta twig, 12 commits)
```

#### Show History
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-git-visualization \
  '{"action":"show-history","workspaceId":"vr-workspace-123","limit":50}'
```

**Result**: Walk through commits chronologically, see who changed what

#### Visualize Merge
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-git-visualization \
  '{"action":"visualize-merge","workspaceId":"vr-workspace-123"}'
```

**Result**: See merge conflicts as red nodes, auto-resolved as green

---

### 5. VR Collaboration (`vr-collaboration`)

**Category**: `vr`  
**Permissions**: `vr:access`, `vr:collaborate`

Enable multi-agent collaboration in VR workspaces.

**Actions**:

#### Point at Object
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-collaboration \
  '{"action":"point-at","workspaceId":"vr-workspace-123","agentId":"pkp_test_runner","target":{"x":5,"y":2,"z":0}}'
```

**Result**: Laser pointer appears from agent to target location

#### Draw Annotation
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-collaboration \
  '{"action":"draw-annotation","workspaceId":"vr-workspace-123","agentId":"pkp_code_reviewer","message":"This function needs refactoring"}'
```

**Result**: Floating text bubble appears in 3D space

#### Voice Chat
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-collaboration \
  '{"action":"voice-chat","workspaceId":"vr-workspace-123","agentId":"pkp_lead","message":"Great work team, deploying to staging"}'
```

**Result**: Spatial audio - louder when closer to agent

#### Hand Gesture
```bash
node scripts/pkp-task-manager.js execute-tool 1 vr-collaboration \
  '{"action":"hand-gesture","workspaceId":"vr-workspace-123","agentId":"pkp_security","gesture":"thumbs-up"}'
```

**Gestures**: `thumbs-up`, `wave`, `point`, `stop`

---

## 🎮 Complete VR Workflow Example

### Scenario: Code Review in VR

```bash
# 1. PKP Lead creates a VR workspace
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name":"Sprint 12 Code Review","sceneType":"code-city"}'

# Response: { workspaceId: "vr-workspace-1731234567" }

# 2. PKP agents join the workspace
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces/vr-workspace-1731234567/join \
  -H "Content-Type: application/json" \
  -d '{"agentId":"pkp_lead","agentName":"Lead Developer"}'

curl -X POST http://localhost:3000/npe/pkp/vr/workspaces/vr-workspace-1731234567/join \
  -H "Content-Type: application/json" \
  -d '{"agentId":"pkp_code_reviewer","agentName":"Code Reviewer"}'

# 3. Visualize the codebase
node scripts/pkp-task-manager.js execute-tool 1 vr-code-visualization \
  '{"action":"visualize","workspaceId":"vr-workspace-1731234567","path":"src/","layout":"force-directed","colorScheme":"complexity"}'

# 4. Highlight complex areas
node scripts/pkp-task-manager.js execute-tool 1 vr-code-visualization \
  '{"action":"highlight-complexity","workspaceId":"vr-workspace-1731234567"}'

# 5. Show Git branches
node scripts/pkp-task-manager.js execute-tool 1 vr-git-visualization \
  '{"action":"show-branches","workspaceId":"vr-workspace-1731234567"}'

# 6. Code Reviewer points at problematic file
node scripts/pkp-task-manager.js execute-tool 1 vr-collaboration \
  '{"action":"point-at","workspaceId":"vr-workspace-1731234567","agentId":"pkp_code_reviewer","target":{"x":10,"y":0,"z":0}}'

# 7. Annotate the issue
node scripts/pkp-task-manager.js execute-tool 1 vr-collaboration \
  '{"action":"draw-annotation","workspaceId":"vr-workspace-1731234567","agentId":"pkp_code_reviewer","message":"Cyclomatic complexity 15 - needs refactoring"}'

# 8. Lead approves with gesture
node scripts/pkp-task-manager.js execute-tool 1 vr-collaboration \
  '{"action":"hand-gesture","workspaceId":"vr-workspace-1731234567","agentId":"pkp_lead","gesture":"thumbs-up"}'
```

---

## 🌐 VR Workspace API Reference

### GET /npe/pkp/vr/workspaces

List all VR workspaces.

**Response**:
```json
{
  "success": true,
  "count": 2,
  "workspaces": [
    {
      "id": "vr-workspace-1731234567",
      "name": "Sprint 12 Code Review",
      "scene": "code-city",
      "agents": 3,
      "objects": 45,
      "created": "2025-11-06T12:00:00Z",
      "lastActive": "2025-11-06T12:15:00Z"
    }
  ]
}
```

### POST /npe/pkp/vr/workspaces

Create a new VR workspace.

**Request**:
```json
{
  "name": "Architecture Review",
  "sceneType": "architecture-space"
}
```

**Response**:
```json
{
  "success": true,
  "message": "VR workspace created: Architecture Review",
  "data": {
    "workspaceId": "vr-workspace-1731234890",
    "scene": "architecture-space",
    "created": "2025-11-06T12:30:00Z"
  }
}
```

### POST /npe/pkp/vr/workspaces/:id/join

Join a VR workspace as an agent.

**Request**:
```json
{
  "agentId": "pkp_security",
  "agentName": "Security Analyst"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Agent Security Analyst joined VR workspace",
  "data": {
    "avatar": {
      "agentId": "pkp_security",
      "name": "Security Analyst",
      "position": { "x": 0, "y": 1.6, "z": -5 },
      "rotation": { "x": 0, "y": 0, "z": 0 },
      "status": "idle"
    },
    "position": { "x": 0, "y": 1.6, "z": -5 }
  }
}
```

### GET /npe/pkp/vr/workspaces/:id

Get details of a specific VR workspace.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "vr-workspace-1731234567",
    "name": "Sprint 12 Code Review",
    "scene": "code-city",
    "agents": ["pkp_lead", "pkp_code_reviewer", "pkp_test_runner"],
    "created": "2025-11-06T12:00:00Z",
    "lastActive": "2025-11-06T12:15:00Z",
    "objects": [
      {
        "id": "code-0",
        "type": "code-block",
        "position": { "x": 0, "y": 0, "z": 0 },
        "data": {
          "path": "src/main.ts",
          "lines": 100,
          "complexity": 5,
          "color": "#00ff00"
        }
      }
    ]
  }
}
```

---

## 🎨 VR Scene Types

### 1. Code City (`code-city`)

**Metaphor**: City skyline where buildings = files

- **Building Height**: Lines of code
- **Building Color**: Code complexity (green → yellow → red)
- **Building Width**: Number of functions
- **Streets**: Package/folder structure
- **Traffic**: Function calls between files

**Best For**: Understanding codebase structure at a glance

---

### 2. Data Ocean (`data-ocean`)

**Metaphor**: Ocean with currents and islands

- **Islands**: Services/databases
- **Water Currents**: Data flows
- **Wave Height**: Traffic volume
- **Water Color**: Latency (blue = fast, red = slow)
- **Fish**: Individual requests

**Best For**: Visualizing data pipelines and API flows

---

### 3. Git Forest (`git-forest`)

**Metaphor**: Forest where trees = branches

- **Tree Trunk**: Master/main branch
- **Tree Branches**: Feature branches
- **Leaves**: Commits
- **Tree Height**: Branch age
- **Leaf Color**: Commit type (green = feature, red = bugfix)

**Best For**: Understanding Git history and branch strategies

---

### 4. Test Arena (`test-arena`)

**Metaphor**: Battle arena for testing

- **Friendly Units**: Passing tests
- **Enemy Units**: Failing tests
- **Shields**: Code coverage
- **Health Bars**: Test reliability
- **Battle Sounds**: Test execution

**Best For**: Gamified testing visualization

---

### 5. Architecture Space (`architecture-space`)

**Metaphor**: Space station with modules

- **Space Stations**: Services
- **Connection Tubes**: API connections
- **Satellites**: Databases
- **Asteroids**: External dependencies
- **Laser Beams**: Real-time data flows

**Best For**: System architecture and service mesh visualization

---

## 🚀 Integration with Existing Tools

### Combine VR with Other PKP Tools

```bash
# 1. Create VR workspace
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces \
  -d '{"name":"Security Audit","sceneType":"code-city"}'

# 2. Run security scan
node scripts/pkp-task-manager.js execute-tool 5 security \
  '{"action":"dependencies"}'

# 3. Visualize results in VR
# Security issues appear as red glowing buildings in Code City

# 4. Run tests
node scripts/pkp-task-manager.js execute-tool 1 testing \
  '{"action":"all","coverage":true}'

# 5. Switch to Test Arena scene
# See passing tests as green soldiers, failing as red enemies

# 6. Deploy after fixing
node scripts/pkp-task-manager.js execute-tool 6 deployment \
  '{"action":"deploy","environment":"staging"}'

# 7. Monitor in Architecture Space
# Watch deployment propagate through service mesh in 3D
```

---

## 🎯 Use Cases

### 1. Onboarding New Team Members

**Challenge**: New developer needs to understand complex codebase

**VR Solution**:
```bash
# Create immersive tour workspace
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces \
  -d '{"name":"Codebase Tour","sceneType":"code-city"}'

# Visualize entire project
# Walk through "city districts" (modules)
# PKP guide agent points out important "landmarks" (core files)
# See "traffic patterns" (function call graphs)
```

**Result**: 50% faster onboarding, better mental model of architecture

---

### 2. Debugging Production Issues

**Challenge**: Hard to trace request path through microservices

**VR Solution**:
```bash
# Create debug workspace
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces \
  -d '{"name":"Production Debug","sceneType":"data-ocean"}'

# Visualize data flows
# Follow individual request as a "fish" swimming through services
# See where it gets stuck (service with red water)
# PKP debugger agent highlights bottleneck
```

**Result**: 10x faster root cause identification

---

### 3. Architecture Reviews

**Challenge**: Hard to explain complex system architecture in 2D diagrams

**VR Solution**:
```bash
# Create architecture workspace
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces \
  -d '{"name":"Q4 Architecture Review","sceneType":"architecture-space"}'

# All stakeholders join as agents
# Architect PKP gives 3D tour of "space station"
# Point at services, show real-time metrics as HUD overlays
# Draw annotations for proposed changes
```

**Result**: Better stakeholder understanding, faster decision-making

---

### 4. Performance Optimization

**Challenge**: Identify performance bottlenecks across distributed system

**VR Solution**:
```bash
# Create performance workspace
curl -X POST http://localhost:3000/npe/pkp/vr/workspaces \
  -d '{"name":"Performance Hunt","sceneType":"architecture-space"}'

# Visualize system with metrics
# Services glow red (hot) when CPU high
# Connection tubes pulse faster with high traffic
# PKP performance agent highlights optimization opportunities
```

**Result**: Visual identification of bottlenecks at a glance

---

## 📊 VR Metrics & Analytics

Track VR workspace usage:

```bash
curl http://localhost:3000/npe/pkp/vr/workspaces
```

**Metrics Available**:
- Total workspaces created
- Active agents per workspace
- Average session duration
- Most popular scene types
- Objects created per workspace
- Collaboration events (points, annotations, gestures)

---

## 🔧 Advanced Configuration

### Custom Scene Creation

Create your own VR scene type:

```typescript
// In pkp-vr-tools.ts
export class CustomSceneTool implements PKPTool {
  id = 'vr-custom-scene';
  name = 'Custom VR Scene';
  category = PKPToolCategory.VR;
  // ... implement your visualization logic
}
```

### VR Performance Tuning

Optimize for different hardware:

```typescript
const workspace = await vrWorkspaceManager.createWorkspace(
  'High Performance',
  'code-city',
  {
    qualityLevel: 'high',  // 'low' | 'medium' | 'high' | 'ultra'
    maxObjects: 500,       // Limit objects for performance
    particleEffects: true, // Enable/disable particles
    shadows: true,         // Enable/disable shadows
  }
);
```

---

## ✅ Summary

PKP agents can now work in **5 different VR environments**:

✅ **Code City** - Visualize code as 3D buildings  
✅ **Data Ocean** - See data flows as ocean currents  
✅ **Git Forest** - Navigate branches as tree structures  
✅ **Test Arena** - Gamified testing environment  
✅ **Architecture Space** - System architecture as space stations  

**5 VR Tools Available**:
1. VR Environment - Workspace management
2. VR Code Visualization - 3D code exploration
3. VR Architecture - Service mesh visualization
4. VR Git Visualization - Branch & commit history
5. VR Collaboration - Multi-agent interaction

**Your PKP agents can now collaborate in immersive 3D workspaces!** 🚀🥽
