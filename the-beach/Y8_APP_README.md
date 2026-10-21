# Y8 App - Decentralized Compute Network Dashboard 🚀

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Lit Protocol](https://img.shields.io/badge/Lit_Protocol-7.1.1-yellow)](https://litprotocol.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **A modern, real-time dashboard for the Lit Compute Network** - Built with Next.js 15, React 19, and Lit Protocol integration.

[Live Demo](#) | [Documentation](#features) | [Backend API](https://github.com/jasonsprouse/the-beach) | [Report Bug](#) | [Request Feature](#)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Y8 App** is a comprehensive dashboard for managing and monitoring the Lit Compute Network - a decentralized infrastructure for processing authenticated compute jobs using Lit Protocol's PKP (Programmable Key Pair) technology.

### What is Lit Compute Network?

The Lit Compute Network enables:
- 🔐 **Decentralized Authentication** - PKP-based wallet authentication
- ⚡ **Distributed Job Processing** - Execute compute jobs across network nodes
- 💰 **Automated Payments** - Smart contract-based earnings distribution
- 📊 **Real-time Monitoring** - WebSocket-powered live updates
- 🌐 **Node Operations** - Become a compute node and earn cryptocurrency

### Use Cases

- Submit compute jobs with encrypted data
- Monitor job execution across distributed nodes
- Operate compute nodes and track earnings
- View network statistics and analytics
- Manage payment history and withdrawals

---

## ✨ Features

### 🎯 Core Features

- ✅ **Real-time Dashboard** - Live updates via WebSocket connections
- ✅ **Job Management** - Submit, track, and view detailed job information
- ✅ **Node Operations** - Comprehensive node operator interface
- ✅ **Payment Tracking** - Transaction history with export to CSV
- ✅ **Network Analytics** - Charts, metrics, and performance insights
- ✅ **PKP Authentication** - Lit Protocol wallet integration
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Dark Mode** - Beautiful dark theme optimized for extended use

### 📊 Dashboard Pages

#### 1. **Main Dashboard** (`/lit-compute/dashboard`)
- System stats overview (active nodes, jobs, success rate)
- Quick action cards (Submit Job, Become a Node, Analytics)
- Recent jobs list with live updates
- Payment history widget
- Getting started guide and tips

#### 2. **Node Operator Interface** (`/lit-compute/nodes`)
- **For non-operators**: Registration CTA with benefits and requirements
- **For operators**: 
  - Real-time earnings display (ETH + USD)
  - Active jobs with progress tracking
  - Performance metrics (avg time, success rate, uptime)
  - Recent earnings list with blockchain links
  - Withdraw earnings functionality
  - Reputation score and network ranking

#### 3. **Job Details** (`/lit-compute/jobs/[id]`)
- Complete job timeline (submitted → processing → completed)
- Job information (input/output CIDs, submitter, assigned node)
- Payment breakdown with Etherscan links
- PKP access control details
- Download results button

#### 4. **Payment History** (Component)
- Paginated transaction table (20 per page)
- Filter by type (earned/spent/withdrawn/refund)
- Date range filtering (7/30/90 days, all time)
- Search by Job ID or Transaction Hash
- CSV export functionality
- Blockchain explorer integration
- Status badges (pending/confirmed/failed)

#### 5. **Job List** (Component)
- Real-time job updates (5-second refresh)
- Filter by status (pending/active/completed/failed)
- Sort by date or fee (ascending/descending)
- Search by Job ID, Submitter, CID, Node ID
- Live connection indicator
- Auto-refresh toggle

---

## 📸 Screenshots

> **Note**: Add screenshots here showing:
> - Main dashboard with system stats
> - Node operator interface with earnings
> - Job details page
> - Payment history table
> - Job list with filters

---

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript 5.8.3** - Type-safe development

### Authentication & Blockchain
- **Lit Protocol 7.1.1** - PKP authentication and encryption
- **Wagmi 2.18.1** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **RainbowKit** - Wallet connection UI

### UI & Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications

### Real-time Communication
- **Socket.IO Client** - WebSocket connections
- **Custom React Hooks** - `useLitComputeSocket` for live updates

### State Management & Data
- **React Hooks** - useState, useEffect, custom hooks
- **Context API** - Global state management
- **SWR** (optional) - Data fetching and caching

### Charts & Visualization
- **Recharts** - Composable charting library
- **D3.js** (planned) - Advanced data visualization

### Development Tools
- **ESLint** - Code linting
- **Prettier** (recommended) - Code formatting
- **TypeScript** - Static type checking

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or higher
- **npm** 9.x or higher (or **pnpm** / **yarn**)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jasonsprouse/y8-app.git
   cd y8-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_WS_URL=ws://localhost:3000
   
   # Lit Protocol
   NEXT_PUBLIC_LIT_NETWORK=datil-test
   
   # Redis (optional - for caching)
   REDIS_HOST=your-redis.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   KV_REST_API_URL=https://your-kv.upstash.io
   KV_REST_API_TOKEN=your-token
   
   # Blockchain (optional)
   NEXT_PUBLIC_ALCHEMY_ID=your-alchemy-key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

After starting the app:

1. **Connect Your Wallet** - Click "Connect Wallet" in the header
2. **Authenticate with Lit Protocol** - Sign the authentication message
3. **Explore the Dashboard** - View system stats and recent activity
4. **Submit a Test Job** - Try the job submission flow
5. **Check Payment History** - See transactions (if applicable)

---

## 📁 Project Structure

```
y8-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── lit-compute/             # Lit Compute Network features
│       ├── dashboard/
│       │   └── page.tsx         # Main dashboard
│       ├── nodes/
│       │   └── page.tsx         # Node operator interface
│       ├── jobs/
│       │   └── [id]/
│       │       └── page.tsx     # Job details page
│       └── analytics/           # (Coming soon)
│           └── page.tsx
│
├── components/                   # React components
│   ├── LitCompute/              # Feature-specific components
│   │   ├── NodeDashboard.tsx    # Node operator dashboard (469 lines)
│   │   ├── PaymentHistory.tsx   # Transaction history (431 lines)
│   │   ├── JobList.tsx          # Job browser (341 lines)
│   │   └── SystemStatsDashboard.tsx
│   ├── ui/                      # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ... (other UI components)
│   └── Header.tsx               # App header with wallet connection
│
├── lib/                         # Utility libraries
│   ├── lit-compute-api.ts      # API client (20 methods, 341 lines)
│   ├── utils.ts                # Helper functions
│   └── redis-client.ts         # Redis connection (optional)
│
├── hooks/                       # Custom React hooks
│   ├── useLitComputeSocket.ts  # WebSocket hook for real-time updates
│   └── useLitAuth.ts           # Lit Protocol authentication
│
├── context/                     # React Context providers
│   └── AuthContext.tsx         # Global auth state
│
├── types/                       # TypeScript type definitions
│   └── lit-compute.ts          # Network types and interfaces
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
├── styles/                      # Global styles
│   └── globals.css
│
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

## 🔑 Key Components

### 1. NodeDashboard Component

**File**: `components/LitCompute/NodeDashboard.tsx` (469 lines)

Real-time dashboard for node operators showing:
- Live earnings (ETH + USD conversion)
- Active jobs with progress bars
- Performance metrics grid
- Recent earnings list
- Withdraw earnings button
- Reputation score
- Network ranking

**Props**:
```typescript
interface NodeDashboardProps {
  nodeId: string;
}
```

**Features**:
- WebSocket integration for live updates
- Auto-refresh every 10 seconds
- Toast notifications for actions
- Responsive grid layout

### 2. PaymentHistory Component

**File**: `components/LitCompute/PaymentHistory.tsx` (431 lines)

Transaction history with advanced filtering:
- Paginated table (20 items per page)
- Filter by type (earned/spent/withdrawn/refund)
- Date range filtering
- Search by Job ID or Tx Hash
- CSV export
- Blockchain explorer links

**Props**:
```typescript
interface PaymentHistoryProps {
  nodeId?: string;
  userId?: string;
  compact?: boolean;
  limit?: number;
}
```

### 3. JobList Component

**File**: `components/LitCompute/JobList.tsx` (341 lines)

Real-time job browser with:
- Live updates (5-second refresh)
- Status filtering
- Sorting options
- Search functionality
- Auto-refresh toggle
- Connection indicator

**Props**:
```typescript
interface JobListProps {
  limit?: number;
  compact?: boolean;
}
```

### 4. LitComputeAPI Client

**File**: `lib/lit-compute-api.ts` (341 lines, 20 methods)

Complete API client for backend communication:

**Job Methods**:
- `submitJob(input, pkpPublicKey, fee)` - Submit new compute job
- `getJobStatus(jobId)` - Check job status
- `getJobResult(jobId)` - Retrieve job output
- `getAllJobs()` - Browse all jobs
- `getJobsByUser(userId)` - User's submitted jobs
- `getJobsByNode(nodeId)` - Node's processed jobs

**Node Methods**:
- `registerNode(wallet, stake)` - Register as compute node
- `getNodeInfo(nodeId)` - Get node details
- `getNodeEarnings(nodeId)` - Fetch earnings data
- `getActiveJobsByNode(nodeId)` - Active jobs for node
- `getNodeMetrics(nodeId)` - Performance metrics
- `withdrawEarnings(nodeId, wallet)` - Withdraw funds
- `getNodeByWallet(wallet)` - Check registration status

**Transaction Methods**:
- `getNodeTransactions(nodeId)` - Node transaction history
- `getUserTransactions(userId)` - User transaction history

**System Methods**:
- `getNetworkStats()` - Overall network statistics
- `getActiveNodes()` - List of active nodes
- `healthCheck()` - Backend health status

---

## 🔌 API Integration

### Backend: The Beach

Y8 App connects to **The Beach** - a NestJS backend with WebSocket support.

**Repository**: [jasonsprouse/the-beach](https://github.com/jasonsprouse/the-beach)

**Endpoints**:
```
GET    /health                    # Health check
GET    /lit-compute/stats         # Network statistics
GET    /lit-compute/nodes         # Active nodes
GET    /lit-compute/nodes/:id     # Node details
POST   /lit-compute/nodes         # Register node
GET    /lit-compute/jobs          # All jobs
POST   /lit-compute/jobs          # Submit job
GET    /lit-compute/jobs/:id      # Job details
```

**WebSocket Events**:
```typescript
// Client → Server
socket.emit('subscribe', { channel: 'lit-compute:jobs' });

// Server → Client
socket.on('job:created', (job) => { ... });
socket.on('job:updated', (job) => { ... });
socket.on('job:completed', (job) => { ... });
socket.on('node:status', (node) => { ... });
socket.on('network:stats', (stats) => { ... });
```

### Custom Hooks

**useLitComputeSocket Hook**:
```typescript
import { useLitComputeSocket } from '@/hooks/useLitComputeSocket';

function MyComponent() {
  const { jobs, nodes, stats, connected } = useLitComputeSocket({
    autoConnect: true,
    subscribeToJobs: true,
    subscribeToNodes: true,
  });
  
  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <p>Active Jobs: {jobs.length}</p>
    </div>
  );
}
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run dev:turbo    # Start with Turbopack (faster)

# Building
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing (planned)
npm run test         # Run tests
npm run test:e2e     # End-to-end tests
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | Yes | `ws://localhost:3000` |
| `NEXT_PUBLIC_LIT_NETWORK` | Lit Protocol network | Yes | `datil-test` |
| `REDIS_HOST` | Redis host | No | - |
| `KV_REST_API_URL` | Vercel KV URL | No | - |
| `KV_REST_API_TOKEN` | Vercel KV token | No | - |

### Development Tips

1. **Hot Reload**: Changes to components auto-refresh the browser
2. **Type Safety**: Use TypeScript for all new components
3. **Lint Before Commit**: Run `npm run lint` to catch issues
4. **Component Library**: Use Shadcn/ui for consistent design
5. **WebSocket Testing**: Check browser console for connection status
6. **API Mocking**: Use mock data when backend is unavailable

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Props**: Define interfaces for all component props
- **Naming**: PascalCase for components, camelCase for functions
- **Files**: One component per file
- **Exports**: Named exports preferred

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

4. **Connect GitHub** for automatic deployments

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jasonsprouse/y8-app)

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
```

**Build and run**:
```bash
docker build -t y8-app .
docker run -p 3000:3000 y8-app
```

### Environment Setup

**Production checklist**:
- ✅ Set `NEXT_PUBLIC_API_URL` to production backend
- ✅ Configure Redis/Vercel KV for caching
- ✅ Set up error tracking (Sentry recommended)
- ✅ Enable analytics (Vercel Analytics or Google Analytics)
- ✅ Configure CORS on backend
- ✅ Use environment-specific Lit Protocol network

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Pull Request Guidelines

- Describe what your PR does
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

---

## 📊 Project Status

### Current Progress: 48% Complete

**Completed** ✅:
- [x] Main dashboard page
- [x] Node operator interface
- [x] Job details page
- [x] Payment history component
- [x] Job list component
- [x] System stats dashboard
- [x] API client (20 methods)
- [x] WebSocket integration
- [x] Lit Protocol authentication
- [x] Responsive design

**In Progress** 🚧:
- [ ] Analytics page with charts (for 50%)
- [ ] User profile page
- [ ] Settings page
- [ ] Dark mode toggle

**Planned** 📋:
- [ ] Job submission wizard
- [ ] Node registration flow
- [ ] Advanced filtering
- [ ] Export features
- [ ] Mobile app (React Native)
- [ ] Notifications system
- [ ] Multi-language support

---

## 🐛 Known Issues

- **WebSocket Reconnection**: Auto-reconnect logic can be improved
- **Redis Caching**: Not yet configured (pending Vercel KV setup)
- **Mobile Navigation**: Hamburger menu needs refinement
- **Chart Performance**: Large datasets can slow down rendering
- **Type Coverage**: Some API responses need better typing

See [Issues](https://github.com/jasonsprouse/y8-app/issues) for full list.

---

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Lit Protocol Docs](https://developer.litprotocol.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [The Beach Backend](https://github.com/jasonsprouse/the-beach)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Lead Developer**: Jason Sprouse ([@jasonsprouse](https://github.com/jasonsprouse))

**Contributors**: See [Contributors](https://github.com/jasonsprouse/y8-app/contributors)

---

## 🙏 Acknowledgments

- **Lit Protocol Team** - For the amazing decentralized auth infrastructure
- **Vercel** - For Next.js and hosting platform
- **Shadcn** - For the beautiful UI component library
- **Community Contributors** - For feedback and contributions

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/jasonsprouse/y8-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jasonsprouse/y8-app/discussions)
- **Email**: support@y8app.com (if applicable)
- **Discord**: Join our community (if applicable)

---

## 🔗 Links

- **Live App**: https://y8-app.vercel.app (or your domain)
- **Backend API**: https://api.y8app.com
- **Documentation**: https://docs.y8app.com
- **Status Page**: https://status.y8app.com

---

## 🎯 Roadmap

### Q1 2025
- ✅ Core dashboard functionality
- ✅ Real-time updates
- ✅ Payment tracking
- 🚧 Analytics and charts

### Q2 2025
- Job submission wizard
- Node registration flow
- Advanced search and filtering
- Performance optimizations

### Q3 2025
- Mobile app (React Native)
- Notification system
- Multi-language support
- Advanced analytics

### Q4 2025
- API marketplace
- Custom node configurations
- Advanced security features
- Enterprise features

---

<div align="center">

**Built with ❤️ using Next.js, React, and Lit Protocol**

⭐ **Star this repo** if you find it useful!

[Report Bug](https://github.com/jasonsprouse/y8-app/issues) · [Request Feature](https://github.com/jasonsprouse/y8-app/issues) · [Contribute](https://github.com/jasonsprouse/y8-app/pulls)

</div>
