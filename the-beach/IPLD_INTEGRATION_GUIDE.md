# IPLD Integration Guide for Lit Compute Network

## Overview

The Lit Compute Network now uses **IPLD (InterPlanetary Linked Data)** for content-addressable node connections and verifiable data structures.

### What is IPLD?

IPLD is the data model of the content-addressable web. It allows you to:
- Create cryptographically verifiable data structures
- Use content-based addressing (CIDs)
- Link data across different systems
- Build distributed applications with trust guarantees

**Learn more:** https://ipld.io/

## Architecture

### Content-Addressable Node Identity

Instead of traditional server addresses, nodes are identified by **CIDs (Content Identifiers)**:

```
Traditional: http://192.168.1.100:3000
IPLD:        /ip4/192.168.1.100/tcp/3000/ipld/bafyreif2pv...
```

The CID is derived from the node's:
- Wallet address (cryptographic identity)
- Public key
- Capabilities
- Registration timestamp

**Benefits:**
- ✅ Tamper-proof identity
- ✅ Verifiable credentials
- ✅ Content-based routing
- ✅ Cross-platform compatibility

### Data Structures

#### 1. Node Identity

```typescript
{
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  publicKey: "0x04a1b2c3...",
  capabilities: {
    maxConcurrentJobs: 4,
    supportedOperations: ["encrypt", "decrypt", "sign"]
  },
  timestamp: 1699292400000
}
```

**Encoded as:** `dag-cbor` (Concise Binary Object Representation)  
**CID Example:** `bafyreif2pvr5i2ldjt7hzmxlo3lrz5vn5nqwqwqwqw...`

#### 2. Job Definition

```typescript
{
  type: "encryption",
  input: {
    data: "sensitive information",
    method: "AES-256-GCM"
  },
  requirements: {
    minReputation: 50,
    timeoutMs: 30000
  },
  timestamp: 1699292400000
}
```

**CID Example:** `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbi...`

#### 3. Job Assignment (Linked Data)

```typescript
{
  job: CID("bafybeigdyrzt..."),     // Links to job
  node: CID("bafyreif2pvr..."),     // Links to node
  assignedAt: 1699292400000,
  status: "assigned"
}
```

This creates a **verifiable audit trail**:
- Which node received which job
- When the assignment occurred
- Immutable record of the transaction

## API Endpoints

### Node Registration with IPLD

**POST** `/lit-compute/nodes/register`

```bash
curl -X POST http://localhost:3000/lit-compute/nodes/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "publicKey": "0x04a1b2c3d4e5...",
    "capabilities": {
      "maxConcurrentJobs": 4,
      "supportedOperations": ["encrypt", "decrypt", "sign"]
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "nodeId": "bafyreif2pvr5i2ldjt7hzmxlo3lrz5vn5nqwqwqwqw...",
  "nodeCID": "bafyreif2pvr5i2ldjt7hzmxlo3lrz5vn5nqwqwqwqw...",
  "nodeAddress": "/ip4/127.0.0.1/tcp/3000/ipld/bafyreif2pvr...",
  "message": "Node registered successfully with IPLD addressing",
  "ipldInfo": {
    "cid": "bafyreif2pvr5i2ldjt7hzmxlo3lrz5vn5nqwqwqwqw...",
    "multiaddr": "/ip4/127.0.0.1/tcp/3000/ipld/bafyreif2pvr...",
    "verifiable": true
  }
}
```

### IPLD Operations

#### Get IPLD Info

**GET** `/lit-compute/ipld/info`

```bash
curl http://localhost:3000/lit-compute/ipld/info
```

#### Resolve CID

**GET** `/lit-compute/ipld/resolve/:cid`

```bash
curl http://localhost:3000/lit-compute/ipld/resolve/bafyreif2pvr...
```

**Response:**

```json
{
  "success": true,
  "cid": "bafyreif2pvr...",
  "data": {
    "walletAddress": "0x742d35Cc...",
    "publicKey": "0x04a1b2c3...",
    "capabilities": {...},
    "timestamp": 1699292400000
  }
}
```

