# PKP VR Workspace - Babylon.js Integration Guide 🥽

## Overview

The PKP VR Workspace is a **full Babylon.js 3D immersive environment** where PKP agents can work together in VR with actual WebXR headset support. This follows the `BabylonXRScene` pattern from the dev branch and provides real 3D visualization of code, architecture, and Git workflows.

---

## 🎮 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PKP VR Workspace Stack                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Babylon.js)                                       │
│  ├── pkp-vr-workspace.html     → HTML5 viewer               │
│  ├── pkp-vr-workspace.js       → Babylon.js scene class     │
│  └── Babylon.js 8.34.0         → 3D rendering engine        │
│                                                               │
│  Backend (NestJS)                                            │
│  ├── XrController              → Serves VR workspace HTML    │
│  ├── PKPController             → VR workspace API            │
│  └── pkp-vr-tools.ts          → VR tool implementations     │
│                                                               │
│  VR Support                                                  │
│  ├── WebXR API                 → VR headset integration     │
│  ├── createDefaultXRExperienceAsync() → Standard setup      │
│  └── immersive-vr mode         → Full VR immersion          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Scene Types

### 1. Code City 🏙️
**Visualization**: Source code as a 3D cityscape
- **Buildings** = Code files (height = lines of code)
- **Colors** = Complexity (green=simple, yellow=medium, red=complex)
- **Grid Layout** = File system hierarchy
- **Interactive**: Click buildings to view file details
- **Glow Effects**: Highlights important files

### 2. Architecture Space 🚀
**Visualization**: Microservices as space stations
- **Spheres** = Services (color = health status)
- **Rotating Rings** = Active connections
- **Central Hub** = API gateway/coordinator
- **Starfield Background** = Cosmic deployment view
- **Pulsing Animation** = Service activity level

### 3. Git Forest 🌳
**Visualization**: Git branches as trees
- **Tree Height** = Number of commits
- **Foliage Color** = Active (green) vs stale (gray)
- **Trunk** = Branch history
- **Forest Ground** = Repository base
- **Interactive**: Click trees to explore branches

### 4. Data Ocean 🌊
**Visualization**: Data flows as ocean currents
- **Animated Waves** = Real-time data movement
- **Particles** = Data packets flowing
- **Ocean Surface** = Data layer
- **Blue Gradient** = Data depth

### 5. Test Arena ⚔️
**Visualization**: Test suites as battle arena
- **Cylinders** = Test suites (height = passing tests)
- **Colors** = Status (green=pass, yellow=warning, red=fail)
- **Arena Floor** = Test environment
- **Arena Walls** = Testing boundary

---

## 🚀 Quick Start

### Option 1: Direct Browser Access

```bash
# Start the server
npm run start:dev

# Open in browser
http://localhost:3000/xr/pkp-workspace
```

### Option 2: API Launch

```bash
# Create and launch VR workspace
curl -X POST http://localhost:3000/npe/pkp/vr/launch \
  -H "Content-Type: application/json" \
  -d '{
    "sceneType": "code-city",
    "agentId": "pkp-lead"
  }'

# Response includes viewer URL:
{
  "success": true,
  "workspaceId": "vr-1234567890",
  "viewerUrl": "/npe/pkp/vr/viewer?workspace=vr-1234567890&scene=code-city"
}
```

### Option 3: Programmatic Launch

```typescript
// From your application
const response = await fetch('http://localhost:3000/npe/pkp/vr/launch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sceneType: 'architecture-space',
    agentId: 'pkp-dev'
  })
});

const { viewerUrl } = await response.json();
window.open(viewerUrl, '_blank');
```

---

## 🥽 VR Headset Support

### Compatible Devices
- **Meta Quest 2/3/Pro** ✅
- **HTC Vive/Pro** ✅
- **Valve Index** ✅
- **Windows Mixed Reality** ✅
- **PlayStation VR2** (experimental)

### Entering VR Mode

**Method 1: UI Button**
```
Click "Enter VR Mode" button in the UI panel
```

**Method 2: Programmatic**
```javascript
window.pkpWorkspace.enterVRMode();
```

**Method 3: Browser Prompt**
- Chrome/Edge will show VR icon in address bar when headset detected
- Click icon to enter immersive mode

