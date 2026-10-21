# Lit Compute Network - Frontend Implementation

## Overview

The Lit Compute Network frontend is now **integrated into The Beach repository** using the existing public folder structure. This provides a seamless experience where users can access both the XR environment and the Lit Compute dashboard.

---

## File Structure

```
public/
├── index.html                      # XR Paradise (Babylon.js scene)
├── lit-compute.html                # Lit Compute Network Dashboard ✅ NEW
└── js/
    ├── xr-scene.js                 # Babylon.js XR logic
    └── lit-compute-client.js       # Lit Compute WebSocket client ✅ NEW
```

---

## Access Points

### 1. **XR Paradise** (Existing)
- **URL**: `http://localhost:3000/` or `http://localhost:3000/index.html`
- **Features**: Babylon.js WebXR environment, multiplayer via Socket.IO, SoundCloud integration
- **New**: Added link button to Lit Compute Network dashboard

### 2. **Lit Compute Network Dashboard** (NEW) ✅
- **URL**: `http://localhost:3000/lit-compute.html`
- **Features**:
  - Real-time system statistics (pending jobs, completed jobs, active nodes)
  - Job submission form (file upload or IPFS CID input)
  - WebSocket real-time job status updates
  - Recent jobs list with status badges
  - Toast notifications for job events
  - Responsive design (mobile-friendly)

---

## Frontend Implementation Details

### `lit-compute.html` (570 lines)

**Sections**:
1. **Header**
   - Title and subtitle
   - WebSocket connection status indicator (🟢 Connected / 🔴 Disconnected)

2. **Stats Grid** (4 cards)
   - Pending Jobs (yellow card with ⏳ icon)
   - Completed Jobs (green card with ✅ icon)
   - Active Nodes (blue card with 🖥️ icon)
   - Total Processed (purple card with 📊 icon)

3. **Job Submission Panel**
   - File upload input with size display
   - OR divider
   - IPFS CID manual entry
   - Fee amount configuration (default 0.1 ETH)
   - Submit button with loading state
   - Job status display (hidden until job submitted)

4. **Recent Jobs Panel**
   - Scrollable list of last 10 jobs
   - Job ID, status badge, fee, timestamp
   - Empty state when no jobs

5. **Navigation Links**
   - Back to XR Paradise
   - Current page (Lit Compute)
   - Node Dashboard (coming soon)

**Styling**:
- Gradient purple background (`#667eea` to `#764ba2`)
- White cards with subtle shadows
- Hover effects on cards and buttons
- Responsive grid layout
- Toast notifications (bottom-right corner)
- Status badges with color coding

---

### `lit-compute-client.js` (370 lines)

**Class**: `LitComputeClient`

**Methods**:

1. **`init()`**
   - Initializes WebSocket connection
   - Sets up event listeners
   - Fetches initial stats and pending jobs

2. **`connectWebSocket()`**
   - Connects to `/lit-compute` Socket.IO namespace
   - Handles connection/disconnection events
   - Subscribes to real-time events:
     - `job:update` - Individual job status changes
     - `system:stats` - Network-wide statistics
     - `system:event` - Global system events

3. **`submitJob()`**
   - Validates file or IPFS CID input
   - Uploads file to IPFS (mocked for demo)
   - POSTs to `/lit-compute/jobs/submit` endpoint
   - Subscribes to job updates via WebSocket
   - Shows job status panel
   - Updates UI and shows toast notification

4. **`uploadToIPFS(file)` (Mocked)**
   - Currently generates random CID
   - In production: Use Pinata API or Web3.Storage
   ```javascript
   // Production example:
   const formData = new FormData();
   formData.append('file', file);
   const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
       method: 'POST',
       headers: {
           'pinata_api_key': 'YOUR_API_KEY',
           'pinata_secret_api_key': 'YOUR_SECRET_KEY'
       },
       body: formData
   });
   const data = await response.json();
   return data.IpfsHash;
   ```

