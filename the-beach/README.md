# 🏝️ The Beach - Tropical XR Paradise

<p align="center">
  <strong>An immersive WebXR tropical paradise built with Babylon.js and multiplayer support</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WebXR-Enabled-blue.svg" alt="WebXR Enabled" />
  <img src="https://img.shields.io/badge/Babylon.js-8.x-green.svg" alt="Babylon.js" />
  <img src="https://img.shields.io/badge/NestJS-11.x-red.svg" alt="NestJS" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License" />
</p>

> 💡 **New here?** Check out the [Quick Start Guide](QUICKSTART.md) to get up and running in 5 minutes!

## 🌴 About

**The Beach** is a fully immersive virtual reality tropical paradise that runs in your web browser. Experience a beautiful beach environment with swaying palm trees, animated ocean waves, and multiplayer support - all powered by WebXR and Babylon.js. Whether you're using a VR headset or just exploring from your desktop, The Beach offers a relaxing escape to a tropical paradise.

## ✨ Features

- 🥽 **WebXR Support** - Full VR/AR compatibility with Meta Quest, HTC Vive, and other WebXR-enabled devices
- 🌊 **Tropical Environment** - Beautiful beach with animated ocean waves, palm trees, and sandy shores
- 👥 **Multiplayer** - Real-time multiplayer using Socket.IO with WebRTC video/audio chat
- 🎮 **Multiple Control Schemes** - VR controllers, keyboard/mouse, and touch controls
- 🌅 **Dynamic Environment** - Realistic lighting, shadows, and atmospheric effects
- 🏖️ **Interactive Elements** - Explore the beach, interact with objects, and teleport using beach umbrellas
- 🎵 **Ambient Audio** - Integrated SoundCloud player with ocean breeze soundtrack
- 📱 **Cross-Platform** - Works on desktop, mobile, and VR headsets
- 🔐 **Lit Compute Network** - NEW! Earn crypto by sharing CPU for encryption operations ([Quick Start](QUICK_START.md) | [Full Guide](LIT_COMPUTE_QUICKSTART.md))
- 🤖 **Digital AI Agents (NPE)** - Watch autonomous AI agents build software in real-time ([Complete Guide](DIGITAL_AI_AGENTS_GUIDE.md) | [Y8 App Guide](Y8_APP_DIGITAL_AGENTS_GUIDE.md) | [Quick Index](DIGITAL_AGENTS_INDEX.md))

## 🎯 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher (recommended: 20.x)
- **npm** or **yarn**
- A modern browser with WebXR support (Chrome, Edge, or Firefox Reality)
- Optional: VR headset with WebXR support

### Installation

1. **Clone the repository**
   ```bash
   # To use the app:
   git clone https://github.com/jasonsprouse/the-beach.git
   cd the-beach
   
   # To contribute, fork first then clone your fork:
   # git clone https://github.com/YOUR_USERNAME/the-beach.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the development server**
   ```bash
   npm run start:dev
   ```

5. **Open in your browser**
   
   Navigate to `http://localhost:3000/xr` and click "Load Paradise" to begin your tropical adventure!

### Production Deployment

For production deployment, see [DEPLOY.md](./DEPLOY.md) which includes detailed instructions for deploying to Vercel.

Quick deploy to Vercel:
```bash
npm i -g vercel
vercel --prod
```

## 🎮 How to Use

### Desktop Controls (Non-VR)

- **W/A/S/D or Arrow Keys** - Move around
- **Mouse** - Look around (click and drag)
- **E** - Move up
- **Q** - Move down
- **Space** - Jump (if implemented)

### VR Controls

- **VR Controllers** - Point and teleport using beach umbrellas
- **Joystick/Thumbstick** - Smooth locomotion
- **Hand Tracking** - Natural interaction (if supported by your device)

### Multiplayer

- Video and audio chat are automatically enabled when you join
- Your avatar appears to other users in real-time
- Move around to see other players' positions update

## 🔧 Development

### Project Structure

```
the-beach/
├── src/                    # Backend (NestJS)
│   ├── events/            # WebSocket gateway for multiplayer
│   ├── xr/                # XR environment endpoints
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Entry point
├── public/                 # Frontend static files
│   ├── index.html         # Main XR environment
│   └── js/
│       └── xr-scene.js    # Babylon.js scene logic
├── index.html             # Landing page
├── package.json
└── README.md
```

### Available Scripts

- `npm run start` - Start the server in production mode
- `npm run start:dev` - Start in development mode with hot-reload
- `npm run build` - Build the TypeScript backend
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

### API Endpoints

- `GET /xr` - Main tropical XR environment
- `GET /xr/demo` - Demo scene
- `GET /xr/info` - Information about the XR environment and features
- `WebSocket ws://localhost:3000` - Real-time multiplayer server

## 🤝 Contributing

We welcome contributions! Here's how you can help make The Beach even better:

### How to Contribute

