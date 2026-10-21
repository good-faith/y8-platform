# 🎨 Scene Creation Guide

This guide provides examples and templates for creating new scenes in The Beach using AI assistance.

## 📋 Table of Contents

- [Scene Architecture](#scene-architecture)
- [AI Prompt Templates](#ai-prompt-templates)
- [Example Scenes](#example-scenes)
- [Performance Guidelines](#performance-guidelines)
- [Best Practices](#best-practices)

## 🏗️ Scene Architecture

Every scene in The Beach follows a consistent structure:

```
Scene Components:
├── Environment (ground, sky, background)
├── Lighting (ambient, directional, point lights)
├── Main Objects (3D models, meshes)
├── Interactive Elements (teleportation, grabbable objects)
├── Animations (movement, particles)
├── Audio (ambient sounds, spatial audio)
└── Multiplayer Sync (avatar positions, interactions)
```

### Basic Scene Template

```javascript
class MyScene {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.xr = null;
    }
    
    async init() {
        // 1. Setup engine and scene
        await this.createEngine();
        
        // 2. Create environment
        await this.createEnvironment();
        
        // 3. Setup lighting
        this.setupLighting();
        
        // 4. Add interactive elements
        this.addInteractiveElements();
        
        // 5. Setup WebXR
        await this.setupWebXR();
        
        // 6. Start render loop
        this.startRenderLoop();
    }
    
    async createEngine() {
        const canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true
        });
        this.scene = new BABYLON.Scene(this.engine);
    }
    
    async createEnvironment() {
        // Create ground, sky, main objects
    }
    
    setupLighting() {
        // Setup lights and shadows
    }
    
    addInteractiveElements() {
        // Add teleportation points, interactive objects
    }
    
    async setupWebXR() {
        // Configure WebXR experience
        this.xr = await this.scene.createDefaultXRExperienceAsync({
            floorMeshes: [this.scene.getMeshByName("ground")]
        });
    }
    
    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}
```

## 🤖 AI Prompt Templates

### Template 1: Basic Environment Scene

```
I'm creating a [SCENE_TYPE] scene for a Babylon.js WebXR application. 

Scene Requirements:
- Theme: [e.g., "Serene Japanese Garden"]
- Main elements: [list 5-7 key objects]
- Atmosphere: [e.g., "Peaceful, zen-like with soft lighting"]
- Interactions: [e.g., "Users can teleport to meditation spots"]

Technical specifications:
- Target: Meta Quest 2 and desktop browsers
- Performance: Must maintain 90 FPS in VR
- Collision detection for solid objects
- WebXR teleportation support
- Multiplayer compatible (avatars must be visible)

Current project structure:
[Paste relevant code from existing scene]

Please provide:
1. Complete scene creation code
2. Material and texture setup
3. Lighting configuration
4. Collision meshes
5. Teleportation point placement
6. Performance optimization tips

Use modern JavaScript (ES6+) and follow Babylon.js best practices.
```

### Template 2: Interactive Scene with Physics

```
Create a Babylon.js scene with physics interactions for VR.

Scene: [e.g., "Carnival Game Booth"]
Interactive elements:
- [e.g., "Throwable balls"]
- [e.g., "Stackable targets"]
- [e.g., "Score counter display"]

Physics requirements:
- Cannon.js or Ammo.js physics engine
- Realistic collision responses
- Grab and throw mechanics for VR controllers
- Ground collision
- Object-to-object collisions

Integration:
- Must work with existing multiplayer system
- Should sync physics across clients
- VR controller input for grabbing
- Fallback for desktop mouse controls

Provide complete implementation with:
1. Physics engine initialization
2. Physics impostor setup for objects
3. VR controller grab logic
4. Force application for throwing
5. Collision event handling
6. Desktop mouse interaction alternative
```

### Template 3: Atmospheric Scene with Effects

```
Design a Babylon.js scene with advanced visual effects.

Scene: [e.g., "Aurora Borealis Night"]
Visual effects needed:
- [e.g., "Northern lights in sky"]
- [e.g., "Stars particle system"]
- [e.g., "Volumetric fog"]
- [e.g., "Ice with refraction"]

Technical details:
- Custom shaders for aurora effect
- Particle systems for atmosphere
- Post-processing effects
- Dynamic lighting that changes over time
- Optimized for VR rendering

Deliverables:
1. Custom shader code (GLSL)
2. Particle system configuration
3. Post-processing setup
4. Animation system for dynamic effects
5. Performance considerations for VR
6. Fallback options for low-end devices
```

### Template 4: Procedural Generation Scene

```
Create a procedurally generated Babylon.js scene.

Scene type: [e.g., "Infinite Procedural Forest"]
Generation parameters:
- [e.g., "Tree density and variety"]
- [e.g., "Terrain with height variations"]
- [e.g., "Random rock and plant placement"]
- [e.g., "Paths between clearings"]

Requirements:
- Generate terrain chunks as user moves
- LOD (Level of Detail) system for performance
- Seed-based generation for consistency
- Memory management (dispose distant chunks)
- Collision detection for generated objects
- VR-friendly performance

Include:
1. Terrain generation algorithm
2. Object placement algorithm
3. LOD implementation
4. Chunk management system
5. Seeded random number generator
6. Memory optimization strategies
```

## 🌟 Example Scenes

### Example 1: Underwater Coral Reef

**Prompt for AI:**
```
Create a Babylon.js underwater coral reef scene for WebXR.

Scene elements:
- Coral formations (various types and colors)
- Schools of tropical fish swimming in patterns
- Underwater lighting with caustics effect
- Sea plants swaying with current
- Sandy ocean floor with shells
- Rocks and underwater caves
- Particles for floating plankton

Atmosphere:
- Underwater fog for depth perception
- Blue-green color grading
- Dynamic caustics projected from surface
- Ambient underwater sound

Technical:
- Fish use flocking algorithm
- Plants use simple sin wave animation
- Custom water caustics shader
- Collision detection for terrain
- Teleportation using glowing pearls
- Performance target: 90 FPS on Quest 2

Match this project style:
[Paste snippet from xr-scene.js showing existing structure]
```

**Expected AI Output:**
- Complete scene class with all methods
- Fish flocking algorithm
- Caustics shader code
- Coral generation functions
- Animation loops
- Material definitions

### Example 2: Space Station Interior

**Prompt for AI:**
```
Design a sci-fi space station interior scene for Babylon.js VR.

Environment:
- Metallic corridors with panels
- Windows showing Earth and stars
- Control panels with glowing buttons
- Zero-gravity simulation (optional)
- Holographic displays
- Airlocks and automatic doors

Interactions:
- Pressable buttons on panels
- Doors that slide open
- Grabbable floating objects
- Teleportation between modules
- Interactive hologram displays

Technical requirements:
- PBR materials for metallic surfaces
- Emissive materials for lights
- Custom shaders for holograms
- Animated doors with triggers
- VR hand interaction
- Spatial audio for ambiance

Performance:
- Optimize for VR (90 FPS)
- Use instancing for repeating panels
- LOD for distant modules
- Efficient lighting setup

Integration:
- Multiplayer avatar rendering
- Socket.io position sync
- WebXR hand tracking support
```

### Example 3: Fantasy Wizard Tower

**Prompt for AI:**
```
Create a magical wizard tower scene in Babylon.js with particle effects.

Scene description:
- Spiral stone staircase
- Magical artifacts on shelves
- Floating books and scrolls
- Crystal ball with effects
- Glowing runes on walls
- Potion bottles with colored liquids
- Window showing fantasy landscape

Magic effects:
- Particle systems for sparkles
- Glowing materials for magical items
- Custom shader for crystal ball
- Animated flames in fireplace
- Floating animation for books
- Pulsing light effects

Interactions:
- Pick up and examine artifacts
- Activate crystal ball
- Read floating books
- Cast simple spell effects
- Teleport using magic circles

Technical:
- Multiple particle systems
- Emissive materials
- Animation groups
- VR controller raycasting
- Object highlighting on hover
- Performance optimized

Style:
- Fantasy/medieval aesthetic  
- Warm lighting
- Mystical atmosphere
- Rich colors and textures
```

## ⚡ Performance Guidelines

### VR Performance Targets

| Device | Target FPS | Draw Calls | Triangles |
|--------|------------|------------|-----------|
| Quest 2 | 90 | < 100 | < 100k (100,000) |
| Quest 3 | 90-120 | < 150 | < 200k (200,000) |
| Desktop VR | 90 | < 200 | < 500k (500,000) |
| Desktop Non-VR | 60 | < 300 | < 1M (1,000,000) |

*Note: 'k' = thousands, 'M' = millions*

### Optimization Techniques

#### Use Instancing for Repeated Objects
```javascript
// AI Prompt: "Show me how to use instancing in Babylon.js for 100 trees"

// Note: This example uses a simple box for demonstration.
// In production, you would load or create a proper tree model
const treeMaster = BABYLON.MeshBuilder.CreateBox("tree", {size: 1}, scene);
// Or load a real tree model: 
// const treeMaster = await BABYLON.SceneLoader.ImportMeshAsync("", "models/", "tree.glb", scene);

for (let i = 0; i < 100; i++) {
    const instance = treeMaster.createInstance(`tree${i}`);
    instance.position.x = Math.random() * 100 - 50;
    instance.position.z = Math.random() * 100 - 50;
}
```

#### Implement LOD (Level of Detail)
```javascript
// AI Prompt: "Implement LOD system for a complex 3D model in Babylon.js"

// First, create or load meshes at different detail levels
const highDetailMesh = await BABYLON.SceneLoader.ImportMeshAsync("", "models/", "tree_high.glb", scene);
const mediumDetailMesh = await BABYLON.SceneLoader.ImportMeshAsync("", "models/", "tree_medium.glb", scene);
const lowDetailMesh = await BABYLON.SceneLoader.ImportMeshAsync("", "models/", "tree_low.glb", scene);

// Then set up LOD switching based on camera distance
const lodMesh = new BABYLON.LODMesh("lodModel", scene);
lodMesh.addLODLevel(20, highDetailMesh);    // Within 20 units: high detail
lodMesh.addLODLevel(50, mediumDetailMesh);  // 20-50 units: medium detail
lodMesh.addLODLevel(100, lowDetailMesh);    // 50-100 units: low detail
lodMesh.addLODLevel(200, null);             // Beyond 200 units: culled (not rendered)
```

#### Optimize Shadows
```javascript
// AI Prompt: "Setup optimized shadow system in Babylon.js for VR"

const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
shadowGenerator.useBlurExponentialShadowMap = true;
shadowGenerator.blurScale = 2;

// Only add important objects
shadowGenerator.addShadowCaster(mainBuilding);
// Don't add every small object
```

#### Use Texture Atlases
```javascript
// AI Prompt: "How to use texture atlases in Babylon.js to reduce draw calls"

const atlasMaterial = new BABYLON.StandardMaterial("atlas", scene);
atlasMaterial.diffuseTexture = new BABYLON.Texture("textures/atlas.png", scene);

// Use UV coordinates to reference different parts of atlas
mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvArray);
```

## 🎯 Best Practices

### 1. Start Simple, Add Complexity

Begin with basic shapes and lighting:
```javascript
// AI Prompt: "Create a simple prototype scene before adding details"

// Phase 1: Basic geometry
const ground = BABYLON.MeshBuilder.CreateGround("ground", {size: 50}, scene);
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Phase 2: Test performance
// If good, proceed to add details

// Phase 3: Add detailed models and effects
```

### 2. Test in VR Early and Often

Don't wait until the end to test in VR:
```javascript
// Set up WebXR immediately
async setupBasicXR() {
    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [ground]
    });
    // Test each new feature in VR as you add it
}
```

### 3. Handle Errors Gracefully

```javascript
// AI Prompt: "Add error handling for resource loading in Babylon.js"

try {
    const mesh = await BABYLON.SceneLoader.ImportMeshAsync("", "models/", "tree.glb", scene);
} catch (error) {
    console.error("Failed to load model:", error);
    // Fall back to simple geometry
    const fallback = BABYLON.MeshBuilder.CreateBox("fallback", {size: 2}, scene);
}
```

### 4. Comment Complex Code

```javascript
/**
 * Creates a procedural tree using L-system algorithm
 * @param {BABYLON.Scene} scene - The Babylon scene
 * @param {Object} options - Generation options
 * @param {number} options.iterations - Number of L-system iterations
 * @param {number} options.angle - Branch angle in radians
 * @param {number} options.length - Initial branch length
 * @returns {BABYLON.Mesh} The generated tree mesh
 */
function createProceduralTree(scene, options) {
    // Implementation
}
```

### 5. Use Version Control Wisely

Commit after each working feature:
```bash
git add .
git commit -m "Add coral generation algorithm"

# Test

git add .
git commit -m "Add fish flocking behavior"

# Test

git add .
git commit -m "Add underwater lighting and caustics"
```

## 🔄 Iterative Development with AI

### Workflow Example

**Iteration 1: Generate Basic Scene**
```
Prompt: "Create a basic desert oasis scene with sand dunes, 
palm trees, and a water pool in Babylon.js"
```
Result: Basic scene structure
Test: ✅ Renders correctly
Next: Add details

**Iteration 2: Enhance Visuals**
```
Prompt: "Improve the water in my Babylon.js oasis scene with 
reflections and a ripple effect. Here's my current code: [paste]"
```
Result: Better water shader
Test: ✅ Looks good, ⚠️ Performance issue
Next: Optimize

**Iteration 3: Optimize**
```
Prompt: "My Babylon.js scene has 50 palm trees and FPS dropped to 40. 
How can I optimize using instancing? Current code: [paste]"
```
Result: Instancing implementation
Test: ✅ Back to 90 FPS
Next: Add interactions

**Iteration 4: Add Interactions**
```
Prompt: "Add VR teleportation points marked by oasis campfire 
locations in Babylon.js. Show both VR controller and desktop click support."
```
Result: Teleportation system
Test: ✅ Works in VR and desktop
Done: Ready for PR!

## 📚 Additional Resources

### Learning Resources
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [WebXR Samples](https://immersive-web.github.io/webxr-samples/)
- [Three.js to Babylon.js Guide](https://doc.babylonjs.com/guidedLearning/tfjsBabylon)

### Asset Sources
- [Sketchfab](https://sketchfab.com/) - 3D models (many free)
- [Poly Haven](https://polyhaven.com/) - Free textures and HDRIs
- [Freesound](https://freesound.org/) - Sound effects
- [OpenGameArt](https://opengameart.org/) - Game assets

### AI Tools for Asset Generation
- [DALL-E](https://openai.com/dall-e-2) - Generate texture images
- [Midjourney](https://www.midjourney.com/) - Concept art
- [Skybox AI](https://skybox.blockadelabs.com/) - 360° skyboxes
- [Meshy](https://www.meshy.ai/) - Text to 3D models

## 💡 Scene Ideas

Here are 20 scene ideas perfect for AI-assisted creation:

1. **🌋 Volcanic Island** - Active volcano, lava flows, geothermal features
2. **🏔️ Mountain Peak** - Snowy summit, climbing routes, paragliding
3. **🌊 Shipwreck** - Sunken pirate ship, treasure, sea creatures
4. **🌲 Redwood Forest** - Giant trees, treehouse, woodland creatures
5. **🏛️ Ancient Ruins** - Greek/Roman temple, statues, hidden passages
6. **🎪 Circus** - Big top tent, performers, carnival games
7. **🏰 Castle Courtyard** - Medieval keep, training dummies, catapults
8. **🌌 Nebula** - Space environment, colorful gases, asteroids
9. **🎮 Arcade** - Retro arcade games, neon lights, prize counter
10. **🔬 Science Lab** - Equipment, experiments, holographic displays
11. **🎨 Art Gallery** - Paintings, sculptures, interactive exhibits
12. **🏪 Market Bazaar** - Stalls, vendors, exotic goods
13. **⛩️ Shrine** - Japanese temple, gardens, koi pond
14. **🎵 Concert Stage** - Stage, instruments, lighting effects
15. **🌿 Greenhouse** - Exotic plants, glass structure, butterflies
16. **🎭 Theater** - Stage, curtains, seating, backstage
17. **🏗️ Construction Site** - Cranes, materials, scaffolding
18. **🚂 Train Station** - Platform, trains, old-fashioned depot
19. **🌙 Moon Base** - Lunar modules, craters, Earth view
20. **🎪 Steampunk Airship** - Victorian aesthetic, gears, propellers

---

## 🤔 Getting Help

If you need help creating a scene:

1. **Check examples above** - Use the templates as starting points
2. **Ask AI iteratively** - Don't expect perfection first try
3. **Open a discussion** - Share your ideas and get feedback
4. **Review existing scenes** - Look at `public/js/xr-scene.js`
5. **Test frequently** - Build and test as you develop

Happy scene creation! 🎨✨
