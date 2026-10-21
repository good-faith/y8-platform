# PKP Authentication & Hierarchy System

## Overview

The Beach implements a **two-tier PKP authentication system**:

1. **Main PKPs** - Human-owned, authenticated via WebAuthn/Social login
2. **Sub-PKPs** - AI agents that work autonomously for main PKPs

This architecture ensures all agents have proper authorization while enabling autonomous AI operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   PKP HIERARCHY SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HUMAN USER (Y8 App / The Beach)                         │  │
│  │  ↓ Authenticates via WebAuthn/Social Login               │  │
│  │  ↓ Google, Discord, GitHub, Twitter, Wallet              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MAIN PKP (Human-Controlled)                             │  │
│  │  ✓ Authenticated via Lit Protocol                        │  │
│  │  ✓ Cryptographic proof of ownership                      │  │
│  │  ✓ Controls all sub-PKPs                                 │  │
│  │  ✓ Approves critical actions                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌─────────────────┬─────────────────┬──────────────────────┐  │
│  │   Sub-PKP #1    │   Sub-PKP #2    │   Sub-PKP #3         │  │
│  │   Development   │   Sales         │   Support            │  │
│  │                 │                 │                      │  │
│  │   - Code gen    │   - Lead qual   │   - Tickets          │  │
│  │   - Git commits │   - Proposals   │   - Chat             │  │
│  │   - Deploy      │   - Contracts   │   - Escalation       │  │
│  │   - Testing     │   - Follow-up   │   - Resolution       │  │
│  └─────────────────┴─────────────────┴──────────────────────┘  │
│                                                                  │
│  All sub-PKPs request approval for critical actions             │
│  Main PKP approves/rejects via Y8 App or The Beach dashboard    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### 1. User Registration/Login (Y8 App)

```typescript
// User logs in via Lit Protocol in Y8 App
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

const litAuthClient = new LitAuthClient({
  litRelayConfig: {
    relayApiKey: 'your-relay-api-key',
  },
});

// Authenticate with Google (or Discord, GitHub, etc.)
const provider = litAuthClient.initProvider(ProviderType.Google);
await provider.signIn();

const authMethod = await provider.getAuthMethod();
const pkp = await provider.mintPKPThroughRelayer(authMethod);

// Send to The Beach backend
const response = await fetch('http://localhost:3000/pkp/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'google',
    providerId: authMethod.userId,
    email: authMethod.email,
    name: authMethod.name,
    accessToken: authMethod.accessToken,
  }),
});

const { user } = await response.json();
// user.mainPKP.address is the authenticated PKP
```

### 2. Create Sub-PKPs (The Beach)

```typescript
// Main PKP creates a sub-PKP for development work
const response = await fetch('http://localhost:3000/pkp/sub', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-pkp-address': user.mainPKP.address, // Main PKP authenticates
  },
  body: JSON.stringify({
    purpose: 'development',
    capabilities: ['code-generation', 'git-commits', 'testing', 'deployment'],
    autonomy: 'medium',
    spendingLimit: 100, // Max $100 for gas fees
    approvalRequired: ['deploy', 'spend'],
  }),
});

const { subPKP } = await response.json();
// subPKP.address is the AI agent PKP
```

### 3. Sub-PKP Works Autonomously

```typescript
// Sub-PKP performs allowed actions automatically
const devAgent = new PKPTaskManagerService(subPKP);

// These actions are autonomous (no approval needed)
await devAgent.generateCode({ description: 'Create user service' });
await devAgent.runTests({ testSuite: 'unit' });
await devAgent.commitCode({ message: 'feat: add user service' });

// These actions require main PKP approval
const canDeploy = await fetch(`http://localhost:3000/pkp/sub/${subPKP.address}/can-perform`, {
  method: 'POST',
  body: JSON.stringify({ action: 'deploy' }),
});

if (canDeploy.requiresApproval) {
  // Request approval from main PKP
  const approval = await fetch('http://localhost:3000/pkp/approval/request', {
    method: 'POST',
    body: JSON.stringify({
      subPKPAddress: subPKP.address,
      action: 'deploy',
      details: {
        environment: 'production',
        service: 'user-api',
        estimatedCost: 25,
      },
      ttlMinutes: 60,
    }),
  });
}
```

### 4. Main PKP Approves (Y8 App Dashboard)

```typescript
// Main PKP views pending approvals in Y8 App
const response = await fetch('http://localhost:3000/pkp/approval/pending', {
  headers: { 'x-pkp-address': user.mainPKP.address },
});

const { approvals } = await response.json();

// Display approval requests in UI
approvals.forEach((request) => {
  console.log(`${request.subPKP} wants to ${request.action}`);
  console.log(`Details: ${JSON.stringify(request.details)}`);
});

