# GitHub → Fly.io Deployment Setup

## Required GitHub Secret

Just ONE secret needed (vs 4 for GCP):

| Secret | How to get it |
|--------|---------------|
| `FLY_API_TOKEN` | Run: `fly tokens create deploy` |

Add it at: GitHub repo → Settings → Secrets → Actions

## Required GitHub Environments

Settings → Environments:
1. **`staging`** — auto-deploys on push to `staging` branch
2. **`production`** — add Required Reviewers before prod tag deploys

## Deployment Flow

```
# Staging: push to staging branch
git checkout staging && git merge main && git push origin staging
→ All 4 apps deploy in parallel to Fly.io

# Production: tag a release
git tag v1.0.0 && git push origin v1.0.0
→ Requires reviewer approval → deploys to Fly.io
```

## First Deploy (after bootstrap)

```bash
# 1. Bootstrap Fly.io (one time)
bash infra/fly/setup.sh

# 2. Set API URL secret after server deploys
fly secrets set NEXT_PUBLIC_Y8_API_URL=https://y8-server.fly.dev --app y8-web
fly secrets set Y8_API_URL=https://y8-server.fly.dev --app y8-premier
fly secrets set REDIS_URL=$(fly ext upstash redis show y8-redis --json | jq -r '.url') --app y8-server
fly secrets set REDIS_URL=$(fly ext upstash redis show y8-redis --json | jq -r '.url') --app y8-beach
```