1. **Fork the Repository**
   
   Click the "Fork" button at the top right of this page to create your own copy.

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```

3. **Make Your Changes**
   
   Follow the existing code style and structure. Some ideas:
   - Add new 3D models or decorations
   - Implement new interactive elements
   - Improve multiplayer features
   - Enhance the environment with new effects
   - Add new scenes or locations

4. **Test Your Changes**
   ```bash
   npm run build
   npm run test
   npm run start:dev
   ```
   
   Open `http://localhost:3000/xr` and verify everything works.

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-amazing-feature
   ```

6. **Open a Pull Request**
   
   Go to the original repository and click "New Pull Request"

### 🎨 Creating New Scenes with AI

One of the most exciting ways to extend The Beach is by creating new scenes! Here's how to use AI tools like ChatGPT, Claude, or GitHub Copilot to generate new environments:

#### Step 1: Fork and Branch

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/the-beach.git
cd the-beach
git checkout -b feature/new-scene-underwater-cave
```

#### Step 2: Use AI to Generate Scene Code

Ask an AI assistant to help you create a new Babylon.js scene. Here's an example prompt:

```
I'm working on a Babylon.js WebXR project. I need to create an underwater cave scene 
with the following features:
- Bioluminescent plants on cave walls
- Schools of fish swimming around
- Underwater lighting effects with caustics
- Collision detection for cave walls
- Teleportation points using glowing crystals
- Ambient underwater sound effects

Please provide the JavaScript/TypeScript code for creating this scene in Babylon.js,
following the structure in this example: [paste relevant code from xr-scene.js]
```

#### Step 3: Integrate the AI-Generated Scene

1. Create a new scene file in `public/js/`:
   ```bash
   touch public/js/underwater-cave-scene.js
   ```

2. Paste and adapt the AI-generated code, making sure to:
   - Follow the existing code structure and patterns
   - Use consistent naming conventions
   - Add proper error handling
   - Include collision detection
   - Add WebXR teleportation support

3. Create a new HTML page or route for your scene:
   ```bash
   cp public/index.html public/underwater-cave.html
   ```
   
   Update the script reference to load your new scene file.

4. Add a controller route in `src/xr/xr.controller.ts`:
   ```typescript
   @Get('underwater-cave')
   getUnderwaterCave(@Res() res: Response) {
     return res.sendFile(join(process.cwd(), 'public', 'underwater-cave.html'));
   }
   ```

#### Step 4: Test and Refine

```bash
npm run build
npm run start:dev
```

Visit `http://localhost:3000/xr/underwater-cave` and test your new scene. Iterate with the AI assistant to fix any issues or add enhancements.

#### Step 5: Document and Share

Add documentation for your new scene:
- Update the README with information about the new scene
- Add screenshots or videos
- Document any new controls or interactions
- Update the `/xr/info` endpoint to include your scene

### 💡 Ideas for New Scenes

Here are some scene ideas you can create with AI assistance:

- 🌲 **Forest Retreat** - Dense forest with wildlife and treehouse
- 🏔️ **Mountain Summit** - Snowy peak with aurora borealis
- 🌙 **Moonbase** - Sci-fi lunar station with Earth views
- 🏛️ **Ancient Temple** - Mysterious ruins with puzzles
- 🌊 **Underwater City** - Submerged Atlantis-style metropolis
- 🏜️ **Desert Oasis** - Sand dunes with palm tree oasis
- 🌌 **Space Station** - Zero-gravity orbital platform
- 🏰 **Medieval Castle** - Fantasy fortress with dragons

### Code Style Guidelines

- Use TypeScript where possible
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names
- Test in both VR and non-VR modes

## 🌐 Browser Compatibility

| Browser | Desktop | Mobile | VR Support |
|---------|---------|--------|------------|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Firefox | ✅ | ⚠️ | ✅ |
| Safari | ⚠️ | ⚠️ | ❌ |

✅ Full support | ⚠️ Partial support | ❌ No support

## 🎥 Examples

### Experience The Beach

1. **Desktop Experience** - Explore the tropical paradise using keyboard and mouse
2. **VR Immersion** - Put on your VR headset and feel like you're actually at the beach
3. **Multiplayer Sessions** - Invite friends to explore together with video chat

## 📚 Technologies Used

- **[Babylon.js](https://www.babylonjs.com/)** - 3D engine and WebXR framework
- **[NestJS](https://nestjs.com/)** - Backend framework
- **[Socket.IO](https://socket.io/)** - Real-time multiplayer communication
- **[WebRTC](https://webrtc.org/)** - Peer-to-peer video/audio
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vercel](https://vercel.com/)** - Deployment platform

## 🐛 Known Issues

- WebSocket connections on Vercel may timeout after 5-15 minutes (depending on plan)
- Safari has limited WebXR support
- Some VR features may not work in Firefox Reality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jason Sprouse**

## 🙏 Acknowledgments

- Babylon.js community for excellent documentation
- NestJS team for the robust backend framework
- All contributors who help make The Beach better

## 📞 Support

If you have questions or need help:
- Open an [issue](https://github.com/jasonsprouse/the-beach/issues)
- Check existing [documentation](./DEPLOY.md)
- Review the [Babylon.js docs](https://doc.babylonjs.com/)

---

<p align="center">
  Made with ❤️ and 🌴 by the open source community
</p>
