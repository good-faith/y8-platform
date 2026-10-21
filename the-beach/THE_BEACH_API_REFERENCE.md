# 🏝️ The Beach - API Endpoint Reference

Quick reference for all implemented REST API endpoints.

---

## 🎭 **NPE Management**

### Generate NPE
```http
POST /npe/generate
Content-Type: application/json

{
  "userId": "user-123",
  "name": "Beach Concierge Agent",
  "type": "service-provider",
  "category": "hospitality",
  "location": {
    "lat": 25.7617,
    "lng": -80.1918,
    "serviceRadius": 5000
  },
  "capabilities": ["customer-service", "bookings", "recommendations"],
  "customFields": {
    "languages": ["English", "Spanish"],
    "operatingHours": "24/7"
  }
}

Response:
{
  "success": true,
  "npe": {
    "pkpAddress": "0x...",
    "publicKey": "0x04...",
    "name": "Beach Concierge Agent",
    ...
  },
  "message": "NPE 'Beach Concierge Agent' created successfully"
}
```

### List NPEs
```http
GET /npe/list?userId=user-123

Response:
{
  "success": true,
  "count": 3,
  "maxNPEs": 3,
  "tier": "freemium",
  "npeIds": ["npe-1", "npe-2", "npe-3"]
}
```

---

## 💎 **Tier Management**

### Get Tier Information (All Tiers)
```http
GET /tier/info

Response:
{
  "success": true,
  "tiers": [
    {
      "tier": "freemium",
      "price": 0,
      "limits": {
        "maxNPEs": 3,
        "maxSchemaFields": 5,
        "maxLocations": 1,
        "serviceRadius": 1000,
        "litActions": "basic",
        "support": "community",
        "apiAccess": false
      },
      "features": [
        "3 NPEs",
        "5 custom schema fields",
        "1 geographic location",
        "1km service radius",
        "Basic Lit Actions",
        "Community support"
      ]
    },
    {
      "tier": "base",
      "price": 10,
      "limits": {
        "maxNPEs": 25,
        "maxSchemaFields": 25,
        "maxLocations": 5,
        "serviceRadius": 10000,
        "litActions": "full",
        "support": "email",
        "apiAccess": true
      },
      "features": [
        "25 NPEs",
        "25 custom schema fields",
        "5 geographic locations",
        "10km service radius",
        "Full Lit Actions library",
        "Email support",
        "API access"
      ]
    },
    {
      "tier": "premium",
      "price": 50,
      "limits": {
        "maxNPEs": -1,
        "maxSchemaFields": -1,
        "maxLocations": -1,
        "serviceRadius": -1,
        "litActions": "full-priority",
        "support": "dedicated",
        "apiAccess": true,
        "analytics": "advanced",
        "xrNetworking": true
      },
      "features": [
        "Unlimited NPEs",
        "Unlimited schema fields",
        "Unlimited locations",
        "Global service radius",
        "Priority Lit Actions",
        "Dedicated support",
        "API access",
        "Advanced AI analytics",
        "XR networking & immersive environments"
      ]
    }
  ]
}
```

### Get Specific Tier
```http
GET /tier/info?tier=base

Response:
{
  "success": true,
  "tier": "base",
  "price": 10,
  "limits": { ... },
  "features": [ ... ]
}
```

### Get Current Tier (with Usage)
```http
GET /tier/current?userId=user-123

Response:
{
  "success": true,
  "userId": "user-123",
  "currentTier": "freemium",
  "price": 0,
  "limits": { ... },
  "features": [ ... ],
  "usage": {
    "npes": 3,
    "maxNPEs": 3,
    "percentUsed": 100
  }
}
```

### Upgrade Tier
```http
POST /tier/upgrade
Content-Type: application/json

{
  "userId": "user-123",
  "newTier": "base"
}

Response:
{
  "success": true,
  "userId": "user-123",
  "upgradedTo": "base",
  "price": 10,
  "limits": { ... },
  "features": [ ... ],
  "message": "Successfully upgraded to BASE tier"
}
```

---

## 🌍 **Geo-Fenced Services**

### Post Service
```http
POST /service/post
Content-Type: application/json

{
  "npeId": "npe-123",
  "name": "Beach Bites Delivery",
  "category": "food-delivery",
  "location": {
    "lat": 25.7617,
    "lng": -80.1918
  },
  "serviceRadius": 5000,
  "agentPKP": {
    "address": "0x...",
    "publicKey": "0x04..."
  },
  "pricing": {
    "deliveryFee": 5.99,
    "minimumOrder": 15
  },
  "availability": "24/7",
  "estimatedResponse": 1800
}

Response:
{
  "success": true,
  "service": {
    "id": "service-abc123",
    "npeId": "npe-123",
    "name": "Beach Bites Delivery",
    "category": "food-delivery",
    "location": { "lat": 25.7617, "lng": -80.1918 },
    "serviceRadius": 5000,
    "geofence": [ /* 32 points */ ],
    "status": "active",
    ...
  },
  "message": "Service 'Beach Bites Delivery' posted successfully"
}
```

### Find Nearby Services
```http
GET /service/nearby?lat=25.7650&lng=-80.1900&radius=5000&category=food-delivery

Response:
{
  "success": true,
  "location": { "lat": 25.7650, "lng": -80.1900 },
  "radiusMeters": 5000,
  "category": "food-delivery",
  "count": 2,
  "services": [
    {
      "id": "service-abc123",
      "name": "Beach Bites Delivery",
      "category": "food-delivery",
      "location": { "lat": 25.7617, "lng": -80.1918 },
      "distance": 412,
      "eta": 6,
      "pricing": { "deliveryFee": 5.99 },
      "status": "active"
    },
    {
      "id": "service-xyz789",
      "name": "Ocean Eats",
      "distance": 1250,
      "eta": 15,
      ...
    }
  ]
}
```

