"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, UserPreferences } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Sliders, 
  Activity,
  Camera,
  Compass,
  Mic,
  MessageSquare
} from 'lucide-react';
import styles from '../../styles/AiAssistant.module.css';

interface Message {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  isStreaming?: boolean;
  actions?: { 
    label: string; 
    actionKey?: keyof UserPreferences; 
    value?: string;
    type?: 'preference' | 'product' | 'link';
    productKey?: string;
    productName?: string;
    productPrice?: string;
    url?: string;
  }[];
}

const AUTOMATION_EXPLAINERS = {
  autonomous: {
    title: 'Full Autonomy Swarm',
    icon: '🤖',
    text: 'Full Autonomy empowers AI agents to execute self-directed outreach loops, dynamically adjusting targets, optimization vectors, and interaction strategies without operator intervention. Swarms autonomously self-correct based on real-time engagement and feedback indexes.'
  },
  scheduled: {
    title: 'Scheduled Cron Blocks',
    icon: '⏰',
    text: 'Cron Blocks schedule agent execution at specific calendar intervals. Workflows run strictly on predefined timeline blocks, facilitating structured task pipelines (e.g. daily balancing or social campaigns) with predictable resource consumption.'
  },
  manual: {
    title: 'Manual Standby Triggers',
    icon: '⚙️',
    text: 'Manual Standby leaves agents idle until the Operator directly triggers an execution cycle. Recommended for high-priority or sensitive operations requiring human oversight, verification, and signature confirmations before task finalization.'
  }
};

const STRATEGY_EXPLAINERS = {
  autonomous: {
    title: 'Autonomous Shifting Strategy',
    icon: '🤖',
    text: 'Autonomous Shifting allows AI work orchestrators to automatically shift container operations across nodes based on power grid metrics. When battery reserves fall below a 30% threshold, active compute containers migrate seamlessly to online nodes with peak solar generation without requiring manual Operator approvals.'
  },
  manual: {
    title: 'Manual Operator Override Strategy',
    icon: '⚙️',
    text: 'Manual Operator Override keeps all computational workloads and telemetry actions locked on their assigned physical node. In the event of a power drop, no migration or rerouting will take place until the operator cryptographically signs a signature request to authorize the state change.'
  },
  staking: {
    title: 'Staking Credits Strategy',
    icon: '🪙',
    text: 'Staking Credits balances resource overrides by placing node operations in a competitive marketplace. Excess capacity is auctioned dynamically to the highest-bidding computational tasks using token-weighted reputation stakes.'
  }
};

const DOMAIN_EXPLAINERS = {
  space: {
    title: 'Space Climate Construction',
    icon: '🛡️',
    text: 'Space Climate Construction coordinates albedo modulation models and Lagrangian L1 orbital shield simulations. Operators manage parameters to deflect solar radiation, aiming to mitigate greenhouse heating cycles globally. The minted telemetry logs directly calculate carbon credit allocations.'
  },
  food: {
    title: 'Controlled Environment Food Domes',
    icon: '🌾',
    text: 'Controlled Agriculture Domes manage target resource flows (moisture, pH, NPK balance) in urban vertical farming installations. Hydroponics microclimates are controlled by AI scheduling loops. Logs are synchronized to trace food supply origin audits.'
  },
  energy: {
    title: 'Decentralized Grid & Datacenter',
    icon: '⚡',
    text: 'Decentralized Grid systems coordinate Virtual Power Plant (VPP) energy assets (batteries, solar arrays) with edge datacenter compute loads. Heavy AI modeling container tasks migrate dynamically to regions with excess solar power to balance grid capacity.'
  },
  health: {
    title: 'Sanctuary Care & Micro-Mobility',
    icon: '🏥',
    text: 'Sanctuary Care coordinates physical cabin slot bookings with biometric smart locks and micro-mobility e-bike logistics. Smart contracts manage access validation based on decentralized identities (DIDs) and local P2P ratings.'
  }
};

const TRADE_EXPLAINERS = {
  all: {
    title: 'All Barter Feeds',
    icon: '📊',
    text: 'Allows you to monitor all categories of barter trade posts simultaneously. Safe Purchase Zones log rideshares, tools, services, and labor contracts directly onto the contract ledger watcher.'
  },
  general: {
    title: 'General Trade Postings',
    icon: '💬',
    text: 'General Trade includes informal P2P barter discussions, updates on node statuses, community warnings, and general inquiries regarding local zone operations.'
  },
  labor: {
    title: 'Sustainable Labor Exchange',
    icon: '🌾',
    text: 'Labor Exchange records on-site tasks like seeding CEA food domes, checking solar battery backups, or physical maintenance. Staking and rep-weighted profiles secure quality verification.'
  },
  services: {
    title: 'Operational Services Barter',
    icon: '🤝',
    text: 'Services Barter matches developers, security agents, or system admins exchanging virtual services like RPC configurations, contract audits, or satellite telemetry calculations.'
  },
  tool: {
    title: 'Decentralized Tool Rentals',
    icon: '🛠️',
    text: 'Tools Barter handles local tool sharing. Operators list items like soil pH meters, smart lock testers, or hardware rigs for short-term rental secured by smart contract deposits.'
  },
  rideshare: {
    title: 'Decentralized Nodes Ridesharing',
    icon: '🚲',
    text: 'Rideshare organizes green transit logs (such as electric carpools or e-bike rentals) to travel between physical dome facilities and registered safe zones.'
  }
};

interface QA {
  keywords: string[];
  response: string;
  actions?: { label: string; actionKey: keyof UserPreferences; value: string }[];
  priorityMultiplier?: number;
}

const QA_DATABASE: { [key: string]: QA[] } = {
  global: [
    {
      keywords: ['hello', 'hi', 'hey', 'help', 'assist', 'who are you', 'bot', 'copilot'],
      response: 'Greetings, Operator. I am the Y8 Swarm Copilot, a neural assistance node. I can explain any of the operational models (Domains, Balancing strategies, Barter Trade systems, Automation Scheduler styles) and help configure your parameters.'
    },
    {
      keywords: ['gps', 'location', 'tracking', 'map', 'coordinates', 'telemetry', 'compliance', 'locator', 'route'],
      response: 'GPS telemetry utilizes the browser\'s Geolocation API. When active, it polls your coordinates (such as 33.7592° N, -96.6686° W) and calculates the Haversine distance to the 30 global Safe Purchase Zones (SPZs) to find the 3 nearest compliance trade zones. This routing is computed locally in the browser to maintain Operator privacy and avoid third-party telemetry logging.'
    },
    {
      keywords: ['spz', 'safe purchase zone', 'safe zone', 'compliance zone'],
      response: 'Safe Purchase Zones (SPZs) are secure physical trade hubs registered on the decentralized ledger. They facilitate sovereign ID validation, smart lockers access, and sustainable barter registers.'
    },
    {
      keywords: ['permanent', 'save', 'saved', 'store', 'storage', 'localstorage', 'keep', 'database', 'persist', 'where is', 'saved to', 'post', 'posts'],
      response: 'Y8 stores all simulation data, physical node registries, scheduled agent jobs, and user preferences directly in your browser\'s local sandbox (localStorage). Posts made in the trade rooms are stored locally in-memory. If you clear your browser\'s site data, these local registries will be reset. In a production environment, these are anchored to decentralized IPFS storage and synchronized via Ethereum smart contracts.'
    },
    {
      keywords: ['youtube', 'video', 'shorts', 'watch', 'channel', 'media', 'tutorial'],
      response: 'Watch Y8 Network developer chronicles, system tutorials, and deployment highlights on our **[YouTube Channel](https://www.youtube.com/@GparadigmOrgLove)** and check out our quick updates on **[YouTube Shorts](https://www.youtube.com/@GparadigmOrgLove/shorts)**.'
    },
    {
      keywords: ['goodfaith', 'church', 'goodfaith.church', 'community', 'alliance', 'outpost'],
      response: 'The **[Good Faith Church (goodfaith.church)](https://goodfaith.church/)** is our central peer alliance and logistics outpost, facilitating Web3 coordination, sovereign ID validation, and localized trade rooms indexing.'
    }
  ],
  home: [
    {
      keywords: ['explain models', 'explain domains', 'what is this page', 'about domains', 'domains'],
      response: 'The Y8 Network operates four primary domains:\n\n1. 🛡️ Space Climate Construction: Orbit-based solar deflectors at L1 Lagrange to offset greenhouse heating.\n2. 🌾 CEA Food Domes: Hydroponic vertical farming monitored by automated scheduling bots.\n3. ⚡ Decentralized Grid: Balances energy assets (batteries, solar) with edge GPU datacenter compute loads.\n4. 🏥 Sanctuary Care: Cabin lock booking transits and micro-mobility e-bike fleets.'
    },
    {
      keywords: ['how to configure', 'set domain', 'change domain', 'primary domain', 'preference'],
      response: 'You can configure your Primary Domain default here. Selecting a preference will highlight that module across the dashboard layout:',
      actions: [
        { label: '🛡️ Set Space Climate', actionKey: 'primaryDomain', value: 'space' },
        { label: '🌾 Set CEA Food Domes', actionKey: 'primaryDomain', value: 'food' },
        { label: '⚡ Set Grid & Compute', actionKey: 'primaryDomain', value: 'energy' },
        { label: '🏥 Set Sanctuary Care', actionKey: 'primaryDomain', value: 'health' }
      ]
    }
  ],
  shop: [
    {
      keywords: ['explain models', 'explain strategies', 'balancing', 'strategy', 'load balancing'],
      response: 'The node capability platform supports three telemetry load-balancing strategies:\n\n1. 🤖 Autonomous Shifting: AI balances container workloads dynamically to solar peak nodes on charge drops.\n2. ⚙️ Manual Operator Override: Computes remain locked on nodes; requires explicit operator crypto-signature to reroute.\n3. 🪙 Staking Credits: Node capacity is auctioned to tasks via token stakes.'
    },
    {
      keywords: ['how to configure', 'set strategy', 'change strategy', 'balancing strategy'],
      response: 'You can set your default load-balancing override strategy preference below to dictate how your hardware node acts:',
      actions: [
        { label: '🤖 Set Autonomous Shifting', actionKey: 'balancingStrategy', value: 'autonomous' },
        { label: '⚙️ Set Manual Override', actionKey: 'balancingStrategy', value: 'manual' },
        { label: '🪙 Set Staking Credits', actionKey: 'balancingStrategy', value: 'staking' }
      ]
    },
    {
      keywords: ['map', 'earth', 'satellite', 'estimator', 'capability', 'formula', 'pue', 'solar'],
      response: 'The Satellite Map (powered by Leaflet & Esri World Imagery) allows picking latitude/longitude coordinates. The capability estimator calculates latitude-dependent yields: Peak Solar Irradiance based on Earth tilt, PUE (Power Usage Effectiveness) based on climate-cooling suitability, footprint sizing, and max edge compute TFLOPS.'
    }
  ],
  blog: [
    {
      keywords: ['explain models', 'barter', 'trades', 'tags', 'explain tags', 'trade preference'],
      response: 'The room chat is organized by barter categories:\n\n1. 🛠️ Tools: Shareable hardware rentals.\n2. 🤝 Services: Specialized tasks (e.g. server setup, contract deployment).\n3. 🌾 Labor: Seeding CEA food domes or physical maintenance.\n4. 🚲 Rideshare: Fleet transit between nodes.\n5. 📦 Goods: Barter commodities (e.g. food baskets, spare parts).'
    },
    {
      keywords: ['how to configure', 'set tag', 'change tag', 'trade preference', 'post', 'posting', 'offer', 'offering', 'add post', 'make post', 'create post'],
      response: 'To post or filter items in the P2P Trade Rooms, we need to establish your intent. Are you offering tools, labor, services, rideshare, or posting a general question/post? Select one below to configure your filter preference and draft guide:',
      actions: [
        { label: '🛠️ Renting/Offering Tools', actionKey: 'tradePreference', value: 'tool' },
        { label: '🌾 Offering/Requesting Labor', actionKey: 'tradePreference', value: 'labor' },
        { label: '🤝 Providing/Requesting Services', actionKey: 'tradePreference', value: 'services' },
        { label: '🚲 Offering/Finding Rideshare', actionKey: 'tradePreference', value: 'rideshare' },
        { label: '💬 General Question or Post', actionKey: 'tradePreference', value: 'general' }
      ]
    }
  ],
  calendar: [
    {
      keywords: ['explain models', 'automation', 'scheduler', 'styles', 'automation style'],
      response: 'The Swarm Scheduler supports three agent execution patterns:\n\n1. 🤖 Full Autonomy: Swarms auto-adjust outreach targets and optimize engagement dynamically.\n2. ⏰ Cron Blocks: Runs scheduled task pipelines on calendar block schedules.\n3. ⚙️ Manual Triggers: Keeps agents on standby until manual operator trigger execution cycles.'
    },
    {
      keywords: ['how to configure', 'change style', 'set style', 'automation style preference'],
      response: 'Configure your default swarm deployment style preference to set agent startup behaviors:',
      actions: [
        { label: '🤖 Set Full Autonomy', actionKey: 'automationStyle', value: 'autonomous' },
        { label: '⏰ Set Cron Blocks', actionKey: 'automationStyle', value: 'scheduled' },
        { label: '⚙️ Set Manual Triggers', actionKey: 'automationStyle', value: 'manual' }
      ]
    },
    {
      keywords: ['agent', 'job', 'scheduler', 'execute', 'run job', 'terminal'],
      response: 'To deploy a scheduled bot, choose an AI specialty and fill out the goal instructions. You can run the bot instantly using the Executive Terminal to stream the neural nodes processing, earning operator XP upon completion.'
    }
  ],
  space: [
    {
      keywords: ['explain models', 'climate', 'sunshade', 'space climate', 'deflection'],
      response: 'The space climate construction node simulates albedo deflection. By positioning the virtual sunshade at Lagrangian L1 orbit coordinates, operators calculate the watts/m2 solar offset ratio. Minting the deflection logs issues carbon-offset telemetry records.'
    }
  ],
  about: [
    {
      keywords: ['who is y8', 'about us', 'about y8', 'glow', 'glow effect'],
      response: 'Y8 Network is a decentralized logistics PWA coordinating space deflection projects, hydroponic food distribution, VPP grid compute, and sanctuary cabins. The About Us module utilizes a faint cybernetic-blue text glow to symbolize Web3 telemetry connectivity.'
    }
  ]
};