5. **`fetchSystemStats()`**
   - GETs `/lit-compute/jobs/stats`
   - Updates all 4 stat cards

6. **`fetchPendingJobs()`**
   - GETs `/lit-compute/jobs/pending/list`
   - Populates recent jobs panel

7. **`handleJobUpdate(data)`**
   - Processes WebSocket job updates
   - Updates current job status if matching
   - Updates job in recent jobs list
   - Shows toast notification with status emoji

8. **`showToast(message, type)`**
   - Displays temporary notification
   - Types: `success`, `error`, `info`
   - Auto-hides after 4 seconds

---

## WebSocket Integration

### Connection

```javascript
const socket = io('http://localhost:3000/lit-compute', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});
```

### Events Listened To

| Event | Payload | Purpose |
|-------|---------|---------|
| `connect` | - | Connection established |
| `disconnect` | - | Connection lost |
| `job:update` | `{ jobId, status, nodeId?, outputCID? }` | Real-time job status changes |
| `system:stats` | `{ pendingJobs, completedJobs, activeNodes }` | Network statistics |
| `system:event` | `{ type, data }` | Global system events |

### Events Emitted

| Event | Payload | Purpose |
|-------|---------|---------|
| `subscribe:job` | `{ jobId }` | Subscribe to specific job updates |

---

## API Endpoints Used

### 1. Submit Job
```http
POST /lit-compute/jobs/submit
Content-Type: application/json

{
  "inputCID": "QmXxxx...",
  "accessControl": {
    "publicKey": "mock-pkp-public-key",
    "conditions": []
  },
  "feeAmount": "0.1",
  "submitter": "mock-eth-address-0x1234..."
}

Response: 200 OK
{
  "id": "job-uuid",
  "status": "pending",
  "submittedAt": "2025-11-06T..."
}
```

### 2. Get System Stats
```http
GET /lit-compute/jobs/stats

Response: 200 OK
{
  "pendingJobs": 5,
  "completedJobs": 42,
  "activeNodes": 3,
  "totalJobsProcessed": 47
}
```

### 3. Get Pending Jobs
```http
GET /lit-compute/jobs/pending/list

Response: 200 OK
{
  "jobs": [
    {
      "id": "job-uuid",
      "status": "pending",
      "feeAmount": "0.1",
      "submittedAt": "2025-11-06T..."
    }
  ]
}
```

---

## User Flow

### Job Submission Flow

```
User opens http://localhost:3000/lit-compute.html
  ↓
Page loads → Connects to WebSocket → Fetches initial stats
  ↓
User uploads file OR enters IPFS CID
  ↓
User sets fee amount (default 0.1 ETH)
  ↓
User clicks "Submit Job"
  ↓
Frontend uploads file to IPFS (mocked) → Gets CID
  ↓
Frontend POSTs to /lit-compute/jobs/submit
  ↓
Backend creates job in Redis → Returns job ID
  ↓
Frontend subscribes to job updates via WebSocket
  ↓
Job status panel appears showing "PENDING"
  ↓
Node picks up job → WebSocket emits job:update (status: "active")
  ↓
Frontend updates badge to "ACTIVE" + shows node ID
  ↓
Node completes job → WebSocket emits job:update (status: "completed")
  ↓
Frontend updates badge to "COMPLETED" + shows output CID
  ↓
User downloads result from IPFS
```

---

## Testing Instructions

### 1. Start The Beach Backend

```bash
cd /home/goodfaith/projects/xr/babylon

# Install dependencies (if not already done)
npm install

# Start development server
npm run start:dev
```

**Expected Output**:
```
🚀 XR Server running on: http://localhost:3000
```

### 2. Access Lit Compute Dashboard

Open browser to: `http://localhost:3000/lit-compute.html`

**Expected Behavior**:
- Page loads with purple gradient background
- 4 stat cards show "0" for all metrics
- Connection status shows "🟢 Connected"
- Form is ready for input

### 3. Test Job Submission