// User approves deployment
await fetch(`http://localhost:3000/pkp/approval/${requestId}/respond`, {
  method: 'POST',
  headers: { 'x-pkp-address': user.mainPKP.address },
  body: JSON.stringify({ approved: true }),
});

// Sub-PKP now proceeds with deployment
```

## API Endpoints

### Authentication

#### POST `/pkp/auth/login`
Authenticate user and get/create main PKP
```json
{
  "provider": "google",
  "providerId": "1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "accessToken": "ya29.a0..."
}
```

Response:
```json
{
  "user": {
    "userId": "user_1699...",
    "mainPKP": {
      "address": "0x1234...",
      "publicKey": "0x04..."
    },
    "tier": "freemium"
  },
  "message": "Welcome! Your main PKP has been created."
}
```

#### GET `/pkp/auth/me`
Get authenticated user info
```bash
curl -H "x-pkp-address: 0x1234..." http://localhost:3000/pkp/auth/me
```

### Sub-PKP Management

#### POST `/pkp/sub`
Create a sub-PKP for autonomous work
```json
{
  "purpose": "development",
  "capabilities": ["code-generation", "git-commits", "testing"],
  "autonomy": "medium",
  "spendingLimit": 100,
  "approvalRequired": ["deploy", "spend"]
}
```

#### GET `/pkp/sub`
List all sub-PKPs for main PKP
```bash
curl -H "x-pkp-address: 0x1234..." http://localhost:3000/pkp/sub
```

#### POST `/pkp/sub/:address/revoke`
Revoke a sub-PKP
```bash
curl -X POST -H "x-pkp-address: 0x1234..." \
  http://localhost:3000/pkp/sub/0xSUB5678.../revoke
```

### Approval System

#### POST `/pkp/approval/request`
Sub-PKP requests approval
```json
{
  "subPKPAddress": "0xSUB5678...",
  "action": "deploy",
  "details": {
    "environment": "production",
    "estimatedCost": 25
  },
  "ttlMinutes": 60
}
```

#### GET `/pkp/approval/pending`
Get pending approvals for main PKP
```bash
curl -H "x-pkp-address: 0x1234..." http://localhost:3000/pkp/approval/pending
```

#### POST `/pkp/approval/:requestId/respond`
Approve or reject request
```json
{
  "approved": true
}
```

### Hierarchy & Verification

#### GET `/pkp/hierarchy`
Get full PKP hierarchy
```bash
curl -H "x-pkp-address: 0x1234..." http://localhost:3000/pkp/hierarchy
```

#### GET `/pkp/verify/:address`
Verify PKP type (main or sub)
```bash
curl http://localhost:3000/pkp/verify/0xSUB5678...
```

Response:
```json
{
  "address": "0xSUB5678...",
  "type": "sub",
  "parentPKP": "0x1234..."
}
```

## Integration with Y8 App

### Authentication Flow

```typescript
// src/app/auth/page.tsx
import { useLitAuth } from '@/hooks/useLitAuth';

