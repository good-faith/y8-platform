# Y8 Platform

> Holographic Wallet · XR/VR Space · Premium Financial OS

**Live deployments:**
| App | URL | Description |
|-----|-----|-------------|
| Y8 App | [y8-web-jason-sprouse.fly.dev](https://y8-web-jason-sprouse.fly.dev) | Holographic wallet + agent marketplace |
| Y8 Premier | [y8-premier-jason-sprouse.fly.dev](https://y8-premier-jason-sprouse.fly.dev) | Premium financial dashboard |
| Y8 Server | [y8-server-jason-sprouse.fly.dev](https://y8-server-jason-sprouse.fly.dev) | Agentic API + SIWE auth |
| The Beach | [y8-beach-jason-sprouse.fly.dev](https://y8-beach-jason-sprouse.fly.dev) | XR/VR immersive space |

---

## Platform overview

The Y8 Platform is a four-application suite that converges holographic spatial computing, Web3 wallet identity, and premium financial services.

### y8-app — Holographic Wallet
- Next.js 14 + wagmi + Base Sepolia
- SIWE wallet authentication
- On-chain settings (Y8Settings smart contract)
- Proof of Entropy NFT minting (Y8ProofOfEntropy ERC-721)
- Agent marketplace (`/space/agents`)
- PWA installable (SW v3, deferred updates)

### y8-premier — Premium Financial Command Center
- Vite + React + Express
- Plaid bank connectivity (accounts, transactions, net worth)
- USDC/USDT → SOL/ETH/BTC swap (live CoinGecko pricing)
- Rafiki Interledger global payments
- RSIncomePanel crypto income tracker
- PWA update banner + install counter
- SIWE auth gate + $50 premium access

### y8-server — Agentic API
- NestJS + Socket.IO
- SIWE authentication + JWT
- Agent registry with 4 routing strategies (least-load, nearest, rating, round-robin)
- Real-time WebSocket agent dispatch

### the-beach — XR/VR Space
- NestJS + Babylon.js + WebXR
- Real-time multiplayer (Socket.IO)
- Desktop 3D + VR headset compatible
- PWA installable

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Wallet auth | Sign-In with Ethereum (SIWE / EIP-4361) |
| Blockchain | Base Sepolia (chain ID 84532) |
| Smart contracts | Solidity 0.8.24 — Y8Settings + Y8ProofOfEntropy |
| Frontend (app) | Next.js 14, wagmi, viem |
| Frontend (premier) | Vite, React, Recharts |
| Backend | NestJS, Express, Plaid SDK |
| Financial | Plaid, CoinGecko, Rafiki ILP |
| XR/VR | Babylon.js, WebXR Device API |
| Realtime | Socket.IO |
| Hosting | Fly.io (4 apps, managed containers) |
| CI/CD | GitHub Actions (path-based smart deploys) |
| PWA | Web App Manifest, Service Worker v3 |

---

## Getting started

### Prerequisites
- Node.js 20+
- A wallet (MetaMask or similar)
- Fly.io CLI (`flyctl`)

### Local development

```bash
# y8-app (Next.js — port 3000)
cd y8-app && npm install && npm run dev

# y8-premier (Vite+Express — port 3000)
cd y8-premier && npm install && npm run dev

# y8-server (NestJS — port 3001)
cd y8-server && npm install && npm run start:dev

# the-beach (NestJS+Babylon — port 3000)
cd the-beach && npm install && npm run start:dev
```

### Environment variables

**y8-premier** (add to `y8-premier/.env`):
```
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
SESSION_SECRET=your_session_secret
GEMINI_API_KEY=your_gemini_key
```

### Deploy to Fly.io

```bash
# One app
fly deploy --config y8-premier/fly.toml --strategy immediate

# All apps (CI/CD handles this automatically on push to main)
```

### CI/CD Setup

1. Get your Fly.io token: `fly tokens create org -x 8760h`
2. Add to GitHub: **Settings → Secrets → `FLY_API_TOKEN`**
3. Every `git push main` auto-deploys only changed apps

---

## Smart contracts (Base Sepolia)

| Contract | Purpose |
|----------|---------|
| `Y8Settings` | Per-wallet on-chain settings (6 boolean toggles) |
| `Y8ProofOfEntropy` | ERC-721 NFT minted from device telemetry entropy |

Both contracts are deployed in-browser from the y8-app settings page — no CLI required.

---

## Architecture

```
good-faith/y8-platform (monorepo)
├── y8-app/          Next.js holographic wallet
├── y8-premier/      Vite+Express financial dashboard
├── y8-server/       NestJS agentic API
├── the-beach/       NestJS+Babylon XR space
├── packages/
│   └── contracts/   Y8Settings.sol, Y8ProofOfEntropy.sol
└── .github/
    └── workflows/
        └── deploy.yml   CI/CD for all 4 apps
```

---

## License

MIT © [Good Faith Paradigm](https://github.com/good-faith)