export default function AiAssistant() {
  const { preferences, updatePreference, isAuthenticated, user } = useAuth();
  const walletAddress = user?.address || "0x0000000000000000000000000000000000000000";
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [configuredKeys, setConfiguredKeys] = useState<{ [key: string]: string }>({});

  const [activeTool, setActiveTool] = useState<'vision' | 'accelerometer' | 'gyroscope' | 'microphone' | 'text'>('text');
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [accel, setAccel] = useState({ x: '0.020', y: '0.980', z: '-0.040' });
  const [gyro, setGyro] = useState({ pitch: '12.4', roll: '-3.5', yaw: '231.8' });

  // Proof of Entropy states
  const [entropyBits, setEntropyBits] = useState(0);
  const [entropySeed, setEntropySeed] = useState('0x' + '0'.repeat(64));
  const [entropyLogs, setEntropyLogs] = useState<string[]>([]);
  const [showEntropyDashboard, setShowEntropyDashboard] = useState(false);
  const [showInstallHub, setShowInstallHub] = useState(false);
  
  // Oculus & Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOculusDevice, setIsOculusDevice] = useState(false);
  const [oculusLinked, setOculusLinked] = useState(false);
  const [vrTelemetry, setVrTelemetry] = useState({
    headset: { x: '0.00', y: '1.62', z: '0.00' },
    leftTouch: { accel: '0.00', buttons: 'STANDBY' },
    rightTouch: { accel: '0.00', buttons: 'STANDBY' }
  });

  // Real Camera & Hugging Face model loading states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Device & Installer screen-size / association states
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [operatorDevices, setOperatorDevices] = useState<any[]>([]);
  const [localDeviceId, setLocalDeviceId] = useState<string>('');
  const [hasRealGyro, setHasRealGyro] = useState(false);

  // Handle mobile screen size detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const mobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        setIsMobileScreen(window.innerWidth <= 768 || mobileUA);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Check Oculus/Quest user agents and navigator.xr availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isOculus = /Oculus/i.test(ua) || /Quest/i.test(ua) || (navigator as any).xr !== undefined;
      setIsOculusDevice(isOculus);
    }
  }, []);

  // Auto-register and associate device with walletAddress
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let localDevId = localStorage.getItem('y8_local_device_id');
    if (!localDevId) {
      localDevId = 'dev-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('y8_local_device_id', localDevId);
    }
    setLocalDeviceId(localDevId);

    const updateDevicesRegistry = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      
      let devType: 'desktop_pwa' | 'mobile_pwa' | 'oculus_pwa' | 'desktop_browser' | 'mobile_browser' | 'oculus_browser';
      let devName = '';

      if (isOculusDevice || oculusLinked) {
        devType = isPWA ? 'oculus_pwa' : 'oculus_browser';
        devName = isPWA ? '🽽 Meta Quest VR App Outpost' : '🽽 Meta Quest VR Outpost (Web)';
      } else if (isMobileScreen) {
        devType = isPWA ? 'mobile_pwa' : 'mobile_browser';
        devName = isPWA ? '📱 Mobile Console App (PWA)' : '📱 Mobile Browser Client';
      } else {
        devType = isPWA ? 'desktop_pwa' : 'desktop_browser';
        devName = isPWA ? '💻 Desktop Console App (PWA)' : '💻 Desktop Browser Client';
      }

      const stored = localStorage.getItem('y8_operator_devices');
      let devices: any[] = [];
      if (stored) {
        try { devices = JSON.parse(stored); } catch {}
      }

      const index = devices.findIndex((d: any) => d.deviceId === localDevId);
      
      const thisDevice = {
        deviceId: localDevId,
        walletAddress,
        deviceName: devName,
        deviceType: devType,
        lastActive: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
        isPWA
      };

      if (index >= 0) {
        devices[index] = thisDevice;
      } else {
        devices.push(thisDevice);
      }

      localStorage.setItem('y8_operator_devices', JSON.stringify(devices));
      window.dispatchEvent(new Event('storage'));
    };

    updateDevicesRegistry();
  }, [walletAddress, isOculusDevice, oculusLinked, isMobileScreen]);

  // Sync state with localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncDevicesList = () => {
      const stored = localStorage.getItem('y8_operator_devices');
      const devId = localStorage.getItem('y8_local_device_id') || '';
      
      if (stored) {
        try {
          const allDevices = JSON.parse(stored);
          const filtered = allDevices.filter((d: any) => d.walletAddress === walletAddress);
          setOperatorDevices(filtered);
        } catch {}
      }
    };

    syncDevicesList();
    window.addEventListener('storage', syncDevicesList);
    return () => window.removeEventListener('storage', syncDevicesList);
  }, [walletAddress]);

  // Hook standard PWA install prompts
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setMessages(prev => [...prev, { sender: 'system', text: '📥 PWA App installed successfully on this device!' }]);
    }
    setDeferredPrompt(null);
  };

  // Proof-of-Entropy harvesting: Mouse movements listener
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const dist = Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
      if (dist < 40) return; 
      lastX = e.clientX;
      lastY = e.clientY;

      setEntropyBits(prev => {
        if (prev >= 512) return 512;
        const add = 1.2;
        return Math.min(512, prev + add);
      });

      setEntropySeed(prev => {
        const valStr = (e.clientX * 17 + e.clientY * 31).toString(16);
        return '0x' + Array.from({ length: 64 }, (_, i) => {
          const char = prev.charAt(i + 2);
          const offsetChar = valStr.charAt(i % valStr.length) || 'a';
          return ((parseInt(char, 16) + parseInt(offsetChar, 16)) % 16).toString(16);
        }).join('');
      });

      setEntropyLogs(prev => {
        const log = `[MOUSE] Coords x:${e.clientX}, y:${e.clientY} (+1.2 bits)`;
        return [log, ...prev.slice(0, 15)];
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Proof-of-Entropy harvesting: Keyboard keypresses listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setEntropyBits(prev => {
        if (prev >= 512) return 512;
        const add = 4.8;
        return Math.min(512, prev + add);
      });

      setEntropySeed(prev => {
        const valStr = (e.keyCode * 53).toString(16);
        return '0x' + Array.from({ length: 64 }, (_, i) => {
          const char = prev.charAt(i + 2);
          const offsetChar = valStr.charAt(i % valStr.length) || '7';
          return ((parseInt(char, 16) + parseInt(offsetChar, 16)) % 16).toString(16);
        }).join('');
      });

      setEntropyLogs(prev => {
        const log = `[KEYPRESS] KeyCode:${e.keyCode} (+4.8 bits)`;
        return [log, ...prev.slice(0, 15)];
      });
    };

    window.addEventListener('keydown', handleKeyDown);
  }, []);

  // Proof-of-Entropy harvesting: Touchscreen movements listener (for mobile phones and tablets)
  useEffect(() => {
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const dist = Math.abs(touch.clientX - lastTouchX) + Math.abs(touch.clientY - lastTouchY);
      
      // Minimum distance threshold of 30 pixels
      if (dist < 30) return;
      
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;

      setEntropyBits(prev => {
        if (prev >= 512) return 512;
        const add = 1.8; // Touchscreen movements give +1.8 bits
        return Math.min(512, prev + add);
      });

      setEntropySeed(prev => {
        const valStr = (Math.floor(touch.clientX * 23) + Math.floor(touch.clientY * 41)).toString(16);
        return '0x' + Array.from({ length: 64 }, (_, i) => {
          const char = prev.charAt(i + 2);
          const offsetChar = valStr.charAt(i % valStr.length) || 'b';
          return ((parseInt(char, 16) + parseInt(offsetChar, 16)) % 16).toString(16);
        }).join('');
      });

      setEntropyLogs(prev => {
        const log = `[TOUCHSCREEN] Motion x:${touch.clientX.toFixed(0)}, y:${touch.clientY.toFixed(0)} (+1.8 bits)`;
        return [log, ...prev.slice(0, 15)];
      });
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => window.removeEventListener('touchmove', handleTouchMove);
  }, []);

  // Real WebXR Telemetry session & simulated fallback for Quest VR/XR Glasses and Headsets
  useEffect(() => {
    if (!oculusLinked) return;

    let activeSession: any = null;
    let animFrameId: number;
    let fallbackInterval: NodeJS.Timeout;
    let lastHeadsetPos = { x: 0, y: 0, z: 0 };
    let lastLeftPos = { x: 0, y: 0, z: 0 };
    let lastRightPos = { x: 0, y: 0, z: 0 };

    const startXRSession = async () => {
      const xr = (navigator as any).xr;
      if (!xr) {
        startFallbackInterval();
        return;
      }

      try {
        const isSupported = await xr.isSessionSupported('inline');
        if (!isSupported) {
          startFallbackInterval();
          return;
        }

        const session = await xr.requestSession('inline');
        activeSession = session;

        const refSpace = await session.requestReferenceSpace('viewer');

        const onXRFrame = (time: number, frame: any) => {
          const pose = frame.getViewerPose(refSpace);
          let headX = '0.00';
          let headY = '1.62';
          let headZ = '0.00';
          let headMoved = false;

          if (pose) {
            const pos = pose.transform.position;
            headX = pos.x.toFixed(2);
            headY = (1.62 + pos.y).toFixed(2);
            headZ = pos.z.toFixed(2);

            const dist = Math.abs(pos.x - lastHeadsetPos.x) + 
                         Math.abs(pos.y - lastHeadsetPos.y) + 
                         Math.abs(pos.z - lastHeadsetPos.z);
            if (dist > 0.05) {
              headMoved = true;
              lastHeadsetPos = { x: pos.x, y: pos.y, z: pos.z };
            }
          }

          // Check controllers
          let leftAccel = '0.00';
          let leftButtons = 'STANDBY';
          let rightAccel = '0.00';
          let rightButtons = 'STANDBY';
          let controllersMoved = false;

          for (const source of session.inputSources) {
            const gripSpace = source.gripSpace;
            if (gripSpace) {
              const gripPose = frame.getPose(gripSpace, refSpace);
              if (gripPose) {
                const pos = gripPose.transform.position;
                const hand = source.handedness;
                
                // Read buttons if available
                let btnState = 'STANDBY';
                if (source.gamepad) {
                  const gp = source.gamepad;
                  if (gp.buttons[0]?.pressed) btnState = 'TRIGGER_HELD';
                  else if (gp.buttons[1]?.pressed) btnState = 'GRIP_HELD';
                }

                if (hand === 'left') {
                  const dist = Math.abs(pos.x - lastLeftPos.x) + Math.abs(pos.y - lastLeftPos.y) + Math.abs(pos.z - lastLeftPos.z);
                  leftAccel = (dist * 10).toFixed(2);
                  leftButtons = btnState;
                  if (dist > 0.05) {
                    controllersMoved = true;
                    lastLeftPos = { x: pos.x, y: pos.y, z: pos.z };
                  }
                } else if (hand === 'right') {
                  const dist = Math.abs(pos.x - lastRightPos.x) + Math.abs(pos.y - lastRightPos.y) + Math.abs(pos.z - lastRightPos.z);
                  rightAccel = (dist * 10).toFixed(2);
                  rightButtons = btnState;
                  if (dist > 0.05) {
                    controllersMoved = true;
                    lastRightPos = { x: pos.x, y: pos.y, z: pos.z };
                  }
                }
              }
            }
          }

          // Update state with WebXR hardware readings
          setVrTelemetry({
            headset: { x: headX, y: headY, z: headZ },
            leftTouch: { accel: leftAccel, buttons: leftButtons },
            rightTouch: { accel: rightAccel, buttons: rightButtons }
          });

          // If there is actual movement, harvest entropy
          if (headMoved || controllersMoved) {
            setEntropyBits(prev => {
              if (prev >= 512) return 512;
              const add = headMoved && controllersMoved ? 15.6 : 8.4;
              return Math.min(512, prev + add);
            });

            setEntropySeed(prev => {
              const valStr = (Math.floor(parseFloat(headX) * 11) + Math.floor(parseFloat(leftAccel) * 47) + Math.floor(parseFloat(rightAccel) * 61)).toString(16);
              return '0x' + Array.from({ length: 64 }, (_, i) => {
                const char = prev.charAt(i + 2);
                const offsetChar = valStr.charAt(i % valStr.length) || 'f';
                return ((parseInt(char, 16) + parseInt(offsetChar, 16)) % 16).toString(16);
              }).join('');
            });

            setEntropyLogs(prev => {
              const log = `[XR HARDWARE] Headset: [x:${headX}, y:${headY}] | Controllers Left: ${leftAccel}G, Right: ${rightAccel}G (+8.4 bits)`;
              return [log, ...prev.slice(0, 15)];
            });
          }

          animFrameId = session.requestAnimationFrame(onXRFrame);
        };

        animFrameId = session.requestAnimationFrame(onXRFrame);
      } catch (err) {
        console.warn("Real WebXR session request rejected or failed. Falling back to simulation.", err);
        startFallbackInterval();
      }
    };

    const startFallbackInterval = () => {
      fallbackInterval = setInterval(() => {
        const hX = (Math.sin(Date.now() / 1000) * 0.4).toFixed(2);
        const hY = (1.62 + Math.cos(Date.now() / 2000) * 0.05).toFixed(2);
        const hZ = (Math.cos(Date.now() / 1500) * 0.3).toFixed(2);
        const lA = (Math.random() * 1.8).toFixed(2);
        const rA = (Math.random() * 2.2).toFixed(2);

        setVrTelemetry({
          headset: { x: hX, y: hY, z: hZ },
          leftTouch: { accel: lA, buttons: Math.random() > 0.7 ? 'TRIGGER_HELD' : 'STANDBY' },
          rightTouch: { accel: rA, buttons: Math.random() > 0.7 ? 'GRIP_HELD' : 'STANDBY' }
        });

        setEntropyBits(prev => {
          if (prev >= 512) return 512;
          const add = 12.8;
          return Math.min(512, prev + add);
        });

        setEntropySeed(prev => {
          const valStr = Math.floor(Math.random() * 1000).toString(16);
          return '0x' + Array.from({ length: 64 }, (_, i) => {
            const char = prev.charAt(i + 2);
            const offsetChar = valStr.charAt(i % valStr.length) || 'd';
            return ((parseInt(char, 16) + parseInt(offsetChar, 16)) % 16).toString(16);
          }).join('');
        });

        setEntropyLogs(prev => {
          const log = `[META QUEST SIM] Headset: [x:${hX}, y:${hY}] | Controllers: Left ${lA}G, Right ${rA}G (+12.8 bits)`;
          return [log, ...prev.slice(0, 15)];
        });
      }, 800);
    };

    startXRSession();

    return () => {
      if (activeSession) {
        activeSession.end();
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [oculusLinked]);

  const handleSimulateVRShake = () => {
    if (!oculusLinked) return;
    
    setVrTelemetry(prev => ({
      ...prev,
      leftTouch: { accel: '4.85', buttons: 'TRIGGER_SHAKE' },
      rightTouch: { accel: '5.12', buttons: 'GRIP_SHAKE' }
    }));

    setEntropyBits(prev => Math.min(512, prev + 64));

    setEntropyLogs(prev => [
      `[META QUEST SHAKE] Touch controllers dynamic acceleration spike (+64 bits)`,
      ...prev.slice(0, 15)
    ]);
  };

  const handleCommitEntropyBlock = () => {
    if (entropyBits < 512) return;

    const finalBlockSeed = entropySeed;
    setEntropyBits(0);
    setEntropySeed('0x' + '0'.repeat(64));

    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `⚖️ [Proof-of-Entropy Commit] Finalizing block...`
      },
      {
        sender: 'system',
        text: `🎉 Block successfully mined! Hash: ${finalBlockSeed.slice(0, 24)}... (+100 XP)`
      }
    ]);

    if (typeof window !== 'undefined') {
      const storedXp = localStorage.getItem('y8_user_xp');
      const currentXp = storedXp ? parseInt(storedXp) : 240;
      const nextXp = currentXp + 100;
      localStorage.setItem('y8_user_xp', nextXp.toString());
      window.dispatchEvent(new Event('storage'));
    }

    streamResponse(`🤖 **Proof-of-Entropy Block Finalized**:
- Committed block hash: **${finalBlockSeed}**
- Reputation stake verified: **+100 XP granted**.
- Your local physical entropy pool has been reset to standby mode. Keep moving, writing, or syncing telemetry to mine the next block!`);
  };

  // Fluctuate telemetry values when accelerometer or gyroscope are active
  useEffect(() => {
    if (activeTool !== 'accelerometer' && activeTool !== 'gyroscope') return;

    const interval = setInterval(() => {
      if (activeTool === 'accelerometer') {
        setAccel({
          x: (0.02 + (Math.random() - 0.5) * 0.04).toFixed(3),
          y: (0.98 + (Math.random() - 0.5) * 0.02).toFixed(3),
          z: (-0.04 + (Math.random() - 0.5) * 0.05).toFixed(3)
        });
      } else if (activeTool === 'gyroscope') {
        if (!hasRealGyro) {
          setGyro({
            pitch: (12.4 + (Math.random() - 0.5) * 1.5).toFixed(1),
            roll: (-3.5 + (Math.random() - 0.5) * 1.0).toFixed(1),
            yaw: (231.8 + (Math.random() - 0.5) * 2.0).toFixed(1)
          });
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, [activeTool, hasRealGyro]);

  const handleRequestGyroPermission = async () => {
    if (typeof window === 'undefined') return;
    
    const DeviceOrientation = (window as any).DeviceOrientationEvent;
    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientation.requestPermission();
        if (permissionState === 'granted') {
          setMessages(prev => [
            ...prev,
            { sender: 'system', text: '🧭 [GYROSCOPE] DeviceOrientation permissions granted.' }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { sender: 'system', text: '⚠️ [GYROSCOPE] DeviceOrientation permissions denied.' }
          ]);
        }
      } catch (err) {
        console.error('Failed to request orientation permission:', err);
      }
    }
  };

  const getHFModelForPathname = (path: string) => {
    if (path === '/') {
      return {
        id: 'google/vit-base-patch16-224',
        name: 'Vision Transformer (ViT)',
        purpose: 'Operator biometric identity confirmation'
      };
    } else if (path.startsWith('/shop')) {
      return {
        id: 'facebook/detr-resnet-50',
        name: 'DEtection TRansformer (DETR)',
        purpose: 'Physical edge hardware & node equipment detection'
      };
    } else if (path.startsWith('/blog')) {
      return {
        id: 'Salesforce/blip-image-captioning',
        name: 'BLIP Image Captioning',
        purpose: 'Barter item visual validation & metadata extraction'
      };
    } else if (path.startsWith('/calendar')) {
      return {
        id: 'microsoft/git-base',
        name: 'Generative Image-to-text (GIT)',
        purpose: 'Edge scheduler console UI & layout orchestration check'
      };
    } else {
      return {
        id: 'openai/clip-vit-base-patch32',
        name: 'CLIP Visual Concept Mapper',
        purpose: 'General zero-shot object classification'
      };
    }
  };

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' }
        });
        setMediaStream(stream);
        setCameraActive(true);
      } else {
        alert("Camera media devices API not supported on this browser.");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera device. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
  };

  // Sync video source object reactively
  useEffect(() => {
    if (cameraActive && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [cameraActive, mediaStream]);

  // Turn off camera if panel closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const handleSelectTool = (tool: 'vision' | 'accelerometer' | 'gyroscope' | 'microphone' | 'text') => {
    setActiveTool(tool);
    if (tool !== 'vision') {
      stopCamera();
    }
    if (tool === 'gyroscope') {
      handleRequestGyroPermission();
    }
  };

  // Real Gyroscope / Device Orientation listener for Proof-of-Entropy harvesting
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastAlpha = 0;
    let lastBeta = 0;
    let lastGamma = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const alpha = e.alpha !== null ? e.alpha : 0;
      const beta = e.beta !== null ? e.beta : 0;
      const gamma = e.gamma !== null ? e.gamma : 0;

      // Calculate delta to check if the device actually moved
      const delta = Math.abs(alpha - lastAlpha) + Math.abs(beta - lastBeta) + Math.abs(gamma - lastGamma);

      if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
        setHasRealGyro(true);
      }

      // 1.5 degree sensitivity threshold
      if (delta > 1.5) {
        lastAlpha = alpha;
        lastBeta = beta;
        lastGamma = gamma;

        // Feed real hardware data to Gyro telemetry dashboard
        setGyro({
          pitch: beta.toFixed(1),
          roll: gamma.toFixed(1),
          yaw: alpha.toFixed(1)
        });

        // Harvest entropy bits from orientation change
        setEntropyBits(prev => {
          if (prev >= 512) return 512;
          const add = 2.4; // 2.4 bits per orientation movement tick
          return Math.min(512, prev + add);
        });

        setEntropySeed(prev => {
          const valStr = (Math.floor(alpha * 17) + Math.floor(beta * 31) + Math.floor(gamma * 53)).toString(16);
          return '0x' + Array.from({ length: 64 }, (_, i) => {
            const char = prev.charAt(i + 2);
            const offsetChar = valStr.charAt(i % valStr.length) || 'e';
            return ((parseInt(char, 16) + parseInt(offsetChar, 16)) % 16).toString(16);
          }).join('');
        });

        setEntropyLogs(prev => {
          const log = `[GYRO TELEMETRY] Pitch:${beta.toFixed(1)}° | Roll:${gamma.toFixed(1)}° | Yaw:${alpha.toFixed(1)}° (+2.4 bits)`;
          return [log, ...prev.slice(0, 15)];
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handleTriggerVisionScan = () => {
    if (isScanning || isTyping) return;
    setIsScanning(true);
    
    const hfModel = getHFModelForPathname(pathname);
    
    // Log system event
    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `📸 [AI VISION] Initializing camera frame capture...`
      }
    ]);

    // Phase 1: Contacting HF
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'system',
          text: `🤗 [HUGGING FACE] Loading pipeline model "${hfModel.id}"...`
        }
      ]);
    }, 600);

    // Phase 2: Resolving weights & running classification
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'system',
          text: `⚡ [INFERENCE] Downloading tensor weights & executing concept mapping classification...`
        }
      ]);
    }, 1500);

    // Phase 3: Reporting
    setTimeout(() => {
      setIsScanning(false);
      
      let scanReport = '';
      if (pathname === '/') {
        scanReport = `🛡️ **Vision Scan Report (Home Dashboard)**:
- **Hugging Face Model**: \`${hfModel.id}\` (${hfModel.name})
- **Classification Output**: Operator facial biometrics matched.
- Detected 4 operational bento modules (Space, Food, Grid, Sanctuary).
- Active GPU compute load and Virtual Power Plant graphs are fully rendered.
- Current styling is verified: dynamic responsive grids, custom neon borders, and cybernetic telemetry indicators are aligned.`;
      } else if (pathname.startsWith('/shop')) {
        scanReport = `🛒 **Vision Scan Report (Node Market)**:
- **Hugging Face Model**: \`${hfModel.id}\` (${hfModel.name})
- **Object Detection Output**: Hardware server racks (94% confidence), Solar array nodes (98% confidence) detected in viewport.
- Detected interactive **Esri World Satellite Map** selector container.
- Geolocation crosshair active at user-selected markers.
- Sizing capability estimations (Solar irradiance yield, cooling PUE suitability, dropship capacity coefficients) are correctly bound to coordinates.
- Found 5 franchise license NFT packages available.`;
      } else if (pathname.startsWith('/blog')) {
        scanReport = `💬 **Vision Scan Report (P2P Barter Rooms)**:
- **Hugging Face Model**: \`${hfModel.id}\` (${hfModel.name})
- **Visual Description Output**: Localized trade item matches barter listings.
- Detected live trade rooms feed categorized by Tag filters.
- Localized GPS locator card is active with dynamic SPZ slider controls.
- Three-dimensional WebGL globe container is spinning and tracking target node coordinates.`;
      } else if (pathname.startsWith('/calendar')) {
        scanReport = `⏰ **Vision Scan Report (Swarm Scheduler)**:
- **Hugging Face Model**: \`${hfModel.id}\` (${hfModel.name})
- **Layout Parsing Output**: Calendar timeline scheduling block boundaries resolved.
- Detected AI Agent Job creation forms and calendar timelines.
- Digital growth presets (Outreach, Subscribers, Likes) are loaded.
- Direct SSH/RPC neural terminal logger is streaming active telemetry events.`;
      } else if (pathname.startsWith('/space')) {
        scanReport = `🛰️ **Vision Scan Report (Lagrangian L1 Sunshade)**:
- **Hugging Face Model**: \`${hfModel.id}\` (${hfModel.name})
- **Metadata Output**: Albedo coordinate slider parameters matched.
- Detected orbital albedo deflection coordinate slider.
- Real-time carbon-offset yield ledger table is mounted.
- Dynamic money feedback staking registry tracking NFT funding loop.`;
      } else if (pathname.startsWith('/about-us')) {
        scanReport = `📺 **Vision Scan Report (About Us)**:
- **Hugging Face Model**: \`${hfModel.id}\` (${hfModel.name})
- **Theme Analysis Output**: Cybernetic shadows and glow assets validated.
- Detected Good Faith Church outposts portal links.
- YouTube channel/shorts video embeds and redirects are operational.
- Verified visual theme: Faint cybernetic text shadow glow (\`rgba(56, 189, 248, 0.25)\`) is rendering correctly.`;
      } else {
        scanReport = `📡 **Vision Scan Report (Standard Page Container)**:
- **Hugging Face Model**: \`${hfModel.id}\` (${hfModel.name})
- **Classification Output**: Visual concept mapping completed successfully.
- Detected active Next.js page container.
- CSS layout classes are standard and navigation headers are synced.`;
      }

      streamResponse(scanReport);
    }, 2800);
  };

  const handleTriggerAccelSimulation = () => {
    if (isTyping) return;
    
    // Simulate sudden violent spike
    setAccel({ x: '-1.482', y: '2.109', z: '0.854' });

    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `📱 [ACCELEROMETER] Sensor tilt/shake event detected: [X: -1.482 G, Y: 2.109 G, Z: 0.854 G]`
      }
    ]);

    setTimeout(() => {
      // Stabilization response
      const report = `⚖️ **Accelerometer Telemetry Report**:
- Tilt threshold exceeded during simulated operator node motion.
- Running automatic structural stabilization protocols...
- Gravity vector successfully resolved to vertical coordinate axis.
- Balance factor restored: **STABLE (1.00 G base gravity weight)**. All local chassis locks secured.`;
      
      streamResponse(report);
    }, 300);
  };

  const handleTriggerGyroAlignment = () => {
    if (isTyping) return;

    // Simulate aligning yaw to true north / nearest SPZ
    setGyro({ pitch: '0.0', roll: '0.0', yaw: '0.0' });

    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `🧭 [GYROSCOPE] Calibrating rotational bearings... Locking Pitch/Roll to zero plane. Aligning Yaw bearing.`
      }
    ]);

    setTimeout(() => {
      const report = `🧭 **Gyroscope Bearing Report**:
- Rotational Velocity: 0.00 rad/s.
- Absolute Heading: **0.0° (True North Compliance Bearing)**.
- Alignment vector synced with local Safe Purchase Zone (SPZ) gateway transceiver. Dynamic navigation calculations updated.`;
      
      streamResponse(report);
    }, 300);
  };

  const handleTriggerVoiceRecording = () => {
    if (isListening || isTyping) return;
    setIsListening(true);

    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `🎤 [MICROPHONE] Activating audio wave capture... Listening for operator command.`
      }
    ]);

    setTimeout(() => {
      setIsListening(false);
      
      // Determine query based on path
      let voiceQuery = 'explain models';
      if (pathname === '/') {
        voiceQuery = 'explain home dashboard models';
      } else if (pathname.startsWith('/shop')) {
        voiceQuery = 'explain balancing strategy options';
      } else if (pathname.startsWith('/blog')) {
        voiceQuery = 'explain trade preference tags';
      } else if (pathname.startsWith('/calendar')) {
        voiceQuery = 'explain automation scheduler style';
      } else if (pathname.startsWith('/space')) {
        voiceQuery = 'explain space climate deflection';
      } else if (pathname.startsWith('/about-us')) {
        voiceQuery = 'who is y8 network?';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `🎙️ [Voice Command]: "${voiceQuery}"`
        }
      ]);

      const answer = getAnswer(voiceQuery);
      setTimeout(() => {
        streamResponse(answer.text, answer.actions);
      }, 400);
    }, 2500);
  };

  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      
      const regex = /(\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\))/g;
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        const matchIndex = match.index;
        
        if (matchIndex > lastIndex) {
          parts.push(line.slice(lastIndex, matchIndex));
        }
        
        if (match[0].startsWith('**')) {
          parts.push(<strong key={matchIndex} style={{ color: '#fff', fontWeight: 600 }}>{match[2]}</strong>);
        } else {
          parts.push(
            <a 
              key={matchIndex} 
              href={match[4]} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: '#00f5d4', 
                textDecoration: 'underline', 
                fontWeight: 'bold',
                cursor: 'pointer' 
              }}
            >
              {match[3]}
            </a>
          );
        }
        
        lastIndex = regex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }
      
      return (
        <div key={lineIdx} style={{ minHeight: line === '' ? '0.6em' : 'auto', marginBottom: '0.2rem' }}>
          {parts}
        </div>
      );
    });
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current module metadata
  const getPageInfo = (path: string) => {
    if (path === '/') return { name: 'Home Dashboard', key: 'home' };
    if (path.startsWith('/shop')) return { name: 'Node Market', key: 'shop' };
    if (path.startsWith('/blog')) return { name: 'P2P Trade Rooms', key: 'blog' };
    if (path.startsWith('/calendar')) return { name: 'AI Swarm Scheduler', key: 'calendar' };
    if (path.startsWith('/space')) return { name: 'Space Climate Construction', key: 'space' };
    if (path.startsWith('/about-us')) return { name: 'About Y8 Network', key: 'about' };
    return { name: 'System Core', key: 'global' };
  };

  const pageInfo = getPageInfo(pathname);

  // Check if a product has been minted or bought from local storage
  const isProductOwned = (key: string) => {
    if (typeof window === 'undefined') return false;
    
    // For licenses or art collections
    if (['space', 'food', 'energy', 'health', 'dropship', 'y_harps', 'g_harps'].includes(key)) {
      if (key === 'y_harps' || key === 'g_harps') {
        const storedArt = localStorage.getItem('y8_owned_art');
        if (storedArt) {
          try {
            const artMap = JSON.parse(storedArt);
            if (artMap[key]) return true;
          } catch {}
        }
      }

      const stored = localStorage.getItem('y8_shop_licenses');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const found = list.find((lic: any) => lic.domain === key);
          return found?.isMinted || false;
        } catch {}
      }
    }
    
    // For market items
    if (key.startsWith('m')) {
      const stored = localStorage.getItem('y8_shop_market');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const found = list.find((item: any) => item.id === key);
          return found?.isBought || false;
        } catch {}
      }
    }

    return false;
  };

  // Simulate Web3 Purchase Transaction
  const handlePurchaseProduct = (productKey: string, productName: string, price: string) => {
    if (typeof window === 'undefined') return;

    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `⏳ Initiating cryptographic contract call... Signing transaction payload for ${productName} (${price})`
      }
    ]);

    setTimeout(() => {
      const fakeTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const fakeTokenId = Math.floor(Math.random() * 10000).toString();

      // 1. If it's a license domain
      if (['space', 'food', 'energy', 'health', 'dropship'].includes(productKey)) {
        const stored = localStorage.getItem('y8_shop_licenses');
        let list = [];
        if (stored) {
          try { list = JSON.parse(stored); } catch {}
        }
        
        const updated = list.map((lic: any) => {
          if (lic.domain === productKey) {
            return { ...lic, isMinted: true, tokenId: fakeTokenId };
          }
          return lic;
        });
        localStorage.setItem('y8_shop_licenses', JSON.stringify(updated));

        // Add ledger log
        const storedLedger = localStorage.getItem('y8_shop_ledger');
        let ledger = [];
        if (storedLedger) {
          try { ledger = JSON.parse(storedLedger); } catch {}
        }
        const newEvent = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'TX' as const,
          message: `Minted License NFT for ${productKey.toUpperCase()} via AI Copilot. TokenID: #${fakeTokenId}, TxHash: ${fakeTxHash.slice(0, 16)}...`
        };
        localStorage.setItem('y8_shop_ledger', JSON.stringify([newEvent, ...ledger]));
      }
      
      // 2. If it's a market item
      if (productKey.startsWith('m')) {
        const stored = localStorage.getItem('y8_shop_market');
        let list = [];
        if (stored) {
          try { list = JSON.parse(stored); } catch {}
        }
        
        const updated = list.map((item: any) => {
          if (item.id === productKey) {
            return { ...item, isBought: true };
          }
          return item;
        });
        localStorage.setItem('y8_shop_market', JSON.stringify(updated));

        // Add ledger log
        const storedLedger = localStorage.getItem('y8_shop_ledger');
        let ledger = [];
        if (storedLedger) {
          try { ledger = JSON.parse(storedLedger); } catch {}
        }
        const newEvent = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'TX' as const,
          message: `Purchased Marketplace item ${productKey} (${productName}) via AI Copilot.`
        };
        localStorage.setItem('y8_shop_ledger', JSON.stringify([newEvent, ...ledger]));
      }

      // 3. If it's compute credits
      if (productKey === 'compute_credits') {
        const xpStored = localStorage.getItem('y8_user_xp');
        const nextXp = (xpStored ? parseInt(xpStored) : 240) + 120;
        localStorage.setItem('y8_user_xp', nextXp.toString());
      }

      // 4. If it's premium art collectibles (Y/G Harps of God)
      let stakedAmount = 0;
      if (productKey === 'y_harps' || productKey === 'g_harps') {
        const storedArt = localStorage.getItem('y8_owned_art') || '{}';
        let artMap = {};
        try { artMap = JSON.parse(storedArt); } catch {}
        localStorage.setItem('y8_owned_art', JSON.stringify({ ...artMap, [productKey]: true }));

        // Add ledger log
        const storedLedger = localStorage.getItem('y8_shop_ledger');
        let ledger = [];
        if (storedLedger) {
          try { ledger = JSON.parse(storedLedger); } catch {}
        }
        const newEvent = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'TX' as const,
          message: `Minted Rarible Art Collection item ${productName} (18% Royalties). 25% of seller principal routed to Sunshade Staking.`
        };
        localStorage.setItem('y8_shop_ledger', JSON.stringify([newEvent, ...ledger]));

        // Money feedback loop: 25% of seller principal (0.02 ETH) staked into Space Sunshade Pool
        stakedAmount = 0.02;
        const storedStaked = localStorage.getItem('y8_sunshade_staked') || '0.00';
        const nextStaked = (parseFloat(storedStaked) + stakedAmount).toFixed(2);
        localStorage.setItem('y8_sunshade_staked', nextStaked);
      }

      // Sync window local storage dispatch
      window.dispatchEvent(new Event('storage'));

      setMessages(prev => {
        const next = [
          ...prev,
          {
            sender: 'system' as const,
            text: `🎉 Purchase Confirmed! ${productName} registered to operator profile. Transaction logged to ledger index.`
          }
        ];
        
        if (productKey === 'y_harps' || productKey === 'g_harps') {
          next.push({
            sender: 'system' as const,
            text: `♻️ Cryptographic Feedback Activated: 18% Royalties (0.0144 ETH) paid. 25% principal (0.02 ETH) automatically routed and staked into the Space Sunshade Staking Pool.`
          });
        }
        
        return next;
      });

      setConfiguredKeys(prev => ({ ...prev, [productKey]: 'SUCCESS' }));

    }, 2000);
  };

  // Formulate preferences check prompts and product pitches on page route change
  const getRoutePreferencesAndPitches = (path: string) => {
    // 1. Home Dashboard
    if (path === '/') {
      const isSet = preferences.primaryDomain;
      const text = `Operator, welcome to the Home Dashboard. ${
        isSet 
          ? `Your active operating profile domain focus is **${isSet.toUpperCase()}**. You can adjust it below if needed:` 
          : `I detect your default operations profile domain focus is unset. Please choose one of our active domains below to configure your profile preferences:`
      }`;

      const actions = [
        { label: '🛡️ Set Space Climate', actionKey: 'primaryDomain' as const, value: 'space', type: 'preference' as const },
        { label: '🌾 Set CEA Food Domes', actionKey: 'primaryDomain' as const, value: 'food', type: 'preference' as const },
        { label: '⚡ Set Grid & Compute', actionKey: 'primaryDomain' as const, value: 'energy', type: 'preference' as const },
        { label: '🏥 Set Sanctuary Care', actionKey: 'primaryDomain' as const, value: 'health', type: 'preference' as const }
      ];

      const owned = isProductOwned('dropship');
      const pitchText = `\n\n**Featured License Product**: I highly recommend acquiring the **Bundle Drop Shipping License (0.18 ETH)** to enable automated dropship routing capability across your node market dashboard.`;
      
      const pitchAction = {
        label: owned ? '📦 Drop Shipping License Owned' : '🛒 Mint Drop Shipping License (0.18 ETH)',
        type: 'product' as const,
        productKey: 'dropship',
        productName: 'Bundle Drop Shipping License',
        productPrice: '0.18 ETH'
      };

      return {
        text: text + pitchText,
        actions: [...actions, pitchAction]
      };
    }

    // 2. Node Market (Shop)
    if (path.startsWith('/shop')) {
      const isSet = preferences.balancingStrategy;
      const text = `Operator, welcome to the Node Market. ${
        isSet
          ? `Your registered node load-balancing strategy is **${isSet.toUpperCase()}**. You can configure a different override strategy below if desired:`
          : `Let's configure your default override strategy. Choose a balancing strategy below to set parameters:`
      }`;

      const actions = [
        { label: '🤖 Set Autonomous Shifting', actionKey: 'balancingStrategy' as const, value: 'autonomous', type: 'preference' as const },
        { label: '⚙️ Set Manual Override', actionKey: 'balancingStrategy' as const, value: 'manual', type: 'preference' as const },
        { label: '🪙 Set Staking Credits', actionKey: 'balancingStrategy' as const, value: 'staking', type: 'preference' as const }
      ];

      const owned = isProductOwned('m3');
      const pitchText = `\n\n**Featured Telemetry Product**: I recommend purchasing the **Tesla Powerwall Edge Integration Hook (0.12 ETH)** to link dynamic battery throttling logs to your scheduler.`;

      const pitchAction = {
        label: owned ? '⚡ Tesla Integration Hook Owned' : '🛒 Buy Tesla Powerwall Hook (0.12 ETH)',
        type: 'product' as const,
        productKey: 'm3',
        productName: 'Tesla Powerwall Edge Integration Hook',
        productPrice: '0.12 ETH'
      };

      return {
        text: text + pitchText,
        actions: [...actions, pitchAction]
      };
    }

    // 3. P2P Trade Rooms (Blog)
    if (path.startsWith('/blog')) {
      const text = `Operator, welcome to the P2P Trade Rooms. To assist your node trade listing, let's establish what you are posting or offering today. Are you offering tools, labor, services, rideshare, or just posting a general question or post? Select one below to configure your filter preference and draft guide:`;

      const actions = [
        { label: '🛠️ Renting/Offering Tools', actionKey: 'tradePreference' as const, value: 'tool', type: 'preference' as const },
        { label: '🌾 Offering/Requesting Labor', actionKey: 'tradePreference' as const, value: 'labor', type: 'preference' as const },
        { label: '🤝 Providing/Requesting Services', actionKey: 'tradePreference' as const, value: 'services', type: 'preference' as const },
        { label: '🚲 Offering/Finding Rideshare', actionKey: 'tradePreference' as const, value: 'rideshare', type: 'preference' as const },
        { label: '💬 General Question or Post', actionKey: 'tradePreference' as const, value: 'general', type: 'preference' as const }
      ];

      const owned = isProductOwned('m5');
      const pitchText = `\n\n**Featured Service Product**: Book a contract for a **CEA Dome Seeding Specialist (0.04 ETH/hr)** to plant microgreens and check soil reserves at your agricultural domes.`;

      const pitchAction = {
        label: owned ? '🤝 Seeding Specialist Hired' : '🛒 Hire Seeding Specialist (0.04 ETH/hr)',
        type: 'product' as const,
        productKey: 'm5',
        productName: 'CEA Dome Seeding Specialist',
        productPrice: '0.04 ETH/hr'
      };

      return {
        text: text + pitchText,
        actions: [...actions, pitchAction]
      };
    }

    // 4. Swarm Scheduler (Calendar)
    if (path.startsWith('/calendar')) {
      const isSet = preferences.automationStyle;
      const text = `Operator, welcome to the Swarm Scheduler. ${
        isSet
          ? `Your agent scheduling preference is configured as **${isSet.toUpperCase()}**. Choose an automation style below to adjust agent startup behaviors:`
          : `Let's establish your swarm scheduling preference. Choose an automation style below:`
      }`;

      const actions = [
        { label: '🤖 Set Full Autonomy', actionKey: 'automationStyle' as const, value: 'autonomous', type: 'preference' as const },
        { label: '⏰ Set Cron Blocks', actionKey: 'automationStyle' as const, value: 'scheduled', type: 'preference' as const },
        { label: '⚙️ Set Manual Triggers', actionKey: 'automationStyle' as const, value: 'manual', type: 'preference' as const }
      ];

      const pitchText = `\n\n**Featured Swarm Service**: Buy **500 AI Swarm Compute Credits (0.05 ETH)** to execute large outreach pipelines and receive +120 Operator XP instantly.`;

      const pitchAction = {
        label: '🛒 Buy 500 Compute Credits (0.05 ETH)',
        type: 'product' as const,
        productKey: 'compute_credits',
        productName: '500 AI Swarm Compute Credits',
        productPrice: '0.05 ETH'
      };

      return {
        text: text + pitchText,
        actions: [...actions, pitchAction]
      };
    }

    // 5. Space Climate Construction
    if (path.startsWith('/space')) {
      const isSet = preferences.primaryDomain;
      const text = `Operator, welcome to the Space Climate Construction module. ${
        isSet === 'space'
          ? `Your primary operating domain focus is configured as **SPACE CLIMATE**. You can adjust your default network focus domain here:`
          : `Let's align your default primary operating focus. Select a primary domain focus to configure your preferences:`
      }`;

      const promoText = `\n\n🎨 **Sovereign NFT Collectibles (Rarible)**:\nSupport our sunshade project by acquiring the **[Y Harps of God](https://og.rarible.com/token/0xd07dc4262bcdbf85190c01c996b4c06a461d2430:492856)** and **[G Harps of God](https://og.rarible.com/token/0xd07dc4262bcdbf85190c01c996b4c06a461d2430:490643)** NFTs on Rarible! These premium assets represent Y8's artistic value, featuring **18% Royalties** and our experimental money feedback system that routes 25% of the principal (0.02 ETH) directly into the Space Sunshade Staking Pool.`;

      const actions = [
        { label: '🛡️ Set Space Climate', actionKey: 'primaryDomain' as const, value: 'space', type: 'preference' as const },
        { label: '🌾 Set CEA Food Domes', actionKey: 'primaryDomain' as const, value: 'food', type: 'preference' as const },
        { label: '⚡ Set Grid & Compute', actionKey: 'primaryDomain' as const, value: 'energy', type: 'preference' as const },
        { label: '🏥 Set Sanctuary Care', actionKey: 'primaryDomain' as const, value: 'health', type: 'preference' as const }
      ];

      const ownedSpace = isProductOwned('space');
      const ownedY = isProductOwned('y_harps');
      const ownedG = isProductOwned('g_harps');

      const pitchText = `\n\n**Featured License Product**: I highly recommend minting the **Space Climate License (0.15 ETH)** to unlock orbital solar deflection construction.`;

      const actionsList = [
        ...actions,
        {
          label: ownedSpace ? '🛡️ Space Climate License Owned' : '🛒 Mint Space Climate License (0.15 ETH)',
          type: 'product' as const,
          productKey: 'space',
          productName: 'Space Climate License',
          productPrice: '0.15 ETH'
        },
        {
          label: ownedY ? '🎨 Y Harps Owned' : '🛒 Mint Y Harps of God (0.08 ETH)',
          type: 'product' as const,
          productKey: 'y_harps',
          productName: 'Y Harps of God NFT',
          productPrice: '0.08 ETH'
        },
        {
          label: ownedG ? '🎨 G Harps Owned' : '🛒 Mint G Harps of God (0.08 ETH)',
          type: 'product' as const,
          productKey: 'g_harps',
          productName: 'G Harps of God NFT',
          productPrice: '0.08 ETH'
        }
      ];

      return {
        text: text + promoText + pitchText,
        actions: actionsList
      };
    }

    // 6. About Us
    if (path.startsWith('/about-us')) {
      const isSet = preferences.primaryDomain;
      const text = `Operator, welcome to the Project Y8 Chronicler. ${
        isSet
          ? `Your active operating profile domain focus is **${isSet.toUpperCase()}**. You can configure a new primary domain preference below:`
          : `Let's configure your default primary operating domain focus to customize highlights across your dashboard layout:`
      }`;

      const promoText = `\n\n📺 **Community Outposts & Media**:\n- Watch our latest tutorials, developer updates, and visual guides on the **[Y8 Swarm YouTube Channel](https://www.youtube.com/@GparadigmOrgLove)** and check out quick snippets via **[YouTube Shorts](https://www.youtube.com/@GparadigmOrgLove/shorts)**.\n- Connect with other sovereign operators and community hubs at the **[Good Faith Church (goodfaith.church)](https://goodfaith.church/)** portal.\n\n🎨 **Sovereign NFT Collectibles (Rarible)**:\nSupport our sunshade project by acquiring the **[Y Harps of God](https://og.rarible.com/token/0xd07dc4262bcdbf85190c01c996b4c06a461d2430:492856)** and **[G Harps of God](https://og.rarible.com/token/0xd07dc4262bcdbf85190c01c996b4c06a461d2430:490643)** NFTs on Rarible! These premium assets represent Y8's artistic value, featuring **18% Royalties** and our experimental money feedback system that routes 25% of the principal (0.02 ETH) directly into the Space Sunshade Staking Pool.`;

      const actions = [
        { label: '🛡️ Set Space Climate', actionKey: 'primaryDomain' as const, value: 'space', type: 'preference' as const },
        { label: '🌾 Set CEA Food Domes', actionKey: 'primaryDomain' as const, value: 'food', type: 'preference' as const },
        { label: '⚡ Set Grid & Compute', actionKey: 'primaryDomain' as const, value: 'energy', type: 'preference' as const },
        { label: '🏥 Set Sanctuary Care', actionKey: 'primaryDomain' as const, value: 'health', type: 'preference' as const }
      ];

      const ownedEnergy = isProductOwned('energy');
      const ownedY = isProductOwned('y_harps');
      const ownedG = isProductOwned('g_harps');

      const pitchText = `\n\n**Featured Network License**: I highly recommend minting the **Decentralized Grid & Datacenter License (0.12 ETH)** to run edge compute container loads.`;

      const actionsList = [
        ...actions,
        {
          label: ownedEnergy ? '⚡ Grid & Datacenter License Owned' : '🛒 Mint Grid & Datacenter License (0.12 ETH)',
          type: 'product' as const,
          productKey: 'energy',
          productName: 'Decentralized Grid & Datacenter License',
          productPrice: '0.12 ETH'
        },
        {
          label: ownedY ? '🎨 Y Harps Owned' : '🛒 Mint Y Harps of God (0.08 ETH)',
          type: 'product' as const,
          productKey: 'y_harps',
          productName: 'Y Harps of God NFT',
          productPrice: '0.08 ETH'
        },
        {
          label: ownedG ? '🎨 G Harps Owned' : '🛒 Mint G Harps of God (0.08 ETH)',
          type: 'product' as const,
          productKey: 'g_harps',
          productName: 'G Harps of God NFT',
          productPrice: '0.08 ETH'
        }
      ];

      return {
        text: text + promoText + pitchText,
        actions: actionsList
      };
    }

    const pitchText = `\n\n**Y8 Support**: Let me know if you need assistance configuring options, checking Safe Zones, or simulating deflection indexes.`;
    return {
      text: `System connected to module: **${pageInfo.name}**.` + pitchText,
      actions: []
    };
  };

  // Context updates on navigation
  useEffect(() => {
    // Automatically open the panel to engage the user
    setIsOpen(true);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      setIsTyping(false);
    }

    const configAndPitch = getRoutePreferencesAndPitches(pathname);
    
    syncTimeoutRef.current = setTimeout(() => {
      setMessages(prev => {
        // Filter out any trailing unfinished streaming assistant messages to prevent duplicate bubbles
        const filtered = prev.filter(m => !m.isStreaming);
        return [
          ...filtered,
          {
            sender: 'system',
            text: `🔄 Context synchronized: ${pageInfo.name} module loaded.`
          }
        ];
      });
      
      streamResponse(configAndPitch.text, configAndPitch.actions);
    }, 400);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    };
  }, [pathname]);

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Listen for implicit PWA actions to learn preferences and collect high-weight entropy
  useEffect(() => {
    const handleLearnedAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail) return;
      const { type, value, source } = customEvent.detail;

      // Accumulate entropy from user actions
      setEntropyBits(prev => {
        if (prev >= 512) return 512;
        const add = 24.5;
        return Math.min(512, prev + add);
      });

      setEntropyLogs(prev => {
        const log = `[PWA ACTION] "${source}" (+24.5 bits)`;
        return [log, ...prev.slice(0, 15)];
      });

      // Don't repeat if it's already set to this exact value
      if (preferences[type as keyof UserPreferences] === value) return;

      // Update preference in AuthContext
      updatePreference(type as keyof UserPreferences, value);

      // Flash Copilot open so user sees the learning confirmation
      setIsOpen(true);

      // Format nice display names
      const typeLabel = type.replace(/([A-Z])/g, ' $1').toLowerCase();
      const valLabel = value.toUpperCase();

      // Add learning logs to assistant chat
      setMessages(prev => {
        // Filter out any trailing unfinished streaming assistant messages to prevent duplicate bubbles
        const filtered = prev.filter(m => !m.isStreaming);
        return [
          ...filtered,
          {
            sender: 'system',
            text: `🤖 [Neural Learning Model] Operator behavior detected: "${source}". Synced default ${typeLabel} preference as "${valLabel}"`
          }
        ];
      });

      // Provide custom verbal explanation depending on what was learned
      let explanation = '';
      if (type === 'primaryDomain') {
        explanation = `🤖 **Neural Learning System**: I noticed you selected or interacted with **${valLabel}** domain operations via **${source}**. 

I have dynamically updated your primary domain default preference to **${valLabel}**. The home dashboard will now highlight this module.`;
      } else if (type === 'tradePreference') {
        explanation = `🤖 **Neural Learning System**: I noticed you selected the **${valLabel}** tag filter or listing type. 

I've automatically updated your trade room preference to **${valLabel}**. Regional Trade Room composer settings and mapping telemetry will align to this barter category.`;
      } else if (type === 'automationStyle') {
        explanation = `🤖 **Neural Learning System**: Based on your agent setup or preset launch, I've updated your automation preference to **${valLabel}**. 

This updates default scheduling models and calendar block actions.`;
      } else if (type === 'balancingStrategy') {
        explanation = `🤖 **Neural Learning System**: I detected you calibrated or initialized the **${valLabel}** load balancing strategy. 

Chassis containers will now load-balance according to these parameters.`;
      }

      setTimeout(() => {
        streamResponse(explanation);
      }, 500);
    };

    window.addEventListener('y8_user_action', handleLearnedAction);
    return () => window.removeEventListener('y8_user_action', handleLearnedAction);
  }, [preferences, updatePreference]);

  // Simulate streaming assistant message character-by-character
  const streamResponse = (fullText: string, actions?: any[]) => {
    setIsTyping(true);
    setMessages(prev => [...prev, { sender: 'assistant', text: '', isStreaming: true }]);
    
    let currentText = '';
    let index = 0;
    
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }
    
    const interval = setInterval(() => {
      if (index < fullText.length) {
        const chunk = fullText.slice(index, index + 4);
        currentText += chunk;
        index += 4;
        
        setMessages(prev => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (lastIdx >= 0 && next[lastIdx].sender === 'assistant') {
            next[lastIdx] = { sender: 'assistant', text: currentText, isStreaming: true };
          }
          return next;
        });
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setMessages(prev => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (lastIdx >= 0 && next[lastIdx].sender === 'assistant') {
            next[lastIdx] = { sender: 'assistant', text: fullText, isStreaming: false, actions };
          }
          return next;
        });
      }
    }, 15);
    
    streamingIntervalRef.current = interval;
  };

  // Find answers from QA database using token-based relevance scoring
  const getAnswer = (query: string): { text: string; actions?: any[] } => {
    const cleanQuery = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ");
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 2); // Get words longer than 2 characters

    let bestMatch: { qa: QA; score: number } | null = null;

    // Helper to calculate matching score for a QA item
    const calculateScore = (qa: QA) => {
      let score = 0;
      qa.keywords.forEach(kw => {
        const kwLower = kw.toLowerCase();
        // Exact matching phrase within query gets a massive boost
        if (cleanQuery.includes(kwLower)) {
          score += kwLower.split(/\s+/).length * 12;
        }
        // Check word tokens intersection
        queryTokens.forEach(token => {
          if (kwLower.includes(token) || token.includes(kwLower)) {
            score += 3;
          }
        });
      });
      return score;
    };

    // Compile list of all QA options with context-specific priority weights
    const allQAs: QA[] = [];
    const pageKey = pageInfo.key;

    // 1. Current page specific QAs (highest priority)
    if (QA_DATABASE[pageKey]) {
      QA_DATABASE[pageKey].forEach(qa => {
        allQAs.push({ ...qa, priorityMultiplier: 1.5 });
      });
    }

    // 2. Global QAs (medium priority)
    QA_DATABASE.global.forEach(qa => {
      allQAs.push({ ...qa, priorityMultiplier: 1.2 });
    });

    // 3. Other modules QAs (standard priority)
    Object.keys(QA_DATABASE).forEach(key => {
      if (key !== pageKey && key !== 'global') {
        QA_DATABASE[key].forEach(qa => {
          allQAs.push({ ...qa, priorityMultiplier: 1.0 });
        });
      }
    });

    // Score all potential matches
    allQAs.forEach(qaItem => {
      const baseScore = calculateScore(qaItem);
      const finalScore = baseScore * (qaItem.priorityMultiplier || 1.0);
      if (finalScore > 0 && (!bestMatch || finalScore > bestMatch.score)) {
        bestMatch = { qa: qaItem, score: finalScore };
      }
    });

    // Threshold score to verify match confidence (minimum of 5)
    if (bestMatch && bestMatch.score >= 5) {
      const match = bestMatch.qa;
      return { text: match.response, actions: match.actions };
    }

    // Default fallback response
    return {
      text: `I couldn't locate a precise explanation in my cognitive indexes for your query. However, I can explain the models or configurations for this ${pageInfo.name} module. Select one of the quick chips or try asking about "models" or "how to configure".`
    };
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInputText('');

    // Fetch answer
    const answer = getAnswer(textToSend);

    // Stream response
    setTimeout(() => {
      streamResponse(answer.text, answer.actions);
    }, 400);
  };

  const handleExecuteAction = (actionKey: keyof UserPreferences, value: string, label: string) => {
    updatePreference(actionKey, value);
    
    // Track configured options locally for UI checkmarks
    const configId = `${actionKey}-${value}`;
    setConfiguredKeys(prev => ({ ...prev, [configId]: 'SUCCESS' }));

    // Append system message confirmation
    setTimeout(() => {
      setMessages(prev => {
        const next = [
          ...prev,
          {
            sender: 'system' as const,
            text: `⚙️ Preference synchronized: Default ${actionKey.replace(/([A-Z])/g, ' $1')} registered as "${value.toUpperCase()}"`
          }
        ];
        
        // If it's a trade preference configuration, add custom assistant guidance
        if (actionKey === 'tradePreference') {
          let explanation = '';
          if (value === 'tool') {
            explanation = '🛠️ **Tools Barter Guide**: Rent out hardware rigs, pH meters, or test equipment. Type your offering in the Chat input, select the **Tool** tag, specify what you are looking for, check "Broadcast to Map" to place your marker on the 3D globe, and send it!';
          } else if (value === 'labor') {
            explanation = '🌾 **Labor Exchange Guide**: Hire help or offer services for vertical CEA domes or battery maintenance. Enter your task details, select the **Labor** tag, toggle "Broadcast to Map" to set coordinates, and send to post a ledger contract.';
          } else if (value === 'services') {
            explanation = '🤝 **Operational Services Guide**: Post virtual services like RPC configurations, contract audits, or smart lock keys. Set the tag to **Services** in the composer to list it for community matching.';
          } else if (value === 'rideshare') {
            explanation = '🚲 **Rideshare Transit Guide**: Share electric transport or e-bike coordinates. Type your carpool route, select the **Rideshare** tag, and broadcast it to the compliance zone mapping HUD.';
          } else {
            explanation = '💬 **General Posting Guide**: Ask questions about telemetry, post general community alerts, or query nodes. Leave the tag as **General** and post directly into the chat room feed.';
          }
          
          next.push({
            sender: 'assistant' as const,
            text: explanation
          });
        }
        
        return next;
      });
    }, 300);
  };

  // Generate chips dynamically based on pathname
  const getContextChips = () => {
    const list = [{ label: '💡 Explain Models', query: 'explain models' }];
    
    if (pageInfo.key === 'home') {
      list.push({ label: '⚙️ Configure Domain', query: 'how to configure primary domain' });
      list.push({ label: '📡 GPS Maps Info', query: 'gps location map' });
    } else if (pageInfo.key === 'shop') {
      list.push({ label: '⚙️ Configure Strategies', query: 'how to configure balancing strategy' });
      list.push({ label: '🛰️ Satellite Estimator', query: 'satellite estimator formulas' });
    } else if (pageInfo.key === 'blog') {
      list.push({ label: '⚙️ Configure Trade Filter', query: 'how to configure trade preference' });
      list.push({ label: '🛡️ Safe Purchase Zones', query: 'safe purchase zones' });
    } else if (pageInfo.key === 'calendar') {
      list.push({ label: '⚙️ Configure Sched Style', query: 'how to configure automation style' });
      list.push({ label: '🤖 Execute AI Agents', query: 'scheduler execute run job' });
    } else {
      list.push({ label: '🛰️ Albedo Deflector', query: 'space climate sunshade deflection' });
    }

    list.push({ label: '❓ Ask Anything', query: 'who are you copilot' });
    return list;
  };

  return (
    <div className={styles.assistantContainer}>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={styles.launcher}
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bot className="h-6 w-6" />
              <div className={styles.pulseRing}></div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.panel}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
          >
            {/* Vision Scanning Grid Overlay */}
            {isScanning && (
              <div className={styles.scanOverlay}>
                <div className={styles.scanLine}></div>
                <div className={styles.scanGrid}></div>
              </div>
            )}

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>
                  <Bot className="h-5 w-5" />
                </div>
                <div className={styles.titleContainer}>
                  <h3 className={styles.title}>Y8 SWARM COPILOT</h3>
                  <div className={styles.status}>
                    <div className={styles.statusDot}></div>
                    <span>{pageInfo.name.toUpperCase()} INDEX</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className={styles.btnClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Navigation Bar */}
            <div className={styles.copilotNavbar}>
              <button 
                type="button"
                onClick={() => router.push('/')} 
                className={`${styles.copilotNavLink} ${pathname === '/' ? styles.copilotNavLinkActive : ''}`}
              >
                Home
              </button>
              <button 
                type="button"
                onClick={() => router.push('/about-us')} 
                className={`${styles.copilotNavLink} ${pathname === '/about-us' ? styles.copilotNavLinkActive : ''}`}
              >
                About
              </button>
              <button 
                type="button"
                onClick={() => router.push('/shop')} 
                className={`${styles.copilotNavLink} ${pathname === '/shop' ? styles.copilotNavLinkActive : ''}`}
              >
                Shop
              </button>
              <button 
                type="button"
                onClick={() => router.push('/blog')} 
                className={`${styles.copilotNavLink} ${pathname === '/blog' ? styles.copilotNavLinkActive : ''}`}
              >
                Blog
              </button>
              <button 
                type="button"
                onClick={() => router.push('/calendar')} 
                className={`${styles.copilotNavLink} ${pathname === '/calendar' ? styles.copilotNavLinkActive : ''}`}
              >
                Calendar
              </button>
            </div>

            {/* AI Tools & Telemetry Toolbar */}
            <div className={styles.sensorToolbar}>
              <button 
                type="button" 
                onClick={() => handleSelectTool('vision')} 
                className={`${styles.sensorBtn} ${activeTool === 'vision' ? styles.sensorBtnActive : ''}`}
                title="AI Vision Scan"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Vision</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSelectTool('accelerometer')} 
                className={`${styles.sensorBtn} ${activeTool === 'accelerometer' ? styles.sensorBtnActive : ''}`}
                title="Accelerometer Telemetry"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Accel</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSelectTool('gyroscope')} 
                className={`${styles.sensorBtn} ${activeTool === 'gyroscope' ? styles.sensorBtnActive : ''}`}
                title="Gyroscope Bearings"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Gyro</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSelectTool('microphone')} 
                className={`${styles.sensorBtn} ${activeTool === 'microphone' ? styles.sensorBtnActive : ''}`}
                title="Microphone Voice Command"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Voice</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSelectTool('text')} 
                className={`${styles.sensorBtn} ${activeTool === 'text' ? styles.sensorBtnActive : ''}`}
                title="Text Input"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Text</span>
              </button>
            </div>

            {/* Telemetry Control Panel */}
            {activeTool !== 'text' && (
              <div className={styles.telemetryPanel}>
                {activeTool === 'vision' && (
                  <div className={styles.visionContainer}>
                    <div className={styles.cameraPreviewContainer}>
                      {cameraActive ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className={styles.cameraVideo}
                        />
                      ) : (
                        <div className={styles.cameraPlaceholder}>
                          <span>Camera Stream Offline</span>
                          <button 
                            type="button" 
                            onClick={startCamera} 
                            className={styles.cameraEnableBtn}
                          >
                            Enable Camera
                          </button>
                        </div>
                      )}
                      {isScanning && (
                        <div className={styles.scanningLine}></div>
                      )}
                    </div>
                    <div className={styles.modelSelectorBox}>
                      <span className={styles.modelSelectorLabel}>HUGGING FACE MODEL (AUTO-LOADED):</span>
                      <span className={styles.modelSelectorValue}>
                        🤗 {getHFModelForPathname(pathname).id}
                      </span>
                      <span className={styles.modelPurpose}>
                        Purpose: {getHFModelForPathname(pathname).purpose}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                      <button 
                        type="button"
                        onClick={handleTriggerVisionScan}
                        disabled={isScanning || !cameraActive}
                        className={styles.telemetryBtn}
                        style={{ flex: 1 }}
                      >
                        {isScanning ? 'Running HF Inference...' : 'Capture & Scan'}
                      </button>
                      {cameraActive && (
                        <button 
                          type="button"
                          onClick={stopCamera}
                          className={styles.telemetryBtn}
                          style={{ borderColor: 'rgba(255, 85, 85, 0.4)', color: '#ff5555' }}
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {activeTool === 'accelerometer' && (
                  <div className={styles.telemetryRow}>
                    <div className={styles.telemetryInfo}>
                      <span className={styles.telemetryLabel}>ACCEL TELEMETRY:</span>
                      <span className={styles.telemetryValue} style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                        X:{accel.x} Y:{accel.y} Z:{accel.z} G
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={handleTriggerAccelSimulation}
                      className={styles.telemetryBtn}
                    >
                      Simulate Tilt
                    </button>
                  </div>
                )}
                {activeTool === 'gyroscope' && (
                  <div className={styles.telemetryRow}>
                    <div className={styles.telemetryInfo}>
                      <span className={styles.telemetryLabel}>GYRO BEARINGS:</span>
                      <span className={styles.telemetryValue} style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                        P:{gyro.pitch}° R:{gyro.roll}° Y:{gyro.yaw}°
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={handleTriggerGyroAlignment}
                      className={styles.telemetryBtn}
                    >
                      Align Bearing
                    </button>
                  </div>
                )}
                {activeTool === 'microphone' && (
                  <div className={styles.telemetryRow}>
                    <div className={styles.telemetryInfo}>
                      <span className={styles.telemetryLabel}>VOICE DICTATION:</span>
                      <span className={styles.telemetryValue}>
                        {isListening ? 'RECORDING AUDIO COMMAND...' : 'MIC STANDBY'}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={handleTriggerVoiceRecording}
                      disabled={isListening}
                      className={styles.telemetryBtn}
                      style={{
                        background: isListening ? 'rgba(255, 0, 122, 0.2)' : '',
                        borderColor: isListening ? '#ff007a' : '',
                        color: isListening ? '#ff007a' : ''
                      }}
                    >
                      {isListening ? 'Recording...' : 'Start Rec'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Proof-of-Entropy Status Bar */}
            <div 
              className={styles.entropyStatusBar}
              onClick={() => {
                setShowEntropyDashboard(!showEntropyDashboard);
                setShowInstallHub(false);
              }}
            >
              <div className={styles.entropyStatusInfo}>
                <span className={styles.entropyStatusLabel}>⚖️ PoE:</span>
                <span className={styles.entropyStatusValue}>{Math.round((entropyBits / 512) * 100)}%</span>
              </div>
              <div className={styles.entropyProgressTrack}>
                <div 
                  className={styles.entropyProgressBar} 
                  style={{ width: `${(entropyBits / 512) * 100}%` }}
                ></div>
              </div>
              <span className={styles.entropyStatusSeed} title={entropySeed}>
                {entropySeed.slice(0, 10)}...{entropySeed.slice(-6)}
              </span>
            </div>

            {/* Device Installation & Oculus App Link Button */}
            <div 
              className={styles.installToggleBar}
              onClick={() => {
                setShowInstallHub(!showInstallHub);
                setShowEntropyDashboard(false);
              }}
            >
              <span>📥 Device Installation & Oculus Outpost</span>
              <span className={styles.installToggleIndicator}>{showInstallHub ? '▲' : '▼'}</span>
            </div>

            {/* Device Installation Hub Panel */}
            {showInstallHub && (
              <div className={styles.installHubPanel}>
                <h4 className={styles.hubTitle}>📥 PWA & Oculus Quest Installer</h4>
                <p className={styles.hubDesc}>
                  Install the Y8 Swarm Console across your devices to enable hardware telemetry sync and background ledger tracking.
                </p>
                
                <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {deferredPrompt ? (
                    <button 
                      type="button"
                      onClick={handleInstallApp}
                      className={styles.installBtn}
                    >
                      {isMobileScreen ? '📱 Install Mobile App on Your Phone' : '💻 Install Desktop App on Your Console'}
                    </button>
                  ) : (
                    <button 
                      type="button"
                      disabled
                      className={styles.installBtnDisabled}
                    >
                      ✔️ Console App Already Installed Here
                    </button>
                  )}

                  {isOculusDevice || oculusLinked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid rgba(157, 78, 221, 0.3)', padding: '0.5rem', borderRadius: '6px', background: 'rgba(157, 78, 221, 0.05)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#9d4edd', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        🽽 META QUEST OUTPOST DETECTED
                      </span>
                      {oculusLinked ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                            <span style={{ color: '#64748b' }}>Status:</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>TELEMETRY LINKED</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
                            <button 
                              type="button" 
                              onClick={handleSimulateVRShake}
                              className={styles.vrActionBtn}
                            >
                              Shake VR Controllers
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setOculusLinked(false)}
                              className={styles.vrActionBtn}
                              style={{ borderColor: 'rgba(255, 85, 85, 0.4)', color: '#ff5555' }}
                            >
                              Disconnect VR
                            </button>
                          </div>
                        </>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setOculusLinked(true)}
                          className={styles.installBtn}
                          style={{ background: '#9d4edd', borderColor: '#9d4edd', color: '#fff' }}
                        >
                          🔗 Link Headset & Sync VR Sensors
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <button 
                        type="button"
                        onClick={() => setIsOculusDevice(true)}
                        className={styles.installBtn}
                        style={{ borderStyle: 'dashed', borderColor: 'rgba(157, 78, 221, 0.4)', color: '#9d4edd', background: 'transparent' }}
                      >
                        🽽 Simulate Oculus Quest Headset Link
                      </button>
                      <span style={{ fontSize: '0.58rem', color: '#64748b', textAlign: 'center' }}>
                        Quest users can sync hand tracking & headset coordinates via App Lab store.
                      </span>
                    </div>
                  )}
                </div>

                {/* Associated Operator Devices Registry */}
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    🌐 Associated Operator Devices
                  </span>
                  <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {operatorDevices.length === 0 ? (
                      <span style={{ fontSize: '0.58rem', color: '#64748b', fontStyle: 'italic', padding: '0.2rem 0' }}>
                        No associated devices logged for this wallet.
                      </span>
                    ) : (
                      operatorDevices.map((dev, dIdx) => (
                        <div 
                          key={dIdx} 
                          style={{ 
                            background: dev.deviceId === localDeviceId ? 'rgba(0, 245, 212, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                            border: dev.deviceId === localDeviceId ? '1px solid rgba(0, 245, 212, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.15rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>
                              {dev.deviceName}
                            </span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {dev.deviceId === localDeviceId && (
                                <span style={{ fontSize: '0.5rem', background: 'rgba(0, 245, 212, 0.15)', color: '#00f5d4', padding: '0.05rem 0.25rem', borderRadius: '3px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                  ACTIVE
                                </span>
                              )}
                              {dev.isPWA && (
                                <span style={{ fontSize: '0.5rem', background: 'rgba(157, 78, 221, 0.15)', color: '#9d4edd', padding: '0.05rem 0.25rem', borderRadius: '3px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                  INSTALLED PWA
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#64748b', fontFamily: 'monospace' }}>
                            <span>Last Active: {dev.lastActive}</span>
                            <span title={dev.walletAddress}>Owner: {dev.walletAddress.slice(0, 6)}...{dev.walletAddress.slice(-4)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Proof-of-Entropy Telemetry Dashboard Panel */}
            {showEntropyDashboard && (
              <div className={styles.entropyDashboardPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <h4 className={styles.hubTitle} style={{ margin: 0, color: '#00f5d4' }}>⚖️ Proof-of-Entropy Miner</h4>
                  <span className={styles.entropyBitsLabel}>
                    {Math.round(entropyBits)} / 512 bits
                  </span>
                </div>
                
                <div className={styles.seedBox}>
                  <span className={styles.seedLabel}>CURRENT SEED HASH:</span>
                  <span className={styles.seedValue}>{entropySeed}</span>
                </div>

                {oculusLinked && (
                  <div className={styles.vrTelemetryBox}>
                    <span className={styles.vrTelemetryLabel}>QUEST VR TELEMETRY FEED:</span>
                    <div className={styles.vrTelemetryGrid}>
                      <div>Headset: <span style={{ color: '#fff' }}>[{vrTelemetry.headset.x}, {vrTelemetry.headset.y}, {vrTelemetry.headset.z}]</span></div>
                      <div>Left Touch: <span style={{ color: '#fff' }}>{vrTelemetry.leftTouch.accel}G ({vrTelemetry.leftTouch.buttons})</span></div>
                      <div>Right Touch: <span style={{ color: '#fff' }}>{vrTelemetry.rightTouch.accel}G ({vrTelemetry.rightTouch.buttons})</span></div>
                    </div>
                  </div>
                )}

                <div className={styles.logTickerContainer}>
                  <span className={styles.logTickerLabel}>ENTROPY INPUTS LOG:</span>
                  <div className={styles.logTicker}>
                    {entropyLogs.length === 0 ? (
                      <div style={{ color: '#64748b', fontSize: '0.65rem', textAlign: 'center', padding: '0.5rem 0' }}>
                        STANDBY - Move mouse, type keys, or toggle GPS to generate entropy...
                      </div>
                    ) : (
                      entropyLogs.map((log, lIdx) => (
                        <div key={lIdx} className={styles.tickerRow}>{log}</div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={entropyBits < 512}
                  onClick={handleCommitEntropyBlock}
                  className={`${styles.commitBtn} ${entropyBits >= 512 ? styles.commitBtnActive : ''}`}
                >
                  {entropyBits >= 512 ? '⚖️ Commit Completed Block to Ledger' : 'Mining Entropy Block...'}
                </button>
              </div>
            )}

            {/* Chat Messages */}
            <div className={styles.chatHistory}>
              {messages.map((msg, idx) => {
                if (msg.sender === 'system') {
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        fontSize: '0.65rem', 
                        color: 'rgba(0, 245, 212, 0.65)', 
                        fontFamily: 'monospace', 
                        textAlign: 'center', 
                        margin: '0.25rem 0',
                        padding: '0.2rem',
                        background: 'rgba(0, 245, 212, 0.03)',
                        borderRadius: '4px',
                        border: '1px dashed rgba(0, 245, 212, 0.1)'
                      }}
                    >
                      {msg.text}
                    </div>
                  );
                }

                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={idx} 
                    className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.assistantWrapper}`}
                  >
                    <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
                      {msg.isStreaming ? msg.text : parseMarkdown(msg.text)}
                      {msg.isStreaming && <span className={styles.cursor}></span>}
                      
                      {/* Render Interactive Preference actions inside bubble if present */}
                      {!msg.isStreaming && msg.actions && (
                        <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.6rem' }}>
                          {msg.actions.map((act, aIdx) => {
                            if (act.type === 'product') {
                              const isOwned = act.productKey ? (isProductOwned(act.productKey) || configuredKeys[act.productKey] === 'SUCCESS') : false;
                              // Clean display label
                              let displayLabel = act.label;
                              if (isOwned) {
                                if (act.productKey === 'compute_credits') {
                                  displayLabel = '⚡ Credits Purchased';
                                } else if (act.productKey === 'm5') {
                                  displayLabel = '🤝 Specialist Hired';
                                } else if (act.productKey === 'm3') {
                                  displayLabel = '⚡ Tesla Hook Connected';
                                } else if (['space', 'food', 'energy', 'health', 'dropship'].includes(act.productKey || '')) {
                                  displayLabel = `📦 ${act.productName || 'License'} Owned`;
                                } else {
                                  displayLabel = '✔️ Purchased';
                                }
                              }
                              
                              return (
                                <button
                                  key={aIdx}
                                  onClick={() => {
                                    if (!isOwned && act.productKey && act.productName && act.productPrice) {
                                      handlePurchaseProduct(act.productKey, act.productName, act.productPrice);
                                    }
                                  }}
                                  className={`${styles.inlineButton} ${isOwned ? styles.inlineButtonSuccess : ''}`}
                                  disabled={isOwned}
                                >
                                  {isOwned ? (
                                    <>
                                      <Check className="h-3 w-3" /> {displayLabel}
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-3 w-3" /> {displayLabel}
                                    </>
                                  )}
                                </button>
                              );
                            }

                            if (act.type === 'link') {
                              return (
                                <button
                                  key={aIdx}
                                  onClick={() => {
                                    if (act.url) {
                                      window.open(act.url, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  className={styles.inlineButton}
                                  style={{
                                    borderColor: '#ff007a',
                                    color: '#ff007a',
                                    background: 'rgba(255, 0, 122, 0.08)',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 0, 122, 0.18)';
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 122, 0.4)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 0, 122, 0.08)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'none';
                                  }}
                                >
                                  <Sparkles className="h-3 w-3" /> {act.label}
                                </button>
                              );
                            }

                            // Otherwise, it is a preference configuration action
                            const configId = `${act.actionKey}-${act.value}`;
                            const isConfigured = act.actionKey ? (preferences[act.actionKey] === act.value || configuredKeys[configId] === 'SUCCESS') : false;
                            
                            return (
                              <button
                                key={aIdx}
                                onClick={() => {
                                  if (!isConfigured && act.actionKey && act.value) {
                                    handleExecuteAction(act.actionKey, act.value, act.label);
                                  }
                                }}
                                className={`${styles.inlineButton} ${isConfigured ? styles.inlineButtonSuccess : ''}`}
                                disabled={isConfigured}
                              >
                                {isConfigured ? (
                                  <>
                                    <Check className="h-3 w-3" /> Activated
                                  </>
                                ) : (
                                  <>
                                    <Sliders className="h-3 w-3" /> {act.label}
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* suggestion chips */}
            <div className={styles.chipsContainer}>
              <span className={styles.chipsLabel}>Suggested Configurations</span>
              <div className={styles.chipsScroll}>
                {getContextChips().map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.query)}
                    className={styles.chip}
                    disabled={isTyping}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }} 
              className={styles.inputForm}
              style={{ position: 'relative' }}
            >
              {isListening ? (
                <div className={styles.audioWaveContainer}>
                  <div className={styles.audioWaveBar} style={{ animationDelay: '0.1s' }}></div>
                  <div className={styles.audioWaveBar} style={{ animationDelay: '0.3s' }}></div>
                  <div className={styles.audioWaveBar} style={{ animationDelay: '0.5s' }}></div>
                  <div className={styles.audioWaveBar} style={{ animationDelay: '0.2s' }}></div>
                  <div className={styles.audioWaveBar} style={{ animationDelay: '0.4s' }}></div>
                  <span className={styles.audioWaveText}>Listening...</span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Ask about pages, models, options..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className={styles.input}
                    disabled={isTyping}
                  />
                  <button 
                    type="submit" 
                    className={styles.btnSend}
                    disabled={!inputText.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