export default function AuthPage() {
  const { signIn, user } = useLitAuth();

  const handleGoogleLogin = async () => {
    // 1. Authenticate with Lit Protocol
    const pkp = await signIn('google');
    
    // 2. Register/login with The Beach
    const response = await fetch('http://localhost:3000/pkp/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'google',
        providerId: pkp.userId,
        email: pkp.email,
        name: pkp.name,
      }),
    });
    
    const { user } = await response.json();
    
    // 3. Store main PKP address for future requests
    localStorage.setItem('mainPKP', user.mainPKP.address);
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google (via Lit Protocol)
    </button>
  );
}
```

### Dashboard with Sub-PKPs

```typescript
// src/app/dashboard/page.tsx
export default function Dashboard() {
  const [subPKPs, setSubPKPs] = useState([]);
  const mainPKP = localStorage.getItem('mainPKP');

  useEffect(() => {
    fetch('http://localhost:3000/pkp/sub', {
      headers: { 'x-pkp-address': mainPKP },
    })
      .then((r) => r.json())
      .then((data) => setSubPKPs(data.subPKPs));
  }, []);

  const createDevAgent = async () => {
    const response = await fetch('http://localhost:3000/pkp/sub', {
      method: 'POST',
      headers: { 'x-pkp-address': mainPKP },
      body: JSON.stringify({
        purpose: 'development',
        capabilities: ['code-generation', 'testing'],
        autonomy: 'medium',
      }),
    });
    
    const { subPKP } = await response.json();
    setSubPKPs([...subPKPs, subPKP]);
  };

  return (
    <div>
      <h1>Your AI Agents</h1>
      <button onClick={createDevAgent}>Create Dev Agent</button>
      
      {subPKPs.map((sub) => (
        <AgentCard key={sub.address} agent={sub} />
      ))}
    </div>
  );
}
```

### Approval Dashboard

```typescript
// src/app/approvals/page.tsx
export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const mainPKP = localStorage.getItem('mainPKP');

  useEffect(() => {
    // Poll for pending approvals
    const interval = setInterval(() => {
      fetch('http://localhost:3000/pkp/approval/pending', {
        headers: { 'x-pkp-address': mainPKP },
      })
        .then((r) => r.json())
        .then((data) => setApprovals(data.approvals));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleApproval = async (requestId: string, approved: boolean) => {
    await fetch(`http://localhost:3000/pkp/approval/${requestId}/respond`, {
      method: 'POST',
      headers: { 'x-pkp-address': mainPKP },
      body: JSON.stringify({ approved }),
    });
    
    // Refresh approvals
    setApprovals(approvals.filter((a) => a.id !== requestId));
  };

  return (
    <div>
      <h1>Pending Approvals</h1>
      {approvals.length === 0 && <p>No pending approvals</p>}
      
      {approvals.map((approval) => (
        <div key={approval.id}>
          <h3>{approval.action}</h3>
          <p>Sub-PKP: {approval.subPKP}</p>
          <pre>{JSON.stringify(approval.details, null, 2)}</pre>
          
          <button onClick={() => handleApproval(approval.id, true)}>
            ✅ Approve
          </button>
          <button onClick={() => handleApproval(approval.id, false)}>
            ❌ Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Autonomy Levels

### Low Autonomy
- Sub-PKP can only perform read operations
- All write operations require approval
- Good for testing new agents

### Medium Autonomy (Default)
- Sub-PKP can perform routine tasks automatically
- Critical operations (deploy, spend) require approval
- Recommended for most use cases

### High Autonomy
- Sub-PKP can perform most operations automatically
- Only high-risk operations require approval
- Use with trusted, well-tested agents

## Delegation Rules

Each sub-PKP can have custom delegation rules:

```typescript
const delegationRule = {
  action: 'deploy',
  maxAmount: 50, // Max $50 gas fees
  requiresApproval: true,
  autoApprove: false, // Could auto-approve if amount < $10
  conditions: {
    environment: ['staging', 'development'], // Not production
    timeWindow: '09:00-17:00', // Only during business hours
  },
};
```

## Security Considerations

### 1. Main PKP Protection
- Main PKP never exposed to AI agents
- Only human has access to main PKP private key
- WebAuthn/Social login provides strong authentication

### 2. Sub-PKP Isolation
- Each sub-PKP has limited capabilities
- Spending limits prevent runaway costs
- Approval system for critical actions
- Can be revoked instantly

### 3. Approval Expiration
- Approval requests expire after TTL
- Prevents stale approvals from being used
- Default: 60 minutes

### 4. Audit Trail
- All actions logged with timestamps
- Event emissions for monitoring
- Can track which sub-PKP did what

## Events

```typescript
// Listen to PKP auth events
eventEmitter.on('user.registered', ({ user }) => {
  console.log(`New user: ${user.email} -> PKP: ${user.mainPKP.address}`);
});

eventEmitter.on('subpkp.created', ({ subPKP, mainPKP }) => {
  console.log(`New sub-PKP: ${subPKP.address} for ${mainPKP}`);
});

eventEmitter.on('approval.requested', ({ request }) => {
  // Send notification to main PKP owner
  notifyUser(request.mainPKP, `Approval needed: ${request.action}`);
});

eventEmitter.on('approval.responded', ({ request }) => {
  console.log(`Approval ${request.status}: ${request.id}`);
});

eventEmitter.on('subpkp.revoked', ({ subPKP }) => {
  console.log(`Sub-PKP revoked: ${subPKP.address}`);
});
```

## Best Practices

### 1. Create Purpose-Specific Sub-PKPs
Don't use one sub-PKP for everything. Create specialized agents:
- Development sub-PKP for code work
- Sales sub-PKP for customer interactions
- Support sub-PKP for tickets

### 2. Start with Low Autonomy
Test new sub-PKPs with low autonomy first. Increase as you build trust.

### 3. Set Spending Limits
Always set spending limits to prevent unexpected costs.

### 4. Review Approvals Regularly
Check pending approvals at least daily. Set up notifications.

### 5. Revoke Unused Sub-PKPs
Clean up sub-PKPs that are no longer needed.

### 6. Monitor Activity
Track what sub-PKPs are doing. Review logs regularly.

## Environment Variables

```bash
# Lit Protocol Configuration
LIT_NETWORK=cayenne
LIT_RELAY_API_KEY=your_relay_api_key

# Social Login Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# GitHub OAuth (for GitHub social login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Next Steps

1. **Setup Lit Protocol Auth** in Y8 App
2. **Implement login flow** with social providers
3. **Create dashboard** for sub-PKP management
4. **Build approval UI** for pending requests
5. **Test with development sub-PKPs**
6. **Monitor and iterate**

---

**🔐 Security First**: All agents are authenticated. All critical actions require approval. Complete audit trail.
