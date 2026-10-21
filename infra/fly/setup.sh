#!/bin/bash
# Y8 Fly.io Bootstrap — run ONCE
# Usage: bash infra/fly/setup.sh
# Requires: flyctl installed and authenticated (fly auth login)

set -e

PRIMARY_REGION="sea"

echo "🚀 Y8 Fly.io Bootstrap"
echo "Region: $PRIMARY_REGION"
echo ""

# Create apps
echo "Creating Fly.io apps..."
fly apps create y8-server  --org personal 2>/dev/null || echo "y8-server already exists"
fly apps create y8-beach   --org personal 2>/dev/null || echo "y8-beach already exists"
fly apps create y8-web     --org personal 2>/dev/null || echo "y8-web already exists"
fly apps create y8-premier --org personal 2>/dev/null || echo "y8-premier already exists"

# Create Postgres cluster (shared by all apps)
echo ""
echo "Creating Postgres cluster..."
fly postgres create \
  --name y8-postgres \
  --region $PRIMARY_REGION \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 10 \
  --org personal 2>/dev/null || echo "y8-postgres already exists"

# Attach Postgres to server app
echo ""
echo "Attaching Postgres to y8-server..."
fly postgres attach y8-postgres --app y8-server 2>/dev/null || echo "Already attached"

# Create Redis via Upstash extension
echo ""
echo "Creating Redis (Upstash)..."
fly ext upstash redis create \
  --name y8-redis \
  --region $PRIMARY_REGION \
  --org personal 2>/dev/null || echo "y8-redis already exists"

# Set secrets for y8-server
echo ""
echo "Setting secrets..."
JWT_SECRET=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 32)

fly secrets set JWT_SECRET="$JWT_SECRET" --app y8-server
fly secrets set NEXTAUTH_SECRET="$NEXTAUTH_SECRET" --app y8-web

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. fly deploy --config y8-server/fly.toml"
echo "  2. fly deploy --config the-beach/fly.toml"
echo "  3. fly deploy --config y8-app/fly.toml"
echo "  4. fly deploy --config y8-premier/fly.toml"
echo ""
echo "Or push to GitHub staging branch to auto-deploy via Actions."
