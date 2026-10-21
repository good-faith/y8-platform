# Redis Setup Guide for The Beach

## Quick Setup Steps

### Option 1: Use Vercel KV (Recommended for Production)

1. **Create a Vercel KV Database:**
   ```bash
   # Install Vercel CLI if you haven't
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project
   vercel link
   
   # Create a KV database
   vercel kv create lit-compute-redis
   ```

2. **Get your credentials from Vercel Dashboard:**
   - Go to https://vercel.com/dashboard/stores
   - Select your KV database (`lit-compute-redis`)
   - Click on the `.env.local` tab
   - Copy the environment variables

3. **Update your local `.env` file:**
   ```bash
   REDIS_URL=redis://default:xxxxx@your-region.upstash.io:6379
   KV_REST_API_URL=https://xxxxx.upstash.io
   KV_REST_API_TOKEN=xxxxx
   ```

4. **Set environment variables in Vercel (Production):**
   ```bash
   # These will be automatically added when you link the KV store to your project
   vercel env pull .env.production
   ```

### Option 2: Use Local Redis (Development Only)

1. **Install Redis locally:**
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server
   
   # macOS
   brew install redis
   
   # Start Redis
   redis-server
   ```

2. **Update your `.env` file:**
   ```bash
   REDIS_URL=redis://localhost:6379
   ```

### Option 3: Use Upstash Directly (Alternative)

1. **Create account at https://upstash.com**

2. **Create a new Redis database:**
   - Select region closest to your Vercel deployment
   - Choose the free tier for development

3. **Copy connection details:**
   - Click on your database
   - Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - Copy the `redis://` connection string

4. **Update `.env` with Upstash credentials**

## Verify Redis Connection

After setting up Redis, restart your dev server and check the logs:

```bash
# Kill existing processes
pkill -f "nest start"

# Start server
npm run start:dev

# Watch logs - you should see:
# ✅ Connected to Redis
# (instead of "⚠️ Redis URL not configured")
```

## Test Redis Functionality

```bash
# Register a node (should persist in Redis)
curl -X POST http://localhost:3001/lit-compute/nodes/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "capacity": 100,
    "reputation": 95
  }'

# Send a heartbeat
curl -X POST http://localhost:3001/lit-compute/nodes/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "<node-id-from-register>",
    "capacity": 100,
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }'

# Check node status (should return data from Redis)
curl http://localhost:3001/lit-compute/nodes/<node-id>/status
```

## Environment Variables Reference

```bash
# Primary Redis connection (used by ioredis client)
REDIS_URL=redis://default:password@host:6379

# Vercel KV REST API (alternative access method)
KV_REST_API_URL=https://xxxxx.upstash.io
KV_REST_API_TOKEN=xxxxx
KV_REST_API_READ_ONLY_TOKEN=xxxxx  # Optional, for read-only access
```

## Troubleshooting

### Error: "Redis URL not configured"
- Check that `REDIS_URL` is set in your `.env` file
- Restart your dev server after updating `.env`

### Error: "ECONNREFUSED" or "Connection timeout"
- Verify Redis is running (local) or credentials are correct (cloud)
- Check firewall/network settings
- Verify the Redis URL format is correct

### Error: "NOAUTH Authentication required"
- Your Redis requires a password
- Update REDIS_URL to: `redis://default:your-password@host:6379`

### In-memory fallback is active but shouldn't be
- Verify `REDIS_URL` environment variable is loaded
- Check `.env` file location (must be in project root)
- Restart the application

## Production Deployment

When deploying to Vercel:

1. **Link KV store to your project:**
   ```bash
   vercel env add REDIS_URL production
   # Paste the redis:// URL from your KV dashboard
   ```

2. **Or link via Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add `REDIS_URL` with your production Redis URL
   - Redeploy your application

3. **Verify in production logs:**
   - Check Vercel deployment logs for "✅ Connected to Redis"
   - No warnings about "in-memory fallback"

## Next Steps

After Redis is configured:
- [ ] Test node registration persistence
- [ ] Test job queue operations
- [ ] Test session management
- [ ] Monitor Redis memory usage
- [ ] Set up Redis backups (production)
- [ ] Configure Redis TTL policies if needed