### VR Controls

| Action | Controller Input | Desktop Fallback |
|--------|-----------------|------------------|
| Move | Thumbstick/Trackpad | WASD keys |
| Teleport | Point + Trigger | Right-click |
| Select Object | Point + Trigger | Left-click |
| Switch Scene | Menu button | UI button |
| Exit VR | Back/Menu hold | ESC key |

---

## 🎨 Scene Class Architecture

Following the `BabylonXRScene` pattern from dev branch:

```javascript
class PKPVRWorkspace {
  constructor(canvas, workspaceData) {
    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.xr = null;
    this.agentAvatars = new Map();
    this.codeObjects = new Map();
  }

  async init() {
    // 1. Create Babylon.js engine
    this.engine = new BABYLON.Engine(canvas, true, {...});
    
    // 2. Create scene
    this.scene = new BABYLON.Scene(this.engine);
    
    // 3. Create camera
    this.createCamera();
    
    // 4. Create environment (scene-specific)
    await this.createEnvironment();
    
    // 5. Setup lighting
    this.setupLighting();
    
    // 6. Initialize WebXR
    await this.initializeXR();
    
    // 7. Create agent avatars
    this.createAgentAvatars();
    
    // 8. Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async initializeXR() {
    this.xr = await this.scene.createDefaultXRExperienceAsync({
      floorMeshes: [this.ground],
      disableTeleportation: false,
      disablePointerSelection: false
    });
  }
}
```

---

## 🤖 PKP Agent Avatars

### Avatar Rendering
```javascript
// Agents appear as floating spheres with labels
createAgentAvatar(agent, index) {
  const avatar = BABYLON.MeshBuilder.CreateSphere(agent.id, {
    diameter: 1,
    segments: 16
  }, this.scene);
  
  // Color based on status
  if (agent.status === 'working') {
    material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0); // Blue
    material.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.5);
  } else {
    material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Gray
  }
  
  // Floating animation
  this.scene.registerBeforeRender(() => {
    avatar.position.y = Math.sin(Date.now() / 1000) * 0.5 + 1.5;
  });
}
```

### Agent States
- **Working** 🔵 Blue with glow, floating animation
- **Idle** ⚪ Gray, static position
- **Error** 🔴 Red with pulsing effect

---

## 📡 API Reference

### VR Workspace Endpoints

#### List Workspaces
```bash
GET /npe/pkp/vr/workspaces

Response:
{
  "success": true,
  "count": 2,
  "workspaces": [
    {
      "id": "vr-1234",
      "name": "The Beach Development",
      "scene": "code-city",
      "agents": 2,
      "objects": 15,
      "created": "2024-01-15T10:00:00Z",
      "lastActive": "2024-01-15T14:30:00Z"
    }
  ]
}
```

#### Create Workspace
```bash
POST /npe/pkp/vr/workspaces

Body:
{
  "name": "Architecture Review",
  "sceneType": "architecture-space"
}

Response:
{
  "success": true,
  "message": "VR workspace created",
  "data": {
    "id": "vr-5678",
    "name": "Architecture Review",
    "scene": "architecture-space"
  }
}
```

#### Join Workspace
```bash
POST /npe/pkp/vr/workspaces/:id/join

Body:
{
  "agentId": "pkp-lead",
  "agentName": "PKP Lead Agent"
}

Response:
{
  "success": true,
  "message": "Joined VR workspace",
  "data": {
    "avatar": {
      "id": "pkp-lead",
      "position": [0, 1.6, -10],
      "color": "#2080ff"
    }
  }
}
```

#### Get Workspace Details
```bash
GET /npe/pkp/vr/workspaces/:id

Response:
{
  "success": true,
  "data": {
    "id": "vr-5678",
    "name": "Architecture Review",
    "scene": "architecture-space",
    "agents": [...],
    "objects": [...]
  }
}
```

#### Launch Workspace (Combined Create + View)
```bash
POST /npe/pkp/vr/launch

Body:
{
  "sceneType": "git-forest",
  "agentId": "pkp-dev"
}

Response:
{
  "success": true,
  "workspaceId": "vr-9012",
  "workspace": {...},
  "viewerUrl": "/npe/pkp/vr/viewer?workspace=vr-9012&scene=git-forest"
}
```

