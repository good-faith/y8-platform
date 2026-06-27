# y8-server

**Modular NestJS backend for the Y8 platform — Base chain, SIWE auth, AI agents.**

## Architecture

```
src/
├── auth/          SIWE + JWT auth (Base Mainnet/Sepolia)
├── agents/        AI agent orchestration, sessions, WebSocket gateway
├── compute/       Async job queue (in-process, BullMQ-ready)
├── state/         Content-addressed state (SHA-256 CID, Redis-ready)
└── blockchain/    Base chain client (viem) — balances, basenames, verification
```

## Auth Flow (SIWE on Base)

```
1. GET  /api/v1/auth/nonce          → { nonce, expiresAt }
2. Sign SIWE message in wallet (Base chainId: 8453 or 84532)
3. POST /api/v1/auth/siwe/verify    → { accessToken, user }
4. Use: Authorization: Bearer <accessToken>
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/auth/nonce` | Public | Get SIWE nonce |
| POST | `/auth/siwe/verify` | Public | Verify SIWE signature → JWT |
| GET | `/auth/me` | JWT | Current user profile |
| GET | `/agents` | JWT | List all agents |
| POST | `/agents` | JWT | Register an agent |
| GET | `/agents/dashboard` | JWT | Platform dashboard |
| GET | `/agents/leaderboard` | JWT | Agent performance ranking |
| GET | `/agents/:id` | JWT | Get agent by ID |
| PUT | `/agents/:id/status` | JWT | Update agent status |
| DELETE | `/agents/:id` | JWT | Decommission agent |
| POST | `/agents/route` | JWT | Route a service request |
| POST | `/compute/jobs` | JWT | Enqueue async job |
| GET | `/compute/jobs` | JWT | List jobs |
| GET | `/compute/jobs/:id` | JWT | Poll job status |
| POST | `/state` | JWT | Store content-addressed state |
| GET | `/state/:cid` | JWT | Fetch by CID |
| GET | `/chain/block` | JWT | Base block number |
| GET | `/chain/balance/:address` | JWT | Base wallet balance |
| GET | `/chain/resolve/:name` | JWT | Resolve basename |

## WebSocket Events

Connect to `ws://localhost:3001` (Socket.IO)

**Emit:**
- `join` → `{ room: string }` — join XR scene room
- `move` → `{ userId, position, rotation }` — XR position sync
- `signal` → `{ to, offer/answer/candidate }` — WebRTC signaling
- `scene.update` → `{ ...patch }` — scene state patch

**Listen:**
- `welcome`, `room.joined`, `user.joined`, `user.left`, `user.moved`
- `agent.registered`, `agent.status_change`
- `session.created`, `session.completed`, `transaction.added`
- `job.queued`, `job.running`, `job.completed`, `job.failed`

## Quick Start

```bash
cp .env.example .env.local
# Set JWT_SECRET (required): openssl rand -hex 64

npm run start:dev
# → http://localhost:3001/api/v1
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | JWT signing secret (64-char hex) |
| `BASE_RPC_URL` | Optional | Base Mainnet RPC (default: public endpoint) |
| `BASE_SEPOLIA_RPC_URL` | Optional | Base Sepolia RPC |
| `CDP_API_KEY_NAME` | Optional | Coinbase CDP for agent wallet creation |
| `CDP_API_KEY_PRIVATE_KEY` | Optional | Coinbase CDP private key |

## Supported Chains

| Chain | ID | Status |
|-------|----|--------|
| Base Mainnet | 8453 | ✅ Supported |
| Base Sepolia | 84532 | ✅ Supported |

## What Replaced What

| Old (`the-beach`) | New (`y8-server`) |
|---|---|
| Lit Protocol PKP auth | SIWE + JWT on Base |
| PKP address as agent ID | UUID + Base wallet address |
| Lit Actions compute | In-process job queue (BullMQ-ready) |
| IPLD content addressing | SHA-256 CID + in-memory/Redis KV |
| `pkp-live.gateway.ts` + `events.gateway.ts` | Single `agents.gateway.ts` |
| `@babylonjs/core` on server | Scene *state only* — rendering on frontend |
