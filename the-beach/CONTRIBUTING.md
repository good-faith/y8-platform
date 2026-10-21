# Contributing to The Beach 🏝️

Thank you for your interest in contributing to The Beach! This document provides guidelines and instructions for contributing to the project.

## 🌟 Ways to Contribute

There are many ways you can contribute to The Beach:

- 🐛 Report bugs and issues
- 💡 Suggest new features or scenes
- 🎨 Create new 3D environments
- 📝 Improve documentation
- 🧪 Write tests
- 🔧 Fix bugs or implement features
- 🎮 Enhance VR/AR interactions
- 🌐 Improve multiplayer features

## 🚀 Getting Started

### 1. Set Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/the-beach.git
   cd the-beach
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/jasonsprouse/the-beach.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Build and run**:
   ```bash
   npm run build
   npm run start:dev
   ```
6. **Test the application** at `http://localhost:3000/xr`

### 2. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features (e.g., `feature/underwater-scene`)
- `fix/` - Bug fixes (e.g., `fix/collision-detection`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/scene-loader`)
- `test/` - Adding tests (e.g., `test/multiplayer-sync`)

## 🎨 Creating New Scenes

### Using AI to Generate Scenes

One of the most powerful ways to contribute is by creating new scenes with AI assistance. Here's a detailed workflow:

#### Step 1: Plan Your Scene

Before coding, plan what you want to create:
- **Theme**: What's the setting? (underwater, space, forest, etc.)
- **Key Elements**: What objects will be in the scene?
- **Interactions**: How will users interact with the environment?
- **Lighting**: What mood do you want to create?
- **Sounds**: What ambient audio fits the scene?

#### Step 2: Generate Base Code with AI

Use ChatGPT, Claude, GitHub Copilot, or similar AI tools. Here's a detailed prompt template:

```
I'm creating a new scene for a Babylon.js WebXR project called "The Beach". 
I want to create a [SCENE_TYPE] with the following specifications:

Scene Theme: [e.g., Underwater Coral Reef]

Required Elements:
- [e.g., Colorful coral formations]
- [e.g., Schools of tropical fish]
- [e.g., Underwater lighting with caustics]
- [e.g., Sea plants swaying with current]

Technical Requirements:
- Must work in both VR and desktop modes
- Include collision detection for solid objects
- Add teleportation points (use glowing markers)
- Performance optimized (aim for 90fps in VR)
- Include shadows and realistic lighting

Existing Project Structure:
[Paste relevant code snippets from xr-scene.js showing the current scene structure]

Please provide:
1. The main scene creation function
2. Object creation with materials
3. Lighting setup
4. Animation loops if needed
5. Collision detection setup
6. Teleportation point placement
7. Any custom shaders or effects

Use Babylon.js best practices and match the coding style of the existing project.
```

#### Step 3: Structure Your Scene Code

Create a new scene class following this structure:

```javascript
// public/js/my-new-scene.js

class MyNewScene extends BabylonXRScene {
    constructor() {
        super();
        this.sceneName = "My New Scene";
    }
    
    async createEnvironment(scene) {
        // Ground/floor
        this.createGround(scene);
        
        // Main scene elements
        this.createSceneObjects(scene);
        
        // Lighting
        this.setupLighting(scene);
        
        // Interactive elements
        this.createInteractiveElements(scene);
        
        // Animations
        this.setupAnimations(scene);
    }
    
    createGround(scene) {
        // Ground creation code
    }
    
    createSceneObjects(scene) {
        // Main objects code
    }
    
    setupLighting(scene) {
        // Lighting code
    }
    
    createInteractiveElements(scene) {
        // Teleportation points, interactive objects
    }
    
    setupAnimations(scene) {
        // Animation loops
    }
}
```

#### Step 4: Refine with AI

As you test, use AI to help refine:

```
The scene is rendering but I'm seeing [ISSUE]. Here's my current code:
[paste code]

How can I fix this while maintaining performance in VR?
```

Common refinement tasks:
- **Performance optimization** - "How can I reduce draw calls?"
- **Visual improvements** - "How can I make the water look more realistic?"
- **Interactions** - "How do I add physics to these objects?"
- **Audio** - "How can I add spatial audio to this scene?"

#### Step 5: Test Thoroughly

Test your scene in multiple modes:

```bash
# Desktop testing
npm run start:dev
# Visit http://localhost:3000/xr/your-scene

# VR testing
# Connect your VR headset and test with WebXR
```

Checklist:
- [ ] Scene loads without errors
- [ ] Performance is smooth (check FPS)
- [ ] Collision detection works
- [ ] Teleportation works in VR
- [ ] Lighting looks good
- [ ] Shadows render correctly
- [ ] Multiplayer sync works (avatars visible)
- [ ] Desktop controls work
- [ ] VR controller interactions work
- [ ] Mobile touch controls work (if applicable)

### Scene Integration

#### Add a Controller Route

Edit `src/xr/xr.controller.ts`:

```typescript
@Get('my-new-scene')
getMyNewScene(@Res() res: Response) {
  return res.sendFile(join(process.cwd(), 'public', 'my-new-scene.html'));
}
```

#### Create the HTML File

```bash
cp public/index.html public/my-new-scene.html
```

Edit the new HTML file to:
1. Update the title
2. Change the script src to your new scene file
3. Update any scene-specific UI elements

#### Update the Info Endpoint

Add your scene to `src/xr/xr.controller.ts` info endpoint:

```typescript
endpoints: {
  xr: '/xr - Main tropical XR environment',
  'my-new-scene': '/xr/my-new-scene - Description of your scene',
  // ...
}
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Writing Tests

If you add new backend functionality, include tests:

```typescript
// src/xr/xr.controller.spec.ts
describe('XrController', () => {
  it('should return scene info', () => {
    const result = controller.getXrInfo();
    expect(result).toHaveProperty('features');
    expect(result.features).toContain('WebXR VR/AR Support');
  });
});
```

### Manual Testing Checklist

- [ ] Desktop browser (Chrome/Edge)
- [ ] Mobile browser (iOS Safari, Android Chrome)
- [ ] VR headset (Quest, Vive, etc.)
- [ ] Multiplayer with 2+ users
- [ ] Different network conditions
- [ ] With and without camera/microphone permissions

## 📝 Code Style

### TypeScript/JavaScript

- Use TypeScript for backend code
- Follow existing formatting (run `npm run format`)
- Use meaningful variable names
- Add JSDoc comments for public methods
- Keep functions small and focused

Example:

```typescript
/**
 * Creates a palm tree with swaying animation
 * @param scene - The Babylon.js scene
 * @param position - World position for the tree
 * @returns The tree mesh with animation
 */
createPalmTree(scene: BABYLON.Scene, position: BABYLON.Vector3): BABYLON.Mesh {
  // Implementation
}
```

### Frontend Code

- Use ES6+ features
- Organize code into classes
- Comment complex 3D math or algorithms
- Use const/let, not var
- Handle errors gracefully

### Formatting

We use Prettier for code formatting:

```bash
npm run format
```

This will automatically format all TypeScript files.

## 🔍 Code Review Process

1. **Submit a Pull Request** with a clear description
2. **Link related issues** using keywords (Fixes #123)
3. **Ensure CI passes** - all tests and linting must pass
4. **Wait for review** - maintainers will review your code
5. **Address feedback** - make requested changes
6. **Approval and merge** - once approved, your PR will be merged!

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] New scene
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested in VR
- [ ] Tested multiplayer
- [ ] Added/updated tests

## Screenshots/Videos
[Add screenshots or video demonstrations if applicable]

## Related Issues
Fixes #[issue number]

## Additional Notes
Any additional information reviewers should know.
```

## 🎯 AI-Assisted Development Tips

### Best Practices When Using AI

1. **Be Specific**: Provide detailed context about the project structure
2. **Iterate**: Don't expect perfect code on the first try
3. **Review Carefully**: Always review and test AI-generated code
4. **Learn**: Use AI as a learning tool, not just a code generator
5. **Adapt**: Modify AI suggestions to fit project conventions

### Example AI Workflows

#### Creating Particle Effects
```
Prompt: "Create a Babylon.js particle system for underwater bubbles that 
rise from the ocean floor. Should be performance-friendly for VR."
```

#### Adding Physics
```
Prompt: "I have a beach ball mesh in Babylon.js. How do I add physics so 
it bounces realistically when thrown? Include collision with ground."
```

#### Optimizing Performance
```
Prompt: "My Babylon.js scene has 100 palm trees and FPS is dropping in VR. 
How can I optimize using instancing or LOD? Here's my current code: [paste code]"
```

#### Creating Shaders
```
Prompt: "Create a GLSL shader for Babylon.js that makes water look realistic 
with waves, reflections, and transparency. Should work on Quest 2."
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the issue already exists
2. Test in the latest version
3. Try to reproduce in a clean environment

### Bug Report Template

```markdown
**Describe the Bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
Add screenshots if applicable.

**Environment:**
- Device: [e.g., Desktop, Quest 2]
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- VR Headset: [e.g., Meta Quest 2]

**Console Errors**
```
[Paste any console errors here]
```

**Additional Context**
Any other relevant information.
```

## 💡 Feature Requests

We love new ideas! When requesting a feature:

1. **Check existing issues** - it might already be planned
2. **Be descriptive** - explain the use case
3. **Consider feasibility** - think about performance, especially in VR
4. **Propose solutions** - share your ideas on implementation

## 📚 Resources

### Learning Babylon.js
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Babylon.js Playground](https://playground.babylonjs.com/)
- [Babylon.js Forum](https://forum.babylonjs.com/)

### WebXR Development
- [WebXR Device API](https://www.w3.org/TR/webxr/)
- [Immersive Web Community](https://immersiveweb.dev/)
- [Meta Quest Development](https://developer.oculus.com/documentation/web/)

### AI Tools for Development
- [ChatGPT](https://chat.openai.com/) - General code generation
- [GitHub Copilot](https://github.com/features/copilot) - In-editor assistance
- [Claude](https://www.anthropic.com/claude) - Complex reasoning tasks

## 🤝 Community

- Be respectful and inclusive
- Help others learn
- Share your knowledge
- Give credit where it's due
- Have fun building amazing experiences!

## ❓ Questions?

If you have questions about contributing:
- Open a [discussion](https://github.com/jasonsprouse/the-beach/discussions)
- Ask in an [issue](https://github.com/jasonsprouse/the-beach/issues)
- Check existing documentation

---

Thank you for contributing to The Beach! Your efforts help create amazing virtual experiences for everyone. 🌴🌊✨