#### Verify Data Integrity

**POST** `/lit-compute/ipld/verify`

```bash
curl -X POST http://localhost:3000/lit-compute/ipld/verify \
  -H "Content-Type: application/json" \
  -d '{
    "cid": "bafyreif2pvr...",
    "data": {
      "walletAddress": "0x742d35Cc...",
      "publicKey": "0x04a1b2c3...",
      "capabilities": {...}
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "cid": "bafyreif2pvr...",
  "valid": true,
  "message": "Data integrity verified - CID matches content"
}
```

#### Export Block for IPFS

**GET** `/lit-compute/ipld/export/:cid`

```bash
curl http://localhost:3000/lit-compute/ipld/export/bafyreif2pvr...
```

Returns the block in base64 encoding for storage in IPFS or replication.

#### Import Block

**POST** `/lit-compute/ipld/import`

```bash
curl -X POST http://localhost:3000/lit-compute/ipld/import \
  -H "Content-Type: application/json" \
  -d '{
    "data": "base64-encoded-block-data",
    "encoding": "base64"
  }'
```

## Use Cases

### 1. Verifiable Node Registration

When a node registers:
1. Create CID from node data
2. Store block in IPLD
3. Use CID as node identifier
4. Anyone can verify the node's identity by recalculating the CID

### 2. Job Assignment Audit Trail

Create an immutable record:
```
Job CID → Assignment CID → Result CID
```

This forms a Directed Acyclic Graph (DAG) of verifiable operations.

### 3. Cross-Platform Data Sharing

The same CID works across:
- IPFS
- Filecoin
- Ceramic
- Any IPLD-compatible system

### 4. Reputation System

Build a verifiable reputation graph:
```typescript
{
  node: CID("node-identity"),
  completedJobs: [
    CID("job-1-result"),
    CID("job-2-result"),
    ...
  ],
  reputation: 95
}
```

## Technical Details

### Encoding Format

- **Codec:** `dag-cbor` (Concise Binary Object Representation)
- **Hash Function:** SHA-256
- **CID Version:** CIDv1
- **Multibase:** base32 (default)

### CID Structure

```
bafyreif2pvr5i2ldjt7hzmxlo3lrz5vn5nqwqwqwqw...
│   │   │
│   │   └─ Hash digest
│   └───── Hash function (SHA-256)
└───────── Codec (dag-cbor)
```

### Storage

Currently using in-memory storage. For production:
- **IPFS:** Distributed storage
- **Filecoin:** Persistent storage with economic incentives
- **Ceramic:** Mutable data streams on IPLD
- **Redis:** Fast cache layer

## Integration with Existing Systems

### Y8 App Connection

Y8 App can connect to nodes using:

```javascript
// Traditional
const url = "http://192.168.1.100:3000";

// IPLD-based
const nodeAddress = "/ip4/192.168.1.100/tcp/3000/ipld/bafyreif2pvr...";
const parsed = parseNodeAddress(nodeAddress);
// { ip: "192.168.1.100", port: 3000, nodeCID: "bafyreif2pvr..." }

// Verify node identity before connecting
const isValid = await verifyNodeIdentity(parsed.nodeCID, nodeData);
```

### Redis Integration

Node metadata stored in Redis with IPLD references:

```
Key: node:bafyreif2pvr...
Value: {
  capacity: 4,
  walletAddress: "0x742d35Cc...",
  reputation: 95,
  cid: "bafyreif2pvr...",
  lastHeartbeat: 1699292400000
}
```

## Security Benefits

### 1. Tamper Detection

If node data is modified, the CID changes:
```
Original CID:  bafyreif2pvr...
Modified Data: bafyreif9xyz...  ← Different!
```

### 2. Verifiable Credentials

Nodes can prove their identity without a central authority.

### 3. Cryptographic Linking

