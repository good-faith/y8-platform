# 🎯 Lit Compute Network - Quick Start

## What Is This?

**Lit Compute Network** lets you earn cryptocurrency by sharing your computer's CPU power to process Lit Protocol encryption operations.

Think: **"Mining" but for privacy-preserving cryptography instead of proof-of-work**

---

## 💰 Why Run a Node?

### Earnings Potential

| Setup | Daily Earnings | Monthly | Yearly |
|-------|----------------|---------|--------|
| **Home PC** (4 cores, 8hrs) | $5 | $150 | $1,800 |
| **Always-On PC** (4 cores, 24/7) | $15 | $450 | $5,400 |
| **Gaming Rig** (16 cores, 24/7) | $60 | $1,800 | $21,600 |
| **Small Server** (64 cores, 24/7) | $240 | $7,200 | $86,400 |

*Estimates based on network load and competitive rates*

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Desktop App (Easiest)

```bash
# Download from GitHub releases
# Windows: LitCompute-Setup.exe
# Mac: LitCompute.dmg
# Linux: LitCompute.AppImage

# Install and run
# Set your wallet address
# Start earning!
```

### Option 2: CLI (Advanced)

```bash
# Install Node.js 18+ first
npm install -g @lit-compute/node

# Initialize with your wallet
lit-compute init --wallet 0xYourWalletAddress

# Start node
lit-compute start

# Check earnings
lit-compute stats
```

### Option 3: Docker (Servers)

```bash
# Pull image
docker pull litcompute/node:latest

# Run node
docker run -d \
  --name lit-compute \
  -e WALLET_ADDRESS=0xYour... \
  -e CPU_THREADS=4 \
  litcompute/node:latest

# View logs
docker logs -f lit-compute
```

---

## 🔐 What Jobs Does It Process?

Your node performs **cryptographic operations** for apps using Lit Protocol:

1. **Encryption** - Encrypt data with access control
2. **Decryption** - Decrypt data (if user has access)
3. **PKP Signatures** - Generate signatures with Programmable Key Pairs
4. **Session Keys** - Derive encryption keys for sessions

**Privacy Guarantee:** You never see the actual data being encrypted/decrypted, only the encrypted versions.

---

## 💡 How It Works

```
1. Apps submit encryption jobs → Lit Compute Network
2. Network distributes jobs to → Available nodes (yours!)
3. Your node processes job → Returns encrypted result
4. Smart contract verifies → Pays you in crypto
```

**Example Job:**
- The Beach NPE agent needs to sign a transaction
- Job sent to 3 nodes (including yours)
- All 3 nodes produce same signature
- Consensus reached → You get paid 0.0001 ETH
- Takes ~2 seconds

---

## 📊 Dashboard

Access real-time stats at: `http://localhost:8080`

**See:**
- 💰 Total earnings (hourly, daily, monthly)
- 📈 Jobs completed
- ⭐ Reputation score
- 🔥 Current hashrate
- 📊 Network statistics

---

## ⚙️ Configuration

Edit `~/.lit-compute/config.json`:

```json
{
  "wallet": "0xYourWalletAddress",
  "cpuThreads": 4,
  "maxMemory": "2GB",
  "autoAcceptJobs": true,
  "minimumReward": 0.00001,
  "reputationThreshold": 500,
  "network": "mainnet"
}
```

**Key Settings:**
- `cpuThreads` - How many cores to use (1-64)
- `maxMemory` - RAM limit
- `minimumReward` - Don't accept jobs paying less than this
- `autoAcceptJobs` - Automatically process jobs (recommended)

---

## 🛡️ Security

### Is My Computer Safe?

✅ **Yes!** The node software:
- Runs in sandboxed environment
- Only processes cryptographic operations
- Cannot access your files
- Open source (verify the code)
- No admin/root privileges required

### Privacy

✅ **Your node NEVER sees:**
- Plaintext data being encrypted
- User identities
- Content of messages

✅ **Your node ONLY sees:**
- Encrypted ciphertext
- Public keys
- Access control conditions (e.g., "only owner can decrypt")

---

## 🎯 Reputation System

Build reputation by completing jobs correctly:

| Score | Status | Perks |
|-------|--------|-------|
| 0-200 | Beginner | Basic jobs |
| 200-500 | Trusted | More jobs, higher rewards |
| 500-800 | Veteran | Priority job assignment |
| 800+ | Elite | Premium jobs, 2x rewards |

**How to increase reputation:**
- ✅ Complete jobs correctly
- ✅ Stay online (uptime matters)
- ✅ Fast response times
- ✅ Long-term participation

**What decreases reputation:**
- ❌ Incorrect results
- ❌ Timeout on jobs
- ❌ Going offline frequently

---

