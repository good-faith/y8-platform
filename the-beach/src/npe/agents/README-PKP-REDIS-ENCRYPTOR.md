# PKP Redis Config Encryptor Agent

## 🎯 Mission

This PKP (Programmable Key Pair) agent securely encrypts Redis Vercel KV credentials using Lit Protocol's encryption, ensuring that sensitive configuration can be:

1. ✅ Safely stored in version control (encrypted)
2. ✅ Shared between team members with authorized PKP wallets
3. ✅ Decrypted only by authorized parties
4. ✅ Used across both The Beach and Y8 App environments

## 🔐 Security Benefits

- **End-to-End Encryption**: Redis credentials encrypted with Lit Protocol
- **Access Control**: Only specified PKP wallets can decrypt
- **Audit Trail**: Encryption timestamp and network recorded
- **No Plaintext Storage**: Never store sensitive data unencrypted
- **Cross-App Compatibility**: Same encrypted config works for both apps

## 📦 Installation

### The Beach (NestJS)

```bash
cd /home/goodfaith/projects/xr/babylon
npm install @lit-protocol/lit-node-client @lit-protocol/constants ethers
```

### Y8 App (Next.js)

```bash
cd /home/goodfaith/projects/y8-app
npm install @lit-protocol/lit-node-client @lit-protocol/constants ethers
```

## 🚀 Usage

### Step 1: Set Your PKP Wallet Address

```bash
export PKP_PUBLIC_KEY="0xYourPKPWalletAddressHere"
```

### Step 2: Create Redis Configuration

Create a file `redis-config-plaintext.json` (DO NOT COMMIT THIS):

```json
{
  "host": "your-redis.upstash.io",
  "port": 6379,
  "password": "your-redis-password",
  "username": "default",
  "tls": true,
  "kvRestApiUrl": "https://your-kv.upstash.io",
  "kvRestApiToken": "AYxxxxxxxxxxxxxxxxxxxxx",
  "kvRestApiReadOnlyToken": "Aoxxxxxxxxxxxxxxxxxxxxx"
}
```

### Step 3: Run the Encryption Agent

```typescript
import { PKPRedisConfigEncryptor } from './src/npe/agents/pkp-redis-encryptor';

async function encryptRedisConfig() {
  const agent = new PKPRedisConfigEncryptor(process.env.PKP_PUBLIC_KEY);
  await agent.init();

  // Load your plaintext config
  const config = await agent.loadEncryptedConfig('./redis-config-plaintext.json');
  
  // Encrypt it
  const encrypted = await agent.encryptRedisConfig(config);
  
  // Save encrypted version (SAFE TO COMMIT)
  await agent.saveEncryptedConfig(encrypted, './redis-config.encrypted.json');
  
  console.log('✅ Redis config encrypted and saved!');
  await agent.disconnect();
}

encryptRedisConfig();
```

### Step 4: Use Encrypted Config in Applications

#### The Beach (.env)

```bash
# Run the agent to generate .env content
node scripts/decrypt-redis-config.js --app=beach
```

Output:
```env
REDIS_HOST=your-redis.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_USERNAME=default
REDIS_TLS=true
KV_REST_API_URL=https://your-kv.upstash.io
KV_REST_API_TOKEN=AYxxxxxxxxxxxxxxxxxxxxx
KV_REST_API_READ_ONLY_TOKEN=Aoxxxxxxxxxxxxxxxxxxxxx
```

#### Y8 App (.env.local)

```bash
# Run the agent to generate .env.local content
node scripts/decrypt-redis-config.js --app=y8
```

Output: Same environment variables as The Beach

## 🤖 Agent Capabilities

### 1. Encrypt Redis Configuration

```typescript
const encrypted = await agent.encryptRedisConfig({
  host: 'redis.upstash.io',
  port: 6379,
  password: 'secret',
  username: 'default',
  tls: true,
});
```

### 2. Decrypt Redis Configuration

```typescript
agent.setAuthSig(yourAuthSignature);
const config = await agent.decryptRedisConfig(encryptedData);
```

### 3. Generate Environment Files

```typescript
const beachEnv = agent.generateBeachEnvVars(config);
const y8Env = agent.generateY8EnvVars(config);
```

### 4. Save/Load Encrypted Files