---

## 🛠️ Technical Implementation

### Babylon.js Features Used

| Feature | Purpose | Implementation |
|---------|---------|----------------|
| `Engine` | Main render engine | `new BABYLON.Engine(canvas, true, {...})` |
| `Scene` | 3D scene container | `new BABYLON.Scene(engine)` |
| `UniversalCamera` | First-person camera | Position at (0, 1.6, -10) |
| `WebXR` | VR headset support | `createDefaultXRExperienceAsync()` |
| `MeshBuilder` | Create 3D shapes | Boxes, spheres, cylinders, grounds |
| `Materials` | Object appearance | Standard, PBR, Grid materials |
| `Lighting` | Scene illumination | Hemispheric + Directional + Shadows |
| `GlowLayer` | Highlight effects | Code complexity highlighting |
| `HighlightLayer` | Selection | Object selection feedback |
| `ParticleSystem` | Data flows | Ocean currents, data streams |
| `ActionManager` | Interactions | Click handlers on objects |
| `GUI` | Text overlays | Floating labels above objects |
| `Physics` | Collisions | Cannon.js integration |

### Scene Lifecycle

```javascript
┌─────────────┐
│ constructor │  Create properties
└──────┬──────┘
       │
       v
┌─────────────┐
│    init()   │  Setup engine & scene
└──────┬──────┘
       │
       v
┌─────────────┐
│ createCamera│  Position camera
└──────┬──────┘
       │
       v
┌─────────────┐
│createEnvironment│  Build scene objects
└──────┬──────┘
       │
       v
┌─────────────┐
│setupLighting│  Add lights
└──────┬──────┘
       │
       v
┌─────────────┐
│initializeXR │  Enable WebXR
└──────┬──────┘
       │
       v
┌─────────────┐
│createAgents │  Spawn avatars
└──────┬──────┘
       │
       v
┌─────────────┐
│render loop  │  Continuous rendering
└─────────────┘
```

---

## 🎯 Use Cases

### 1. Code Review in VR
```javascript
// Launch code city for review
const workspace = await createVRWorkspace({
  sceneType: 'code-city',
  agentId: 'pkp-reviewer'
});

// Walk through codebase as 3D city
// - Tall buildings = large files needing refactoring
// - Red buildings = high complexity
// - Click buildings to see file contents
```

### 2. Architecture Planning
```javascript
// Launch architecture space
const workspace = await createVRWorkspace({
  sceneType: 'architecture-space',
  agentId: 'pkp-architect'
});

// View services as space stations
// - Healthy services = green glow
// - Services with issues = red warning
// - Rotating rings show active connections
```

### 3. Git Branch Visualization
```javascript
// Launch git forest
const workspace = await createVRWorkspace({
  sceneType: 'git-forest',
  agentId: 'pkp-git-manager'
});

// Explore branches as trees
// - Tall trees = many commits
// - Green trees = active development
// - Gray trees = stale branches
```

### 4. Multi-Agent Collaboration
```javascript
// Multiple PKPs join same workspace
await joinVRWorkspace('vr-1234', {
  agentId: 'pkp-lead',
  agentName: 'Lead Developer'
});

await joinVRWorkspace('vr-1234', {
  agentId: 'pkp-security',
  agentName: 'Security Auditor'
});

// Both agents appear as avatars
// Point at objects together
// Discuss code in VR space
```

---

## 🔧 Customization

### Add New Scene Type

```javascript
// In pkp-vr-workspace.js

async createMyCustomEnvironment() {
  console.log('🎨 Creating custom environment...');
  
  // 1. Create ground
  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    width: 100,
    height: 100
  }, this.scene);
  
  // 2. Add your 3D objects
  const myObject = BABYLON.MeshBuilder.CreateSphere('myObject', {
    diameter: 5
  }, this.scene);
  
  // 3. Apply materials
  const material = new BABYLON.StandardMaterial('mat', this.scene);
  material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
  myObject.material = material;
  
  // 4. Make interactive
  myObject.actionManager = new BABYLON.ActionManager(this.scene);
  myObject.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      () => console.log('Clicked!')
    )
  );
  
  this.ground = ground;
}

// Add to createEnvironment() switch statement
async createEnvironment() {
  switch (this.currentSceneType) {
    // ... existing cases
    case 'my-custom-scene':
      await this.createMyCustomEnvironment();
      break;
  }
}
```

