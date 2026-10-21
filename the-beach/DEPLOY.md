# 🏝️ Tropical XR Paradise - Vercel Deployment Guide

Your Babylon.js XR tropical paradise is ready to deploy to Vercel!

## 🚀 Quick Deploy

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel (if not already logged in)
vercel login

# Deploy from your project directory
vercel --prod
```

### Option 2: Git Integration (Easiest)
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect the NestJS configuration
5. Click "Deploy" - no additional configuration needed!

## 📁 Deployment Files

- `vercel.json` - Vercel configuration with build commands and routing
- `.vercelignore` - Excludes unnecessary files from deployment
- `api/index.ts` - Serverless function handler for NestJS app
- `package.json` - Includes Node.js version specification (v18+)

## 🏗️ How It Works

1. **Build Phase**: Vercel runs `npm install` and `npm run build`
2. **Compilation**: NestJS app is compiled to `dist/` folder
3. **Serverless**: The `api/index.ts` handler bootstraps the NestJS app as a serverless function
4. **Static Assets**: The `public/` folder is served directly by Vercel's CDN
5. **Routing**: All requests are routed through the serverless function except static assets

## 🌐 Live URLs After Deployment

- **Main XR Environment**: `https://your-app.vercel.app/xr`
- **API Info**: `https://your-app.vercel.app/xr/info`
- **Server Status**: `https://your-app.vercel.app/status`
- **WebSocket**: `wss://your-app.vercel.app` (for multiplayer)

## 🎮 Features Deployed

✅ **Tropical Beach Environment** with palm trees and ocean
✅ **WebXR VR/AR Support** for immersive experiences  
✅ **Real-time Multiplayer** via Socket.IO WebSockets
✅ **Cross-platform** - Desktop, VR headsets, mobile
✅ **Interactive Elements** - Teleportation, exploration

## 🔧 Environment Configuration

The deployment uses:
- **Node.js 18+** (specified in package.json engines)
- **Production mode** (NODE_ENV=production)
- **CORS enabled** for cross-origin requests
- **Static assets** served from public folder

### Environment Variables

No environment variables are required for basic deployment. If you need to add any:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add your variables (they will be available in `process.env`)

## 📱 Device Compatibility

- **Desktop**: Chrome/Edge with mouse/keyboard controls
- **Mobile**: iOS Safari, Android Chrome with touch controls
- **VR Headsets**: Quest, PSVR, etc. with WebXR support
- **AR Devices**: ARCore/ARKit compatible devices

## 🛠️ Troubleshooting

### Build Failures
If the build fails:
1. Check the build logs in Vercel dashboard
2. Verify `npm run build` works locally
3. Ensure all dependencies are in `package.json` (not just devDependencies for runtime deps)

### WebSocket Issues
WebSockets may have limitations on Vercel's serverless platform:
- Connections timeout after 5 minutes on Hobby plan
- Consider Vercel Pro or switch to long polling for persistent connections
- For production Socket.IO apps, consider using a dedicated WebSocket server

### Runtime Errors
If the app deploys but doesn't work:
1. Check the Function logs in Vercel dashboard
2. Verify the `dist/` folder structure locally
3. Test that `api/index.ts` can import from `../dist/app.module`

### Static Assets Not Loading
If static assets don't load:
1. Verify the `public/` folder is in your repository
2. Check that paths in your code use `/public/...`
3. Ensure `.vercelignore` doesn't exclude public folder

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Socket.IO on Serverless](https://socket.io/docs/v4/server-deployment/#serverless)

## ⚠️ Important Notes

**WebSocket Limitations**: Vercel's serverless functions have a 5-minute timeout for WebSocket connections (Hobby plan) or 15 minutes (Pro plan). For production apps requiring persistent connections, consider:
- Using Vercel Pro for longer connection timeouts
- Implementing Socket.IO's long-polling fallback
- Hosting the WebSocket server separately (e.g., on Railway, Render, or Fly.io)

**Cold Starts**: The first request after inactivity may be slower (~1-3 seconds) as Vercel spins up the serverless function.

---

Enjoy your tropical XR paradise in the cloud! 🌴🌊