```typescript
await agent.saveEncryptedConfig(encrypted, './config.encrypted.json');
const loaded = await agent.loadEncryptedConfig('./config.encrypted.json');
```

## 🔑 Access Control

The agent uses Lit Protocol's Access Control Conditions (ACC) to restrict decryption:

```typescript
const accessControlConditions = [
  {
    contractAddress: '',
    standardContractType: '',
    chain: 'ethereum',
    method: '',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '=',
      value: 'YOUR_PKP_WALLET_ADDRESS', // Only this wallet can decrypt
    },
  },
];
```

## 📋 Workflow for Team

### Initial Setup (One-Time)

1. **Admin** creates plaintext Redis config
2. **Admin** runs encryption agent with their PKP
3. **Admin** commits `redis-config.encrypted.json` to repo
4. **Admin** shares PKP private key securely (or uses multi-sig)

### Developer Usage (Ongoing)

1. **Developer** clones repo
2. **Developer** has access to PKP wallet
3. **Developer** runs decryption script
4. **Developer** gets environment variables automatically

### Updating Config

1. **Admin** updates plaintext config
2. **Admin** re-runs encryption agent
3. **Admin** commits new `redis-config.encrypted.json`
4. **Developers** pull latest and re-run decryption

## 🏗️ Integration with The Beach

### Update Redis Module

```typescript
// src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_USERNAME')}:${config.get('REDIS_PASSWORD')}@${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
        options: {
          tls: config.get('REDIS_TLS') === 'true' ? {} : undefined,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
```

### Update WebSocket Gateway

```typescript
// src/events/events.gateway.ts
constructor(
  @InjectRedis() private readonly redis: Redis,
) {
  // Subscribe to Redis channels for pub/sub
  this.redis.subscribe('lit-compute:jobs', 'lit-compute:nodes');
}
```

## 🏗️ Integration with Y8 App

### Create Redis Client

```typescript
// lib/redis-client.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const redisReadOnly = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_READ_ONLY_TOKEN!,
});
```

### Use in API Routes

```typescript
// app/api/cache/route.ts
import { redis } from '@/lib/redis-client';

export async function GET() {
  const data = await redis.get('some-key');
  return Response.json({ data });
}
```

## 🧪 Testing

### Test Encryption/Decryption

```bash
cd /home/goodfaith/projects/xr/babylon
npm run test:pkp-redis-agent
```

### Test Redis Connection (The Beach)

```bash
npm run start:dev
# Should see: "✅ Connected to Redis"
# Not: "ERROR: Failed to subscribe to Redis channels"
```

### Test Redis Connection (Y8 App)

```bash
cd /home/goodfaith/projects/y8-app
npm run dev
# Test WebSocket at http://localhost:3000/lit-compute/dashboard
```

## 📊 Status After Setup

### Before PKP Agent

```
❌ Redis credentials in plaintext .env files
❌ Cannot safely commit configuration
❌ Manual sharing of secrets via Slack/email
❌ Risk of credential exposure
```

### After PKP Agent

```
✅ Redis credentials encrypted with Lit Protocol
✅ Safe to commit redis-config.encrypted.json
✅ Automated decryption for authorized developers
✅ Full audit trail of who accessed what
```

## 🚨 Security Best Practices

1. ✅ **Never commit** `redis-config-plaintext.json`
2. ✅ **Always commit** `redis-config.encrypted.json`
3. ✅ **Rotate PKP keys** every 90 days
4. ✅ **Use separate configs** for dev/staging/production
5. ✅ **Audit decryption logs** monthly
6. ✅ **Revoke access** when team members leave

## 🔗 Next Steps

1. Install Lit Protocol dependencies (see Installation above)
2. Get your Vercel KV Redis credentials
3. Run the encryption agent
4. Update both apps with encrypted config
5. Test Redis connections
6. Verify WebSocket features work

## 📚 Documentation Links

- [Lit Protocol Docs](https://developer.litprotocol.com/)
- [Vercel KV Redis](https://vercel.com/docs/storage/vercel-kv)
- [Upstash Redis](https://upstash.com/docs/redis)
- [NestJS Redis Module](https://github.com/nestjs/ioredis)

---

**Agent Status**: 🟢 Ready to deploy  
**Task Assigned**: ✅ Encrypt Redis config as secure key  
**Apps**: The Beach + Y8 App  
**Security**: Lit Protocol PKP encryption