### Get Service Details
```http
GET /service/service-abc123

Response:
{
  "success": true,
  "service": {
    "id": "service-abc123",
    "npeId": "npe-123",
    "name": "Beach Bites Delivery",
    "category": "food-delivery",
    "location": { "lat": 25.7617, "lng": -80.1918 },
    "serviceRadius": 5000,
    "geofence": [ /* 32 points */ ],
    "agentPKP": { "address": "0x...", "publicKey": "0x04..." },
    "pricing": { "deliveryFee": 5.99, "minimumOrder": 15 },
    "availability": "24/7",
    "estimatedResponse": 1800,
    "status": "active"
  }
}
```

### Update Service
```http
PUT /service/service-abc123
Content-Type: application/json

{
  "status": "paused",
  "pricing": {
    "deliveryFee": 4.99,
    "minimumOrder": 12
  }
}

Response:
{
  "success": true,
  "service": { /* updated service */ },
  "message": "Service updated successfully"
}
```

### Delete Service
```http
DELETE /service/service-abc123

Response:
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## 🤖 **Agent Orchestration**

### Get All Agents
```http
GET /agents

Response:
{
  "success": true,
  "count": 0,
  "agents": []
}
```

### Get Agents by Purpose
```http
GET /agents?purpose=sales-agent

Response:
{
  "success": true,
  "count": 3,
  "purpose": "sales-agent",
  "agents": [
    {
      "id": "0x...",
      "pkp": { "address": "0x...", "publicKey": "0x04..." },
      "purpose": "sales-agent",
      "role": "Sales Representative",
      "capabilities": ["sales", "support", "consulting"],
      "status": "active",
      "currentLoad": 2,
      "maxLoad": 10,
      "performanceScore": 95
    },
    ...
  ]
}
```

### Get Agent Details
```http
GET /agents/0xABC123...

Response:
{
  "success": true,
  "agent": {
    "id": "0xABC123...",
    "pkp": { ... },
    "purpose": "sales-agent",
    "role": "Sales Representative",
    "capabilities": ["sales", "support", "consulting"],
    "status": "active",
    "currentLoad": 2,
    "maxLoad": 10,
    "location": { "lat": 25.7617, "lng": -80.1918 },
    "performanceScore": 95,
    "sessionsHandled": 127,
    "sessionsCompleted": 124,
    "totalRevenue": 15420.50,
    "uptime": 86400000
  }
}
```

### Get Network Statistics
```http
GET /network/stats

Response:
{
  "success": true,
  "stats": {
    "totalAgents": 12,
    "activeAgents": 10,
    "idleAgents": 3,
    "busyAgents": 7,
    "totalSessions": 45,
    "activeSessions": 18,
    "avgLoad": 1.8,
    "avgPerformance": 92.5,
    "purposes": [
      "sales-agent",
      "support-agent",
      "geo-service-food-delivery",
      "ai-build#0"
    ]
  }
}
```

### Get Active Sessions
```http
GET /sessions/active

Response:
{
  "success": true,
  "activeSessions": 18,
  "totalSessions": 45
}
```

---

## 🗺️ **Service Maps & Analytics**

### Get Service Coverage Map
```http
GET /map/coverage

Response:
{
  "success": true,
  "services": [
    {
      "id": "service-abc123",
      "name": "Beach Bites Delivery",
      "category": "food-delivery",
      "center": { "lat": 25.7617, "lng": -80.1918 },
      "radius": 5000,
      "status": "active"
    },
    ...
  ]
}
```

### Get Service Statistics
```http
GET /service/stats

Response:
{
  "success": true,
  "totalServices": 25,
  "activeServices": 22,
  "pausedServices": 2,
  "offlineServices": 1,
  "categoriesServed": 5,
  "categoryBreakdown": {
    "food-delivery": 8,
    "equipment-rental": 6,
    "wellness": 4,
    "transportation": 5,
    "entertainment": 2
  }
}
```

---

## 👥 **Team Management** (Existing Endpoints)

### Get Team
```http
GET /npe/team
```

### Get Goals
```http
GET /npe/goals
```

### Get Reports
```http
GET /npe/reports/daily
GET /npe/reports/weekly
GET /npe/reports/monthly
```

### Get Metrics
```http
GET /npe/metrics/goodfaith
```

### Get Dashboard
```http
GET /npe/dashboard
```

---

## 🎯 **Quick Start Examples**

### Example 1: Create Freemium NPE
```bash
curl -X POST http://localhost:3000/npe/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "name": "My First Agent",
    "type": "service-provider",
    "category": "general"
  }'
```

### Example 2: Find Nearby Food Delivery
```bash
curl "http://localhost:3000/service/nearby?lat=25.7650&lng=-80.1900&radius=5000&category=food-delivery"
```

### Example 3: Upgrade to Base Tier
```bash
curl -X POST http://localhost:3000/tier/upgrade \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "newTier": "base"
  }'
```

### Example 4: Check Network Stats
```bash
curl http://localhost:3000/network/stats
```

---

## 🚀 **Base URL**

Development: `http://localhost:3000`  
Production: `https://api.thebeach.io` (when deployed)

---

## 📊 **Response Format**

All endpoints return JSON with a consistent structure:

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

---

Built with ❤️ for The Beach 🏝️
