# Y8 Platform — Fly.io Infrastructure

## Architecture

```
GitHub Actions (FLY_API_TOKEN)
    │
    ├── flyctl deploy → y8-server  (NestJS API + WebSockets)  → api.y8.app
    ├── flyctl deploy → y8-beach   (NestJS XR + Socket.IO)    → xr.y8.app  
    ├── flyctl deploy → y8-web     (Next.js SSR)               → app.y8.app
    └── flyctl deploy → y8-premier (Vite dashboard)            → premier.y8.app
                              │
                    ┌─────────┴──────────┐
               Fly Postgres         Upstash Redis
              (persistent DB)      (sessions + pub/sub)
```

## One-time Setup

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh   # Mac/Linux
# or: iwr https://fly.io/install.ps1 -useb | iex  (Windows PowerShell)

# Login
fly auth login

# Bootstrap all apps + database + redis
bash infra/fly/setup.sh
```

## Manual Deploy

```bash
# Deploy a single app
fly deploy --config y8-server/fly.toml
fly deploy --config the-beach/fly.toml
fly deploy --config y8-app/fly.toml
fly deploy --config y8-premier/fly.toml

# Deploy all (staging)
powershell -File stage-fly.ps1
```

## Secrets

```bash
# View secrets for an app
fly secrets list --app y8-server

# Set a secret
fly secrets set MY_SECRET=value --app y8-server

# Set the Y8 server API URL in the frontend apps
fly secrets set NEXT_PUBLIC_Y8_API_URL=https://y8-server.fly.dev --app y8-web
fly secrets set Y8_API_URL=https://y8-server.fly.dev --app y8-premier
```

## Monitoring

```bash
# Logs
fly logs --app y8-server
fly logs --app y8-beach

# Status
fly status --app y8-server

# SSH into a machine
fly ssh console --app y8-server
```

## Costs (approximate)

| Resource | Monthly |
|----------|---------|
| 4 × shared-cpu-1x VMs | ~$15 |
| Fly Postgres (1 node) | ~$7 |
| Upstash Redis | Free tier |
| **Total** | **~$22/month** |

Scale up: change `memory_mb` and `cpus` in fly.toml, `fly deploy`.