**Option A: Upload File**
1. Click "Choose File" button
2. Select any file (image, document, etc.)
3. File info shows: "Selected: filename.ext (XX.XX KB)"
4. Click "Submit Job"
5. Toast notification: "File uploaded to IPFS: QmXxxx..."
6. Toast notification: "Job submitted successfully! ID: xxxxxxxx..."
7. Job status panel appears showing job details
8. Recent jobs list updates

**Option B: Enter IPFS CID**
1. Leave file input empty
2. Enter mock CID in text field: `QmTest1234567890`
3. Click "Submit Job"
4. Same behavior as Option A

### 4. Monitor Real-Time Updates

**WebSocket Console Logs** (Open browser DevTools → Console):
```
Initializing Lit Compute Client...
Connected to Lit Compute WebSocket
Job update received: { jobId: 'xxx', status: 'pending', ... }
System stats received: { pendingJobs: 1, completedJobs: 0, ... }
```

**Visual Updates**:
- "Pending Jobs" card increments
- Job status badge changes color
- Toast notifications appear

---

## Integration with Existing XR Environment

### Changes to `index.html`

Added navigation button in UI panel:
```html
<a href="/lit-compute.html" 
   style="display: inline-block; margin-top: 10px; padding: 8px 16px; 
          background: rgba(102, 126, 234, 0.8); color: white; 
          text-decoration: none; border-radius: 4px; font-size: 12px;">
    🔐 Lit Compute Network
</a>
```

**Result**: Users in XR Paradise can click to access Lit Compute dashboard without leaving The Beach.

---

## Next Steps

### Immediate (Week 1)

1. **Deploy Redis Vercel KV** ✅ Critical
   ```bash
   # Visit https://vercel.com/dashboard
   # Create KV database: "lit-compute-redis"
   # Copy credentials to .env.local
   ```

2. **Implement Real IPFS Upload** (Pinata)
   ```javascript
   // Replace mock uploadToIPFS() with:
   async uploadToIPFS(file) {
       const formData = new FormData();
       formData.append('file', file);
       
       const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
           method: 'POST',
           headers: {
               'pinata_api_key': process.env.PINATA_API_KEY,
               'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
           },
           body: formData
       });
       
       const data = await response.json();
       return data.IpfsHash;
   }
   ```

3. **Add Authentication Integration**
   - Connect to Y8 App PKP authentication
   - Use real wallet addresses instead of mock
   - Session management via Redis

### Short-Term (Weeks 2-4)

4. **Node Operator Dashboard**
   - Create `public/node-dashboard.html`
   - Node registration form
   - Active jobs list
   - Earnings tracker
   - Heartbeat status indicator

5. **Enhanced Job Details**
   - Job history page
   - Detailed job view with logs
   - Download result button (IPFS gateway)
   - Fee payment status

6. **Mobile Optimization**
   - Touch-friendly controls
   - Responsive stat cards
   - Mobile navigation menu

---

## Known Limitations

1. **IPFS Upload Mocked**
   - Currently generates random CIDs
   - Need to implement Pinata/Web3.Storage API

2. **Authentication Placeholder**
   - Uses mock PKP public key
   - Uses mock Ethereum address
   - Need Y8 App integration for real auth

3. **No Persistent Storage**
   - Redis not yet deployed
   - Stats reset on server restart
   - Need Vercel KV setup

4. **Limited Error Handling**
   - Basic try-catch blocks
   - Need comprehensive error messages
   - Need retry logic for failed requests

---

## Performance Considerations

### Browser Compatibility

- ✅ Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- ✅ WebSocket support required
- ✅ ES6+ JavaScript features
- ⚠️ No Internet Explorer support

### Network Requirements

- **WebSocket**: Persistent connection (~1-5 KB/min)
- **REST API**: ~10-50 KB per request
- **File Upload**: Depends on file size (max 100 MB recommended)

### Recommended Specs

- **Bandwidth**: 1+ Mbps for smooth real-time updates
- **Latency**: <100ms to backend for responsive UI
- **Memory**: ~50 MB browser memory usage

