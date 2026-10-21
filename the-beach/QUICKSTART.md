# 🚀 Quick Start Guide

Get The Beach running in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- A modern browser (Chrome or Edge recommended)

## Installation

```bash
# 1. Clone the repository
# For using the app:
git clone https://github.com/jasonsprouse/the-beach.git
cd the-beach

# For contributing, fork first then clone your fork:
# git clone https://github.com/YOUR_USERNAME/the-beach.git

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Start the server
npm run start:dev
```

## Open The Beach

Open your browser and go to:
```
http://localhost:3000/xr
```

Click **"Load Paradise"** to enter the tropical environment!

## Controls

### Desktop
- **W/A/S/D** - Move
- **Mouse** - Look around
- **E/Q** - Move up/down

### VR
- Put on your VR headset
- Click "Enter VR" in your browser
- Use VR controllers to teleport and move

## Next Steps

- Read the [full README](README.md) for detailed features
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) to create new scenes
- See [SCENES.md](SCENES.md) for AI-assisted scene creation
- Review [DEPLOY.md](DEPLOY.md) for production deployment

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run start:dev
```

### Dependencies Won't Install
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Can't Access Camera/Mic
- Grant camera/microphone permissions in your browser
- Multiplayer video chat requires these permissions
- You can still use The Beach without them

### WebXR Not Working
- Use Chrome or Edge (Safari has limited support)
- Make sure your VR headset is connected
- Check that WebXR is enabled in browser flags

## Resources

- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [WebXR Guide](https://immersiveweb.dev/)
- [Project Issues](https://github.com/jasonsprouse/the-beach/issues)

Enjoy The Beach! 🏝️🌊