Job assignments are cryptographically linked to both job and node.

### 4. Audit Trail

Complete history of operations with verifiable timestamps.

## Development Examples

### Create Node CID

```typescript
import { IpldService } from './ipld.service';

const ipld = new IpldService();

const nodeCID = await ipld.createNodeCID({
  walletAddress: "0x742d35Cc...",
  publicKey: "0x04a1b2c3...",
  capabilities: {
    maxConcurrentJobs: 4,
    supportedOperations: ["encrypt", "decrypt"]
  },
  timestamp: Date.now()
});

console.log(`Node CID: ${nodeCID.toString()}`);
```

### Verify Node Integrity

```typescript
const nodeData = {
  walletAddress: "0x742d35Cc...",
  publicKey: "0x04a1b2c3...",
  capabilities: {...},
  timestamp: 1699292400000
};

const isValid = await ipld.verifyNodeIntegrity(
  "bafyreif2pvr...",
  nodeData
);

if (isValid) {
  console.log("✅ Node identity verified");
} else {
  console.log("❌ Node data has been tampered with");
}
```

### Create Job Assignment

```typescript
const jobCID = await ipld.createJobCID({
  type: "encryption",
  input: {...},
  requirements: {...},
  timestamp: Date.now()
});

const assignmentCID = await ipld.createJobAssignment(
  jobCID,
  nodeCID,
  Date.now()
);

console.log(`Assignment created: ${assignmentCID.toString()}`);
```

## Performance Considerations

### CID Generation

- **Fast:** SHA-256 hashing is very efficient
- **Small:** CIDs are typically 50-60 characters
- **Cacheable:** CIDs never change for the same content

### Block Storage

- **In-Memory:** Fast but limited capacity
- **IPFS:** Distributed but network overhead
- **Hybrid:** Memory cache + IPFS persistence

### Verification

- **O(1):** CID lookup in block store
- **Fast:** Cryptographic verification is quick
- **Scalable:** No central authority needed

## Future Enhancements

### 1. IPFS Integration

Store blocks in IPFS for:
- Distributed storage
- Content deduplication
- Peer-to-peer replication

### 2. Ceramic Integration

Use Ceramic for:
- Mutable node metadata
- Real-time updates
- Decentralized identity (DID)

### 3. Filecoin Storage

Persist critical data with:
- Economic incentives
- Proof of storage
- Long-term archival

### 4. GraphQL API

Query the IPLD graph:

```graphql
query {
  node(cid: "bafyreif2pvr...") {
    walletAddress
    reputation
    assignments {
      job {
        type
        status
      }
      completedAt
    }
  }
}
```

## Troubleshooting

### CID Not Found

**Problem:** `Block not found for CID: bafyreif...`

**Solutions:**
- Check if block was imported correctly
- Verify CID format (should start with `bafy...`)
- Ensure block is in local store or IPFS

### Verification Failed

**Problem:** `Data integrity check failed`

**Solutions:**
- Data was modified after CID generation
- Wrong timestamp or field order
- Ensure exact same data structure

### Import Error

**Problem:** `Failed to import block`

**Solutions:**
- Check encoding (must be base64)
- Verify data is valid CBOR
- Ensure block format matches codec

## Resources

- **IPLD Specification:** https://ipld.io/docs/
- **Multiformats:** https://multiformats.io/
- **DAG-CBOR:** https://ipld.io/specs/codecs/dag-cbor/
- **CID Specification:** https://github.com/multiformats/cid
- **IPFS Docs:** https://docs.ipfs.tech/

## Summary

IPLD provides the Lit Compute Network with:

✅ **Content-addressable** node identities  
✅ **Cryptographically verifiable** data structures  
✅ **Distributed** and decentralized architecture  
✅ **Interoperable** with IPFS, Filecoin, Ceramic  
✅ **Tamper-proof** audit trails  
✅ **Scalable** and efficient  

This creates a foundation for trustless, verifiable distributed computing! 🚀
