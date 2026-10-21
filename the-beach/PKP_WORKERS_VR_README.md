# PKP Workers VR Visualization

**Interactive 3D visualization of your sub-PKP agents performing tasks in real-time!**

![PKP Workers VR](https://img.shields.io/badge/VR-Babylon.js-blue) ![Status](https://img.shields.io/badge/status-interactive-green)

## 🎯 Overview

Watch your sub-PKP workers come to life in VR! See them encrypt data, run tests, review code, collect metrics, audit security, and deploy applications - all visualized in an immersive 3D environment.

## 🚀 Quick Start

### Open the VR Scene

```
http://localhost:3000/pkp-workers-vr.html?mainPKP=your-pkp-address
```

### Or from the project:

```bash
npm run start:dev
# Navigate to http://localhost:3000/pkp-workers-vr.html
```

## 🤖 Worker Visualizations

### 6 Sub-PKP Agent Types

Each worker has a unique 3D visualization representing their task:

#### 1. 🔒 **Redis Encryptor** (Red)
- **Position:** Front-left
- **Visualization:** Animated lock with floating data packets
- **Tasks:**
  - Encrypting user session data
  - Securing Redis keys
  - PKP credential encryption
- **Animation:** Pulsing lock with data packets flowing through

#### 2. ✅ **Test Runner** (Green)
- **Position:** Back-left
- **Visualization:** Clipboard with animated checkmarks
- **Tasks:**
  - Running Playwright E2E tests
  - UI component testing
  - Integration test suites
- **Animation:** Checkmarks appearing sequentially on clipboard

#### 3. 📝 **Code Reviewer** (Blue)
- **Position:** Front-center
- **Visualization:** Monitor screen with scrolling code lines
- **Tasks:**
  - Reviewing pull requests
  - Security code audits
  - Style check analysis
- **Animation:** Code lines scrolling with error highlights

#### 4. 📊 **Metrics Collector** (Yellow)
- **Position:** Back-center
- **Visualization:** Animated bar chart
- **Tasks:**
  - Collecting performance metrics
  - User engagement analytics
  - System health monitoring
- **Animation:** Growing bar chart with live data

#### 5. 🛡️ **Security Auditor** (Orange)
- **Position:** Front-right
- **Visualization:** Shield with scanning rings
- **Tasks:**
  - Vulnerability scanning
  - Dependency audits
  - Access control reviews
- **Animation:** Pulsing shield with expanding scan rings

#### 6. 🚀 **Deployer** (Purple)
- **Position:** Back-right
- **Visualization:** Rocket with flame particles
- **Tasks:**
  - Deploying to production
  - Building Docker containers
  - Deployment verification
- **Animation:** Bobbing rocket with particle flame effects

## 🎮 Controls

### Desktop Mode

- **Mouse Drag:** Rotate camera around the scene
- **Mouse Scroll:** Zoom in/out
- **WASD Keys:** Move camera position
- **Click Workers:** Interact with individual agents (future feature)

### VR Mode

- **Click "Enter VR":** Activate immersive VR mode
- **VR Controllers:** Point and interact with workers
- **Hand Tracking:** Natural hand gestures (if supported)
- **Teleport:** Move around the workspace

## 📊 Real-Time Features

### Status Display

Each worker shows:
- **Current Status:** Idle ⏸️, Working ⚙️, or Completed ✅
- **Progress:** Percentage complete (0-100%)
- **Current Task:** Descriptive text of what they're doing
- **Color Coding:** Visual status indicators

### Auto-Simulation

Workers automatically:
- Accept new tasks randomly
- Process tasks with realistic progress
- Complete tasks and return to idle
- Display task-specific animations

### Repository Context

Switch between:
- **jasonsprouse/the-beach** - Main NPE project
- **jasonsprouse/y8-app** - Frontend application

Tasks automatically update to reflect the selected repository!

## 🎨 Visual Elements

### Scene Layout

```
                    📋 Title Hologram
                           ↓
        ┌─────────────────────────────────┐
        │      Central Platform (8m)       │
        │         Glowing Blue             │
        └─────────────────────────────────┘

  🔒 Redis          📝 Code          🛡️ Security
 Encryptor         Reviewer          Auditor
   (Red)            (Blue)           (Orange)
     ↓                ↓                 ↓
  Platform        Platform          Platform

  ✅ Test          📊 Metrics         🚀 Deployer
  Runner          Collector
  (Green)         (Yellow)          (Purple)
     ↓                ↓                 ↓
  Platform        Platform          Platform

        ────────────────────────────────
        30m x 30m Grid Floor (Dark Blue)
```

### Color Scheme

- **Floor:** Dark blue-gray with glowing grid lines
- **Platforms:** Metallic with emissive glow matching worker color
- **Workers:** PBR materials with metallic shine
- **Labels:** Glowing text billboards
- **UI:** Semi-transparent dark panels

## 💬 Feedback System

### Give Your Input!

The VR scene includes a **built-in feedback panel** where you can:

1. Share your thoughts on the visualization
2. Suggest new features or improvements
3. Report issues or bugs
4. Request additional worker types

**Feedback is crucial for iterating on this experience!**

### What We Want to Know:

- ✅ Is the visualization helpful for understanding worker tasks?
- ✅ What additional details would you like to see?
- ✅ Should we add more worker types?
- ✅ How can we improve the VR experience?
- ✅ What metrics or stats should be displayed?
- ✅ Do you want interactive controls (pause, speed up, assign tasks)?

## 🔧 Customization

### Add Custom Workers

Edit `PKPWorkersVRScene.ts` to add new worker types:

```typescript
{
  type: WorkerTaskType.YOUR_WORKER,
  name: 'Your Worker Name',
  position: new Vector3(x, 0, z),
  color: new Color3(r, g, b),
  emoji: '🎯'
}
```

### Modify Animations

Each worker has custom animations in:
- `createEncryptorVisualization()`
- `createTestRunnerVisualization()`
- `createCodeReviewerVisualization()`
- etc.

### Change Task Lists

Update `getTasksForType()` to customize task descriptions:

```javascript
[WorkerTaskType.YOUR_WORKER]: [
  'Task description 1...',
  'Task description 2...',
  'Task description 3...',
],
```

## 📈 Stats Panel

Real-time statistics displayed:

| Metric | Description |
|--------|-------------|
| **FPS** | Frames per second (rendering performance) |
| **Workers** | Total number of active workers (6) |
| **Tasks** | Currently executing tasks |
| **Meshes** | Total 3D objects in scene |

## 🎯 Future Enhancements

### Planned Features:

- [ ] **Interactive Task Assignment** - Click to assign specific tasks
- [ ] **Task Queue Visualization** - See pending tasks in 3D queue
- [ ] **Performance Graphs** - Real-time charts floating above workers
- [ ] **Error Visualization** - Red alerts when tasks fail
- [ ] **Worker Collaboration** - Visual connections between collaborating agents
- [ ] **Task History Timeline** - Scrollable timeline of completed tasks
- [ ] **Resource Usage Meters** - CPU/Memory visualization per worker
- [ ] **Sound Effects** - Audio feedback for task completion
- [ ] **Haptic Feedback** - VR controller vibration
- [ ] **Voice Commands** - "Deploy to production" to trigger tasks
- [ ] **Multi-User VR** - Multiple people watching together
- [ ] **Worker Customization** - Choose avatar styles
- [ ] **Day/Night Cycle** - Time-based lighting
- [ ] **Achievement System** - Badges for completed milestones

### Community Requests:

**Your feedback determines what we build next!**

## 🏗️ Architecture

### Technologies Used

- **Babylon.js 6.x** - 3D rendering engine
- **WebXR** - VR/AR browser API
- **Babylon.js GUI** - 2D/3D UI elements
- **PBR Materials** - Physically-based rendering
- **Particle Systems** - Visual effects
- **Animation System** - Smooth keyframe animations

### File Structure

```
src/scenes/
  └── PKPWorkersVRScene.ts       (Main VR scene class - TypeScript)

public/
  └── pkp-workers-vr.html        (HTML viewer with inline scene)
```

### Performance

- **Target FPS:** 60+ (desktop), 72+ (VR)
- **Mesh Count:** ~100 objects
- **Draw Calls:** Optimized with instancing
- **Particle Count:** ~500 particles total
- **Memory Usage:** ~50MB

## 🐛 Troubleshooting

### Scene Not Loading

1. Check browser console for errors
2. Ensure Babylon.js CDN is accessible
3. Verify WebGL support: `chrome://gpu`

### Low FPS in VR

1. Reduce particle count in `createDataPackets()`
2. Disable some worker visualizations
3. Lower VR resolution in headset settings
4. Close other browser tabs

### VR Button Not Working

1. Ensure HTTPS or localhost
2. Check WebXR browser support
3. Connect VR headset before entering VR
4. Try Chrome/Edge (best WebXR support)

### Workers Not Animating

1. Check browser console for animation errors
2. Verify scene.beginAnimation() calls
3. Ensure engine.runRenderLoop() is active

## 📸 Screenshots

### Desktop View
*Workers arranged in circular layout around central platform*

### VR View
*Immersive 3D environment with floating workers and labels*

### Worker Close-up
*Detailed view of individual worker with status panel*

## 🎓 Learning Resources

### Babylon.js Tutorials
- [Official Documentation](https://doc.babylonjs.com/)
- [WebXR Guide](https://doc.babylonjs.com/features/featuresDeepDive/webXR)
- [Animation System](https://doc.babylonjs.com/features/featuresDeepDive/animation)

### WebXR Development
- [WebXR Device API](https://immersive-web.github.io/webxr/)
- [WebXR Samples](https://immersive-web.github.io/webxr-samples/)

## 📝 License

Part of The Beach project. See main LICENSE file.

---

## 🚀 Get Started Now!

```bash
# Start the server
npm run start:dev

# Open in browser
http://localhost:3000/pkp-workers-vr.html

# Put on your VR headset and click "Enter VR"!
```

**Watch your PKP workers come to life! 🤖✨**

---

## 💬 We Need Your Feedback!

This is **version 1.0** of the worker visualization. Your input is critical for making this better!

**Please submit feedback through:**
1. The in-app feedback form
2. GitHub issues
3. Direct communication

**Questions to answer:**
- Does this help you understand what your workers are doing?
- What would make this more useful?
- Should we add more detail or simplify?
- What features are missing?

**Thank you for helping us iterate! 🙏**