## 💸 Withdraw Earnings

**Automatic:**
- Earnings sent directly to your wallet
- No minimum withdrawal
- Gas fees paid by network

**Manual:**
```bash
# Check balance
lit-compute balance

# Withdraw to wallet
lit-compute withdraw --all

# Or specific amount
lit-compute withdraw --amount 0.5
```

---

## 🤝 Integration with The Beach

If you're running NPE agents on The Beach, you can:

1. **Earn twice** - Run compute node + NPE agents
2. **Lower costs** - Your agents use your own node
3. **Better privacy** - Keep data in-house

```typescript
// Configure NPE to use local node
const npe = new NPEAgent({
  pkp: myPKP,
  computeNode: 'http://localhost:8080' // Use your own node
});

// Now your agent's crypto operations are free!
```

---

## 📈 Network Stats (Live)

**Current Network (Example):**
- 🌍 Active Nodes: 12,450
- ⚡ Jobs/Day: 1.2M
- 💰 Daily Rewards: $150K
- 🔥 Avg Job Time: 1.8s
- ⭐ Network Uptime: 99.97%

**Top Earners (24hrs):**
1. node_0x742d... - $1,247
2. node_0x8a93... - $1,102
3. node_0x5f21... - $987

*View live at: https://stats.litcompute.network*

---

## 🆘 Troubleshooting

### Node won't start

```bash
# Check logs
lit-compute logs

# Common fixes:
# 1. Update to latest version
npm update -g @lit-compute/node

# 2. Reset configuration
lit-compute reset

# 3. Check port availability
netstat -an | grep 8080
```

### No jobs coming in

**Possible reasons:**
- ⏰ Low network demand (normal fluctuation)
- 📉 Low reputation score (complete more jobs)
- 💰 Minimum reward too high (lower it)
- 🌍 Geographic latency (network prefers closer nodes)

**Solutions:**
```json
{
  "minimumReward": 0.000001,  // Lower threshold
  "autoAcceptJobs": true,     // Accept all eligible jobs
  "cpuThreads": 8             // More threads = more jobs
}
```

### Earnings seem low

**Check:**
1. How many hours/day is node running?
2. What's your reputation score?
3. How many CPU threads allocated?
4. Network demand (check dashboard)

**Optimize:**
- Run 24/7 for max earnings
- Build reputation to 500+
- Use more CPU cores
- Lower minimum reward

---

## 🔮 Roadmap

### Q1 2026
- ✅ Mainnet launch
- ✅ Desktop apps (Win/Mac/Linux)
- ✅ Basic dashboard

### Q2 2026
- 🔄 Mobile nodes (iOS/Android)
- 🔄 Browser extension
- 🔄 Advanced analytics

### Q3 2026
- 🔮 GPU acceleration
- 🔮 Zero-knowledge proofs
- 🔮 Enterprise partnerships

### Q4 2026
- 🔮 1M active nodes
- 🔮 $1M daily rewards
- 🔮 Integration with 100+ apps

---

## 🤝 Community

**Get Help:**
- 💬 Discord: https://discord.gg/lit-compute
- 🐦 Twitter: @LitComputeNet
- 📧 Email: support@litcompute.network
- 📚 Docs: https://docs.litcompute.network

**Contribute:**
- GitHub: https://github.com/lit-compute/node
- Report bugs: https://github.com/lit-compute/node/issues
- Suggest features: https://github.com/lit-compute/node/discussions

---

## 🕊️ Good Faith Values

Lit Compute Network embodies Good Faith Paradigm principles:

**Community First:**
- 70% of fees go to node operators
- 20% reinvested in education & sustainability
- 10% to platform development

**Transparency:**
- Open-source code
- Public network statistics
- On-chain payment records

**Accessibility:**
- Run on any computer (even old ones!)
- No technical expertise needed
- Global participation

**Sustainability:**
- Energy-efficient cryptography
- Carbon offset program
- Support renewable energy nodes

---

## 📊 Economics at Scale

**If 100,000 people run nodes:**

- Total network capacity: 400,000 CPU cores
- Jobs processed: 10M/day
- Daily rewards distributed: $1M
- Average earnings/node: $10/day
- Annual node income: $3,650
- Total annual distributed: **$365M to community**

**Platform reinvests 20% ($73M) in:**
- Education programs
- Carbon offsets
- Community grants
- Open source development

---

## 🚀 Get Started Now!

```bash
# Install
npm install -g @lit-compute/node

# Setup
lit-compute init --wallet 0xYOUR_WALLET

# Earn
lit-compute start

# Profit! 💰
```

**Questions? Join our Discord!**

---

*Lit Compute Network - Democratizing cryptographic compute*  
*Part of The Beach ecosystem - Good Faith Paradigm*