---

## Security Considerations

### Current State (Development)

⚠️ **Not production-ready**:
- No authentication validation
- No rate limiting on frontend
- Mock PKP credentials
- CORS enabled for all origins

### Production Requirements

1. **Authentication**
   - Integrate Y8 App PKP authentication
   - Validate session signatures
   - Implement JWT tokens

2. **Input Validation**
   - Sanitize file uploads (virus scanning)
   - Validate IPFS CIDs (regex pattern)
   - Limit file sizes (100 MB max)
   - Check fee amounts (min 0.01 ETH)

3. **Rate Limiting**
   - 10 job submissions per hour per user
   - 100 API requests per minute per IP
   - WebSocket message throttling

4. **CORS**
   - Restrict to specific domains
   - Remove `origin: true` in production

---

## Troubleshooting

### WebSocket Not Connecting

**Symptom**: Connection status shows "🔴 Disconnected"

**Solutions**:
1. Check backend is running: `npm run start:dev`
2. Check console for errors (DevTools → Console)
3. Verify port 3000 is not blocked by firewall
4. Try different browser (Chrome recommended)

### Job Submission Fails

**Symptom**: Toast shows "Failed to submit job"

**Solutions**:
1. Check backend logs for errors
2. Verify Redis is configured (or comment out Redis calls for testing)
3. Check network tab (DevTools → Network) for failed requests
4. Ensure file size is reasonable (<100 MB)

### Stats Not Updating

**Symptom**: All stat cards show "0"

**Solutions**:
1. Check WebSocket connection status
2. Open console and verify `system:stats` events are received
3. Manually trigger stats fetch (add button in dev mode)
4. Check backend `/lit-compute/jobs/stats` endpoint directly

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│  ┌─────────────────┐      ┌──────────────────┐    │
│  │ lit-compute.html│◄────►│lit-compute-client│    │
│  │   (UI/HTML)     │      │     (Logic/JS)   │    │
│  └─────────────────┘      └─────────┬────────┘    │
│                                      │              │
└──────────────────────────────────────┼──────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                      │
                    ▼                                      ▼
         ┌──────────────────┐                  ┌─────────────────┐
         │  REST API (HTTP) │                  │WebSocket (Socket│
         │                  │                  │      .IO)       │
         │ POST /jobs/submit│                  │ Namespace:      │
         │ GET /jobs/stats  │                  │ /lit-compute    │
         │ GET /jobs/pending│                  │                 │
         └─────────┬────────┘                  └────────┬────────┘
                   │                                     │
                   └──────────┬──────────────────────────┘
                              │
                   ┌──────────▼────────────┐
                   │   NestJS Backend     │
                   │   (The Beach)        │
                   │                      │
                   │  - JobsController    │
                   │  - NodesController   │
                   │  - LitComputeGateway │
                   │  - RedisService      │
                   │  - QueueService      │
                   └──────────┬────────────┘
                              │
                   ┌──────────▼────────────┐
                   │    Redis Vercel KV   │
                   │                      │
                   │  - Session data      │
                   │  - Job queue         │
                   │  - Node registry     │
                   │  - Pub/Sub channels  │
                   └──────────────────────┘
```

---

## Summary

✅ **Frontend Implementation: 100% Complete**

**Files Created**:
- `public/lit-compute.html` (570 lines)
- `public/js/lit-compute-client.js` (370 lines)

**Files Modified**:
- `public/index.html` (added navigation link)

**Features Delivered**:
- ✅ Real-time WebSocket integration
- ✅ Job submission form (file upload + IPFS CID)
- ✅ System statistics dashboard
- ✅ Recent jobs list
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Connection status indicator
- ✅ Navigation between XR and Lit Compute

**Total Lines**: ~940 lines of HTML/CSS/JavaScript

**Status**: Ready for testing (pending Redis deployment)

---

**Next Critical Step**: Deploy Redis Vercel KV to enable persistence (30 minutes)