### Modify Agent Avatars

```javascript
// Custom avatar shape
createAgentAvatar(agent, index) {
  // Use torus instead of sphere
  const avatar = BABYLON.MeshBuilder.CreateTorus(agent.id, {
    diameter: 1.5,
    thickness: 0.3
  }, this.scene);
  
  // Add particles
  const particles = new BABYLON.ParticleSystem('particles', 200, this.scene);
  particles.emitter = avatar;
  particles.start();
  
  // ... rest of implementation
}
```

---

## 📊 Performance

### Optimization Techniques

1. **Object Pooling**: Reuse meshes when switching scenes
2. **LOD (Level of Detail)**: Simplify distant objects
3. **Occlusion Culling**: Don't render hidden objects
4. **Texture Atlasing**: Combine textures to reduce draw calls
5. **Shadow Map Size**: Balance quality vs performance (1024x1024)

### Performance Targets
- **FPS**: 60+ (desktop), 72+ (VR headset)
- **Objects**: Up to 1000 interactive objects
- **Agents**: Up to 50 concurrent avatars
- **Latency**: < 20ms for VR headset tracking

### Monitoring
```javascript
// Stats are auto-updated in UI
updateStats() {
  this.fps = Math.round(this.engine.getFps());
  document.getElementById('fps').textContent = this.fps;
  document.getElementById('object-count').textContent = this.objectCount;
  document.getElementById('agent-count').textContent = this.agentAvatars.size;
}
```

---

## 🐛 Troubleshooting

### WebXR Not Available
```
⚠️ WebXR not supported on this device
```
**Solution**: Use Chrome/Edge on desktop or compatible VR headset

### VR Headset Not Detected
```
❌ Could not enter VR mode: No VR devices found
```
**Solution**: 
1. Ensure headset is connected and turned on
2. Enable WebXR in browser flags: `chrome://flags/#webxr`
3. Grant camera/sensor permissions

### Low FPS in VR
**Solution**:
1. Reduce shadow map quality
2. Decrease object count
3. Simplify materials (use Standard instead of PBR)
4. Enable GPU acceleration in browser

### Objects Not Clickable
**Solution**:
```javascript
// Ensure ActionManager is created
mesh.actionManager = new BABYLON.ActionManager(this.scene);
mesh.actionManager.registerAction(
  new BABYLON.ExecuteCodeAction(
    BABYLON.ActionManager.OnPickTrigger,
    () => { /* your handler */ }
  )
);
```

---

## 🚀 Deployment

### Vercel (Serverless)
```json
// vercel.json (already configured)
{
  "rewrites": [
    { "source": "/xr/pkp-workspace", "destination": "/api/index" }
  ]
}
```

### Environment Variables
```bash
# .env
PORT=3000
NODE_ENV=production
PUBLIC_URL=https://yourapp.vercel.app
```

### Build for Production
```bash
npm run build
npm run start:prod
```

---

## 📚 References

- **Babylon.js Docs**: https://doc.babylonjs.com/
- **WebXR Spec**: https://immersive-web.github.io/webxr/
- **Dev Branch**: https://github.com/jasonsprouse/the-beach/tree/dev
- **BabylonXRScene**: `public/js/xr-scene.js`
- **LitComputeVRScene**: `src/scenes/LitComputeVRScene.ts`

---

## 🎉 Summary

You now have a **complete Babylon.js VR workspace** where PKP agents can:

✅ Work in immersive 3D environments  
✅ Use real VR headsets (Meta Quest, HTC Vive, etc.)  
✅ Visualize code as 3D cities  
✅ See architecture as space stations  
✅ Explore Git branches as forests  
✅ Collaborate with multiple agents  
✅ Switch between 5 different scene types  
✅ Interact with objects via click/point  

**Access it now**: http://localhost:3000/xr/pkp-workspace 🥽

**Try with VR headset**: Click "Enter VR Mode" button when headset is connected! 🎮
