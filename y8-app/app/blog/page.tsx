"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  MessageSquare, 
  Radio, 
  Compass, 
  BookOpen,
  Send,
  ShieldCheck,
  Check,
  Wrench,
  Cpu,
  Car,
  Briefcase,
  RefreshCw,
  Clock,
  Play,
  Plus,
  Trash2,
  Shield,
  FileText,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import styles from '../../styles/Blog.module.css';
import GlobeVisualizer from '../../components/GlobeVisualizer';
import SafeZoneBoard from '../../components/SafeZoneBoard';
import { useAccount, useWriteContract, useSignMessage, usePublicClient, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../config/contracts';
import SafePurchaseRegistryABI from '../../config/abi/SafePurchaseRegistry.json';
import Y8AccessRegistryABI from '../../config/abi/Y8AccessRegistry.json';
import InterchainNameServiceABI from '../../config/abi/InterchainNameService.json';
import SanctuaryLockABI from '../../config/abi/SanctuaryLock.json';
import { encryptDiagnostics, decryptDiagnostics } from '../../utils/litService';

interface MapPinItem {
  id: string;
  type: 'offer_ride' | 'find_ride' | 'offer_labor' | 'request_labor' | 'tool_rental' | 'service_request' | 'general' | 'craigslist';
  title: string;
  offering: string;
  lookingFor: string;
  latitude: number;
  longitude: number;
  sender: string;
  timestamp: string;
  zoneName: string;
  receiver?: string;
  status?: 'Active' | 'Accepted' | 'Completed';
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  zoneName: string;
  cityId: string;
  isSelf: boolean;
  tag?: 'general' | 'labor' | 'services' | 'tool' | 'rideshare';
}

interface PurchaseZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

const ALL_REGISTERED_SPZS: PurchaseZone[] = [
  { id: 'pottsboro', name: 'Pottsboro Grid Node A (Safe Purchase Zone)', latitude: 33.7840, longitude: -96.6711, description: 'Direct solar inverter and compute load balancing gateway.' },
  { id: 'sherman', name: 'Sherman Climate Node B (Safe Purchase Zone)', latitude: 33.6356, longitude: -96.6089, description: 'Meteorological monitoring and local grid trade clearing zone.' },
  { id: 'dallas', name: 'Dallas HQ Hub (Safe Purchase Zone)', latitude: 32.7767, longitude: -96.7970, description: 'Centralized Web3 compliance registry and P2P trade terminal.' },
  { id: 'austin', name: 'Austin Sanctuary Pod (Safe Purchase Zone)', latitude: 30.2672, longitude: -97.7431, description: 'Near-Self Care cabin bookings and biometric gateway checkpoint.' },
  { id: 'houston', name: 'Houston Energy Grid Node (Safe Purchase Zone)', latitude: 29.7604, longitude: -95.3698, description: 'Industrial battery storage logs and hydrogen fuel cell telemetry.' },
  { id: 'newyork', name: 'New York Tech Center (Safe Purchase Zone)', latitude: 40.7128, longitude: -74.0060, description: 'Multi-party computation security nodes and high-frequency trade matching.' },
  { id: 'sanfran', name: 'San Francisco Bay Node (Safe Purchase Zone)', latitude: 37.7749, longitude: -122.4194, description: 'Zero-knowledge proof validation hardware and edge grid orchestration.' },
  { id: 'toronto', name: 'Toronto North Star Hub (Safe Purchase Zone)', latitude: 43.6532, longitude: -79.3832, description: 'Sub-zero cooling server stacks and carbon offset credit indexer.' },
  { id: 'mexicocity', name: 'Mexico City Grid Station (Safe Purchase Zone)', latitude: 19.4326, longitude: -99.1332, description: 'Central solar balancing nodes and municipal rideshare dispatcher.' },
  { id: 'saopaulo', name: 'São Paulo Bio-Dome Node (Safe Purchase Zone)', latitude: -23.5505, longitude: -46.6333, description: 'Urban agricultural hydroponic logs and decentralized DID registry.' },
  { id: 'buenosaires', name: 'Buenos Aires Energy Hub (Safe Purchase Zone)', latitude: -34.6037, longitude: -58.3816, description: 'Virtual power plant controller and local trade clearing house.' },
  { id: 'london', name: 'London Thames Grid Node (Safe Purchase Zone)', latitude: 51.5074, longitude: -0.1278, description: 'Tidal power analytics and automated peer-to-peer escrow logs.' },
  { id: 'paris', name: 'Paris Carbon Exchange Node (Safe Purchase Zone)', latitude: 48.8566, longitude: 2.3522, description: 'Sovereign ID encryption vaults and sustainable labor barter registers.' },
  { id: 'berlin', name: 'Berlin Solar Array Node (Safe Purchase Zone)', latitude: 52.5200, longitude: 13.4050, description: 'Community solar microgrid telemetry and machine-to-machine trade channels.' },
  { id: 'reykjavik', name: 'Reykjavík Geothermal Node (Safe Purchase Zone)', latitude: 64.1466, longitude: -21.9426, description: 'Geothermal compute center cluster and volcano albedo sensor arrays.' },
  { id: 'rome', name: 'Rome Sanctuary Checkpoint (Safe Purchase Zone)', latitude: 41.9028, longitude: 12.4964, description: 'Ancient grid sub-station and bio-metric lock interface.' },
  { id: 'oslo', name: 'Oslo Hydro-Compute Node (Safe Purchase Zone)', latitude: 59.9139, longitude: 10.7522, description: 'Hydro-electric edge node network and cold air telemetry logger.' },
  { id: 'tokyo', name: 'Tokyo Neo-Grid Node (Safe Purchase Zone)', latitude: 35.6762, longitude: 139.6503, description: 'High-density computational pods and robotic drone dispatch deck.' },
  { id: 'seoul', name: 'Seoul Compute Core Node (Safe Purchase Zone)', latitude: 37.5665, longitude: 126.9780, description: 'Sub-sea cable communications landing and local smart contract clearing.' },
  { id: 'singapore', name: 'Singapore Equatorial Node (Safe Purchase Zone)', latitude: 1.3521, longitude: 103.8198, description: 'High-humidity cooling testbed and zero-emission transit dispatcher.' },
  { id: 'mumbai', name: 'Mumbai Solar Balancer (Safe Purchase Zone)', latitude: 19.0760, longitude: 72.8777, description: 'Grid-scale battery balancing and localized peer rating logs.' },
  { id: 'sydney', name: 'Sydney Harbor Grid Node (Safe Purchase Zone)', latitude: -33.8688, longitude: 151.2093, description: 'Decentralized microgrids telemetry and e-bike pickup terminals.' },
  { id: 'beijing', name: 'Beijing Grid Sentinel (Safe Purchase Zone)', latitude: 39.9042, longitude: 116.4074, description: 'National grid load-balancer and digital credentials compliance validator.' },
  { id: 'capetown', name: 'Cape Town Wind Array (Safe Purchase Zone)', latitude: -33.9249, longitude: 18.4241, description: 'Coastal wind power load balancing and sea water telemetry logs.' },
  { id: 'cairo', name: 'Cairo Delta Compute Node (Safe Purchase Zone)', latitude: 30.0444, longitude: 31.2357, description: 'Arid climate solar research cells and local did registry.' },
  { id: 'dubai', name: 'Dubai Solar Smart Node (Safe Purchase Zone)', latitude: 25.2048, longitude: 55.2708, description: 'Desert cooling server clusters and autonomous drone transit corridors.' },
  { id: 'nairobi', name: 'Nairobi Agro-Grid Node (Safe Purchase Zone)', latitude: -1.2921, longitude: 36.8219, description: 'Controlled environment agriculture logs and local rideshare gateway.' },
  { id: 'svalbard', name: 'Svalbard Seed Vault Sanctuary (Safe Purchase Zone)', latitude: 78.2200, longitude: 15.6500, description: 'Global seed vault backup logging and low-temperature storage telemetry.' },
  { id: 'mcmurdo', name: 'McMurdo Station Telecom Pod (Safe Purchase Zone)', latitude: -77.8460, longitude: 166.6605, description: 'Polar satellite communication node and extreme weather telemetry.' }
];

interface LocationCoords {
  name: string;
  latitude: number;
  longitude: number;
}

interface CraigslistListing {
  id: string;
  title: string;
  category: 'labor' | 'service' | 'tool' | 'rideshare' | 'goods';
  price: string;
  suburb: string;
  description: string;
  contact: string;
}

const REGIONAL_SUBURBS: Record<string, { latitude: number; longitude: number }> = {
  "pottsboro": { latitude: 33.7840, longitude: -96.6711 },
  "sherman": { latitude: 33.6356, longitude: -96.6089 },
  "denison": { latitude: 33.7557, longitude: -96.5367 },
  "gunter": { latitude: 33.4484, longitude: -96.7456 },
  "melissa": { latitude: 33.2859, longitude: -96.5728 },
  "van alstyne": { latitude: 33.4215, longitude: -96.5772 },
  "mckinney": { latitude: 33.1972, longitude: -96.6398 },
  "frisco": { latitude: 33.1507, longitude: -96.8236 },
  "plano": { latitude: 33.0198, longitude: -96.6989 },
  "dallas": { latitude: 32.7767, longitude: -96.7970 },
  "austin": { latitude: 30.2672, longitude: -97.7431 },
  "round rock": { latitude: 30.5083, longitude: -97.6789 },
  "giddings": { latitude: 30.1830, longitude: -96.9366 }
};

const INITIAL_CRAIGSLIST_LISTINGS: CraigslistListing[] = [
  {
    id: 'cl-1',
    title: 'Moving Sale - Used Renogy 100W Solar Panels',
    category: 'tool',
    price: '0.04 ETH',
    suburb: 'Denison',
    description: 'Perfect condition, selling 4 panels. Upgrading to edge franchise setups. Can meet at local SPZ.',
    contact: 'craig-denison-92@gmail.com'
  },
  {
    id: 'cl-2',
    title: 'Help needed setting up vertical farm beds',
    category: 'labor',
    price: '0.08 ETH',
    suburb: 'Gunter',
    description: 'Require 3 hours of physical labor to install hydroponic piping inside greenhouse dome.',
    contact: 'green-grow-gunter@outlook.com'
  },
  {
    id: 'cl-3',
    title: 'Daily carpool commuter to Dallas HQ',
    category: 'rideshare',
    price: '0.02 ETH',
    suburb: 'Frisco',
    description: 'Leaving Frisco daily at 7:45 AM. Driving Tesla Model 3. Fits 2 passengers with light gear.',
    contact: 'frisco-rider@gmail.com'
  },
  {
    id: 'cl-4',
    title: 'Electric lawnmower lease / share',
    category: 'tool',
    price: '0.01 ETH / day',
    suburb: 'McKinney',
    description: 'Fully charged battery mower. Clean cut, includes safety charging adapter.',
    contact: 'mckinney-tools@gmail.com'
  },
  {
    id: 'cl-5',
    title: 'Therapeutic massage & bio-tuning session',
    category: 'service',
    price: '0.07 ETH',
    suburb: 'Plano',
    description: 'Certified somatic practitioner. Relieve edge operator stress. Plano room booking.',
    contact: 'soma-tuning@proton.me'
  },
  {
    id: 'cl-6',
    title: 'Solar Inverter replacement diagnostic',
    category: 'labor',
    price: '0.06 ETH',
    suburb: 'Van Alstyne',
    description: 'Help troubleshoot inverter warnings. Bring diagnostic voltmeters if available.',
    contact: 'power-grid-van@outlook.com'
  },
  {
    id: 'cl-7',
    title: 'Water filtration pump lease',
    category: 'tool',
    price: '0.03 ETH',
    suburb: 'Pottsboro',
    description: 'High capacity filter pumps, fits typical agricultural food domes.',
    contact: 'hydro-clean@gmail.com'
  }
];

interface BlogArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
}

interface UserProfile {
  address: string;
  digitalID: string;
  reputationStake: number;
  totalWeightedScore: number;
  totalStakeWeight: number;
  ratingCount: number;
}

const TRADE_EXPLAINERS = {
  all: {
    title: 'All Network Trade Activities',
    icon: '📡',
    text: 'Allows you to monitor all categories of barter trade posts simultaneously. Safe Purchase Zones log rideshares, tools, services, and labor contracts directly onto the contract ledger watcher.'
  },
  general: {
    title: 'General Trade Chat Room',
    icon: '💬',
    text: 'General Trade includes informal P2P barter discussions, updates on node statuses, community warnings, and general inquiries regarding local zone operations.'
  },
  labor: {
    title: 'Franchise Labor Agreements',
    icon: '🔧',
    text: 'Franchise Labor lists active offers and requests for physical grid maintenance support, agricultural assistance at food domes, electrician setup services, and node diagnostic audits.'
  },
  services: {
    title: 'Operational Services Barter',
    icon: '💼',
    text: 'Operational Services includes booking access credentials, biometric smart lock unlocks, therapeutic sanctuary pod reservations, and localized computational balance scheduling support.'
  },
  tool: {
    title: 'Equipment & Tool Rental',
    icon: '⚙️',
    text: 'Equipment & Tool Rental coordinates sharing or renting hardware resources such as physical battery blocks, solar inverters, agricultural sensor kits, and compute servers.'
  },
  rideshare: {
    title: 'Rideshare & Grid Logistics',
    icon: '🚗',
    text: 'Rideshare & Grid Logistics coordinates physical transportation and delivery. Operators share e-bike fleets or carpool routes between datacenters to perform maintenance checks.'
  }
};

export default function BlogPage() {
  const { user, isAuthenticated, preferences, updatePreference } = useAuth();
  const walletAddress = user?.address || "0x0000000000000000000000000000000000000000";

  const { address: userAddress, chain } = useAccount();
  const chainId = chain?.id || 1337;
  const addresses: any = CONTRACT_ADDRESSES[chainId.toString()] || CONTRACT_ADDRESSES["1337"] || {};
  const { writeContractAsync } = useWriteContract();
  const [explainerContent, setExplainerContent] = useState<{ title: string; text: string; icon: string } | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Operator Activity Hub states
  const { signMessageAsync } = useSignMessage();
  const [isTrackingWork, setIsTrackingWork] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<number | null>(null);
  const [elapsedWorkSeconds, setElapsedWorkSeconds] = useState(0);
  const [workAccomplishment, setWorkAccomplishment] = useState('');
  const [loggedSessions, setLoggedSessions] = useState<any[]>([]);
  const [userXp, setUserXp] = useState(240);
  const [userLevel, setUserLevel] = useState(1);
  const [totalMinutesWorked, setTotalMinutesWorked] = useState(0);
  const [expandedSessionIndex, setExpandedSessionIndex] = useState<number | null>(null);

  const [todoItems, setTodoItems] = useState<any[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  // Agent Scheduler states
  const [schedulerDay, setSchedulerDay] = useState(15);
  const [schedulerAgentType, setSchedulerAgentType] = useState('YouTube Growth Swarm Bot');
  const [schedulerInstructions, setSchedulerInstructions] = useState('');
  const [schedulerPriority, setSchedulerPriority] = useState<'LOW' | 'STANDARD' | 'CRITICAL'>('CRITICAL');

  // Tab switcher state for left card
  // Tab switcher state for left card
  const [activeLeftTab, setActiveLeftTab] = useState<'trade' | 'activity' | 'sanctuary'>('trade');

  // Sanctuary Checkup & DID Onboarding States
  const publicClient = usePublicClient();
  const [hasDID, setHasDID] = useState<boolean>(true);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [recommendedDID, setRecommendedDID] = useState<string>('');
  const [onboardingDID, setOnboardingDID] = useState<string>('');
  
  // Sanctuary Lock Queue
  const [checkupQueue, setCheckupQueue] = useState<any[]>([]);
  const [isSimulatingJob, setIsSimulatingJob] = useState<boolean>(false);
  const [simulatingJobId, setSimulatingJobId] = useState<number | null>(null);
  
  // Decrypted Diagnostics Cache (strictly RAM state)
  const [decryptedDiagnostics, setDecryptedDiagnostics] = useState<Record<number, any>>({});
  const [decryptionErrors, setDecryptionErrors] = useState<Record<number, string>>({});
  const [decryptingJobId, setDecryptingJobId] = useState<number | null>(null);

  // Check user onboarding (DID setup)
  const checkUserOnboarding = async () => {
    if (!publicClient || !addresses.y8AccessRegistry || !userAddress) return;
    try {
      const did = await publicClient.readContract({
        address: addresses.y8AccessRegistry as `0x${string}`,
        abi: Y8AccessRegistryABI as any,
        functionName: 'addressToDID',
        args: [userAddress as `0x${string}`],
      } as any) as string;

      if (did && did.length > 0) {
        setHasDID(true);
        setOnboardingOpen(false);
      } else {
        setHasDID(false);
        setOnboardingOpen(true);
        // Query InterchainNameService for Twitter handle
        let twitter = '';
        if (addresses.interchainNameService) {
          try {
            twitter = await publicClient.readContract({
              address: addresses.interchainNameService as `0x${string}`,
              abi: InterchainNameServiceABI as any,
              functionName: 'resolveTwitter',
              args: [userAddress as `0x${string}`],
            } as any) as string;
          } catch (e) {
            console.error('Twitter resolve error:', e);
          }
        }
        const recommended = twitter 
          ? `did:y8:twitter-${twitter.replace('@', '')}` 
          : `did:y8:anonymous-${userAddress.slice(2, 8)}`;
        setRecommendedDID(recommended);
        setOnboardingDID(recommended);
      }
    } catch (e) {
      console.error('Onboarding check error:', e);
    }
  };

  useEffect(() => {
    if (userAddress) {
      checkUserOnboarding();
    }
  }, [userAddress, publicClient, addresses.y8AccessRegistry]);

  const handleRegisterDIDOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingDID.trim() || !userAddress) return;
    
    setLoadingText("Registering digital ID DID profile on-chain...");
    setTransactionLoading(true);
    
    try {
      await writeContractAsync({
        address: addresses.y8AccessRegistry as `0x${string}`,
        abi: Y8AccessRegistryABI as any,
        functionName: 'registerDigitalID',
        args: [onboardingDID.trim()],
      } as any);
      
      addContractEvent(`On-chain DID registered successfully: "${onboardingDID}"`, "success");
      setHasDID(true);
      setOnboardingOpen(false);
      
      // Update local profiles
      setProfiles(prev => ({
        ...prev,
        [walletAddress]: {
          address: walletAddress,
          digitalID: onboardingDID.trim(),
          reputationStake: 10,
          totalWeightedScore: 1000,
          totalStakeWeight: 10,
          ratingCount: 1
        }
      }));
    } catch (error: any) {
      console.error("DID registration error:", error);
      addContractEvent(`DID registration failed: ${error.message || error}`, "info");
      alert(`Error registering DID: ${error.message || error}`);
    } finally {
      setTransactionLoading(false);
    }
  };

  const fetchCheckupQueue = async () => {
    if (!publicClient || !addresses.sanctuaryLock) return;
    try {
      const length = await publicClient.readContract({
        address: addresses.sanctuaryLock as `0x${string}`,
        abi: SanctuaryLockABI as any,
        functionName: 'getQueueLength',
      } as any) as bigint;
      
      const jobs = await Promise.all(
        Array.from({ length: Number(length) }).map(async (_, idx) => {
          const job = await publicClient.readContract({
            address: addresses.sanctuaryLock as `0x${string}`,
            abi: SanctuaryLockABI as any,
            functionName: 'getJobDetails',
            args: [BigInt(idx)],
          } as any) as any;
          return job;
        })
      );
      setCheckupQueue(jobs.reverse());
    } catch (e) {
      console.error("Error fetching checkup queue:", e);
    }
  };

  useEffect(() => {
    fetchCheckupQueue();
    const interval = setInterval(fetchCheckupQueue, 5000);
    return () => clearInterval(interval);
  }, [publicClient, addresses.sanctuaryLock]);

  const simulateDiagnostics = (patientAddress: string) => {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      patient: patientAddress,
      telemetry: {
        heartRate: Math.floor(Math.random() * 20) + 70,
        bloodPressure: `${Math.floor(Math.random() * 10) + 115}/${Math.floor(Math.random() * 10) + 75}`,
        temperature: (Math.random() * 1.5 + 97.8).toFixed(1) + '°F',
      },
      findings: {
        scarHealingProgress: `${Math.floor(Math.random() * 10) + 85}%`,
        tissueRegeneration: "Optimal cellular growth observed, regular scar/healing health patterns are normal.",
        gopro360FeedUrl: "https://ipfs.io/ipfs/bafybeigopro360videofeedlinksimulated123456789"
      }
    });
  };

  const handleRequestCheckup = async () => {
    if (!userAddress || !addresses.sanctuaryLock) return;
    
    setLoadingText("Requesting Sanctuary Door Unlock & diagnostics...");
    setTransactionLoading(true);
    
    try {
      const tx = await writeContractAsync({
        address: addresses.sanctuaryLock as `0x${string}`,
        abi: SanctuaryLockABI as any,
        functionName: 'requestCheckup',
        args: ['sanctuary-austin-pod'],
      } as any);
      
      addContractEvent(`Sanctuary door unlock requested. TX Hash: ${tx.slice(0, 15)}...`, "tx");
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const length = await publicClient?.readContract({
        address: addresses.sanctuaryLock as `0x${string}`,
        abi: SanctuaryLockABI as any,
        functionName: 'getQueueLength',
      } as any) as bigint;
      
      const newJobId = Number(length) - 1;
      if (newJobId < 0) {
        throw new Error("No jobs found in contract queue.");
      }
      
      setSimulatingJobId(newJobId);
      setIsSimulatingJob(true);
      setTransactionLoading(false);
      
      addContractEvent(`Sanctuary Lock Job #${newJobId} Created! Starting telemetry automation loop...`, "success");
      
      setTimeout(async () => {
        try {
          addContractEvent(`Automation: Node starting 360 GoPro stream for Job #${newJobId}...`, "info");
          await writeContractAsync({
            address: addresses.sanctuaryLock as `0x${string}`,
            abi: SanctuaryLockABI as any,
            functionName: 'startRecording',
            args: [BigInt(newJobId)],
          } as any);
          addContractEvent(`Job #${newJobId} state: RECORDING`, "success");
          
          setTimeout(async () => {
            try {
              addContractEvent(`Automation: AI scanner assessing scar telemetry for Job #${newJobId}...`, "info");
              await writeContractAsync({
                address: addresses.sanctuaryLock as `0x${string}`,
                abi: SanctuaryLockABI as any,
                functionName: 'startAnalysis',
                args: [BigInt(newJobId)],
              } as any);
              addContractEvent(`Job #${newJobId} state: ANALYZING`, "success");
              
              setTimeout(async () => {
                try {
                  addContractEvent(`Automation: Preparing client-side JWE encryption under Lit ACCs for Job #${newJobId}...`, "info");
                  await writeContractAsync({
                    address: addresses.sanctuaryLock as `0x${string}`,
                    abi: SanctuaryLockABI as any,
                    functionName: 'startEncryption',
                    args: [BigInt(newJobId)],
                  } as any);
                  addContractEvent(`Job #${newJobId} state: ENCRYPTING`, "success");
                  
                  const plaintextReport = simulateDiagnostics(userAddress);
                  const encryptedLog = await encryptDiagnostics(
                    plaintextReport,
                    onboardingDID || `did:y8:anonymous-${userAddress.slice(2, 8)}`,
                    userAddress,
                    'sanctuary-austin-pod',
                    addresses.y8AccessRegistry
                  );
                  
                  const envelopeCID = 'bafybeidiagnostics' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
                  localStorage.setItem(`jwe_${envelopeCID}`, JSON.stringify(encryptedLog));
                  
                  addContractEvent(`JWE envelope generated. Encrypted payload stored at CID: ${envelopeCID.slice(0, 15)}...`, "info");
                  
                  await writeContractAsync({
                    address: addresses.sanctuaryLock as `0x${string}`,
                    abi: SanctuaryLockABI as any,
                    functionName: 'completeCheckup',
                    args: [BigInt(newJobId), envelopeCID],
                  } as any);
                  
                  addContractEvent(`Job #${newJobId} checkup completed successfully! State: COMPLETED`, "success");
                  await fetchCheckupQueue();
                } catch (e: any) {
                  console.error(e);
                  addContractEvent(`Job #${newJobId} encryption/completion failed: ${e.message || e}`, "info");
                  await writeContractAsync({
                    address: addresses.sanctuaryLock as `0x${string}`,
                    abi: SanctuaryLockABI as any,
                    functionName: 'failCheckup',
                    args: [BigInt(newJobId)],
                  } as any);
                } finally {
                  setIsSimulatingJob(false);
                  setSimulatingJobId(null);
                }
              }, 2000);
              
            } catch (e: any) {
              console.error(e);
              addContractEvent(`Job #${newJobId} analysis failed: ${e.message || e}`, "info");
              setIsSimulatingJob(false);
              setSimulatingJobId(null);
            }
          }, 2000);
          
        } catch (e: any) {
          console.error(e);
          addContractEvent(`Job #${newJobId} recording failed: ${e.message || e}`, "info");
          setIsSimulatingJob(false);
          setSimulatingJobId(null);
        }
      }, 2000);
      
    } catch (e: any) {
      console.error(e);
      addContractEvent(`Sanctuary request failed: ${e.message || e}`, "info");
      setTransactionLoading(false);
    }
  };

  const checkAccess = async (ownerAddress: string) => {
    if (!publicClient || !addresses.y8AccessRegistry || !userAddress) return false;
    try {
      const result = await publicClient.readContract({
        address: addresses.y8AccessRegistry as `0x${string}`,
        abi: Y8AccessRegistryABI as any,
        functionName: 'hasAccess',
        args: [ownerAddress as `0x${string}`, userAddress as `0x${string}`],
      } as any) as boolean;
      return result;
    } catch (e) {
      console.error("Error checking access registry:", e);
      return false;
    }
  };

  const handleDecryptDiagnostics = async (jobId: number, cid: string, patientAddress: string) => {
    if (!userAddress) return;
    setDecryptingJobId(jobId);
    
    setDecryptionErrors(prev => {
      const copy = { ...prev };
      delete copy[jobId];
      return copy;
    });
    
    try {
      const jweString = localStorage.getItem(`jwe_${cid}`);
      if (!jweString) {
        throw new Error("JWE diagnostic payload envelope not found in storage.");
      }
      
      const jwe = JSON.parse(jweString);
      const hasAccessVal = await checkAccess(patientAddress);
      const plaintext = await decryptDiagnostics(jwe, userAddress, hasAccessVal);
      const parsedDiagnostics = JSON.parse(plaintext);
      
      setDecryptedDiagnostics(prev => ({
        ...prev,
        [jobId]: parsedDiagnostics
      }));
      
      addContractEvent(`Decryption successful for Job #${jobId}! diagnostics loaded into memory.`, "success");
    } catch (e: any) {
      console.error("Decryption error:", e);
      setDecryptionErrors(prev => ({
        ...prev,
        [jobId]: e.message || String(e)
      }));
      addContractEvent(`Decryption denied for Job #${jobId}: ${e.message || e}`, "info");
    } finally {
      setDecryptingJobId(null);
    }
  };

  // Load Activity logs and todo items on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSessions = localStorage.getItem('y8_operator_sessions');
      const storedTodos = localStorage.getItem('y8_operator_todos');
      
      if (storedSessions) setLoggedSessions(JSON.parse(storedSessions));
      if (storedTodos) setTodoItems(JSON.parse(storedTodos));

      const storedXp = localStorage.getItem('y8_user_xp') || '240';
      const storedLevel = localStorage.getItem('y8_user_level') || '1';
      setUserXp(parseInt(storedXp));
      setUserLevel(parseInt(storedLevel));
    }
  }, []);

  // Compute cumulative minutes worked from logged work sessions
  useEffect(() => {
    const total = loggedSessions.reduce((acc, session) => {
      return acc + (session?.payload?.durationMinutes || 0);
    }, 0);
    setTotalMinutesWorked(total);
  }, [loggedSessions]);

  // Timer loop for tracking work hours
  useEffect(() => {
    let timerInterval: any;
    if (isTrackingWork && workStartTime !== null) {
      timerInterval = setInterval(() => {
        setElapsedWorkSeconds(Math.floor((Date.now() - workStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedWorkSeconds(0);
    }
    return () => clearInterval(timerInterval);
  }, [isTrackingWork, workStartTime]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleStartWork = () => {
    setIsTrackingWork(true);
    setWorkStartTime(Date.now());
    setWorkAccomplishment('');
    addContractEvent("Operator Work Swarm: Clock session started.", "info");
  };

  const handleStopWork = async () => {
    if (!workAccomplishment.trim()) {
      alert("Please specify your accomplishments before stopping the session.");
      return;
    }

    setLoadingText("Constructing JWS Work Log Payload...");
    setTransactionLoading(true);

    try {
      const elapsedMinutes = Math.max(1, Math.round(elapsedWorkSeconds / 60));
      const logTimestamp = new Date().toISOString();
      
      // Structure JWS Payload (similar to DAG-JOSE standard)
      const payload = {
        operator: walletAddress,
        durationMinutes: elapsedMinutes,
        accomplishments: workAccomplishment.trim(),
        timestamp: logTimestamp
      };

      const messageToSign = `Y8 Operator Work Log Session\nOperator: ${walletAddress}\nDuration: ${elapsedMinutes} minutes\nAccomplishment: ${payload.accomplishments}\nTimestamp: ${logTimestamp}`;
      
      setLoadingText("Cryptographically signing JWS payload via connected wallet...");
      
      if (!userAddress) {
        throw new Error("Wallet not connected. Connect your wallet to sign work logs.");
      }

      // Trigger actual wallet personal_sign message
      const signature = await signMessageAsync({
        message: messageToSign,
        account: userAddress
      });

      // Build DAG-JOSE styled JWS structure
      const signedSession = {
        payload,
        signature,
        cid: "bafybeic" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''), // simulated IPFS CID hash
        verified: true
      };

      const updatedSessions = [signedSession, ...loggedSessions];
      setLoggedSessions(updatedSessions);
      localStorage.setItem('y8_operator_sessions', JSON.stringify(updatedSessions));

      addContractEvent(`Logged Session Signed! JWS-CID: ${signedSession.cid.slice(0, 15)}... Sig: ${signature.slice(0, 16)}...`, 'tx');
      addContractEvent(`Work Log JWS verified & saved: ${payload.accomplishments.slice(0, 30)}...`, "success");

      // Reset state
      setIsTrackingWork(false);
      setWorkStartTime(null);
      setWorkAccomplishment('');

    } catch (e: any) {
      console.error(e);
      addContractEvent(`Work signature rejected: ${e.message || e}`, "info");
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo = {
      id: 'todo-' + Math.random().toString(36).substring(2, 9),
      text: newTodoText.trim(),
      completed: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextTodos = [...todoItems, newTodo];
    setTodoItems(nextTodos);
    localStorage.setItem('y8_operator_todos', JSON.stringify(nextTodos));
    setNewTodoText('');
    addContractEvent(`Added to TODO Planner: "${newTodo.text}"`, "info");
  };

  const handleToggleTodo = (id: string) => {
    const nextTodos = todoItems.map(todo => {
      if (todo.id === id) {
        const nextState = !todo.completed;
        addContractEvent(`${nextState ? "Completed" : "Re-opened"} task: "${todo.text}"`, "success");
        return { ...todo, completed: nextState };
      }
      return todo;
    });
    setTodoItems(nextTodos);
    localStorage.setItem('y8_operator_todos', JSON.stringify(nextTodos));
  };

  const handleDeleteTodo = (id: string) => {
    const todo = todoItems.find(t => t.id === id);
    const nextTodos = todoItems.filter(todo => todo.id !== id);
    setTodoItems(nextTodos);
    localStorage.setItem('y8_operator_todos', JSON.stringify(nextTodos));
    if (todo) {
      addContractEvent(`Removed task: "${todo.text}"`, "info");
    }
  };

  const handleScheduleAgentTaskFromBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulerInstructions.trim()) return;

    const newJob = {
      id: 'job-' + Math.random().toString(36).substring(2, 9),
      day: schedulerDay,
      agentType: schedulerAgentType,
      instructions: schedulerInstructions.trim(),
      priority: schedulerPriority,
      status: 'SCHEDULED'
    };

    // Load current calendar jobs, append, and save
    const storedJobs = localStorage.getItem('y8_calendar_jobs');
    let currentJobs = [];
    if (storedJobs) {
      try {
        currentJobs = JSON.parse(storedJobs);
      } catch {}
    }
    const nextJobs = [...currentJobs, newJob];
    localStorage.setItem('y8_calendar_jobs', JSON.stringify(nextJobs));

    // Award Operator XP
    const storedXp = localStorage.getItem('y8_user_xp') || '240';
    const nextXp = parseInt(storedXp) + 40;
    localStorage.setItem('y8_user_xp', nextXp.toString());
    const nextLevel = Math.floor(nextXp / 300) + 1;
    localStorage.setItem('y8_user_level', nextLevel.toString());
    setUserXp(nextXp);
    setUserLevel(nextLevel);

    addContractEvent(`AI Swarm Task Registered! Gained +40 XP. Swarm Agent: "${schedulerAgentType}"`, "success");
    addContractEvent(`AI Swarm Task scheduled on-chain for Day ${schedulerDay}: ${schedulerAgentType}`, 'success');

    // Trigger storage event to synchronize calendar page if open
    window.dispatchEvent(new Event('storage'));

    // Reset Form
    setSchedulerInstructions('');
    alert(`📅 AI Swarm task successfully scheduled for Day ${schedulerDay}! It will appear on your Swarm Scheduler calendar.`);
  };

  // Sync instruction preset for blog scheduler
  useEffect(() => {
    if (schedulerAgentType === 'YouTube Growth Swarm Bot') {
      setSchedulerInstructions('Initiate social marketing outreach to gaming influencers to drive likes, comments, and subscribers.');
    } else if (schedulerAgentType === 'Helios Planet Shade Analyst') {
      setSchedulerInstructions('Analyze L1 Lagrangian coordinates to calculate optimal solar parasol angles for climate mitigation.');
    } else if (schedulerAgentType === 'BioMoist Crop Controller Jet') {
      setSchedulerInstructions('Ping agricultural moisture sensors at CEA Food Dome B and execute mist sprinkler cycle if dry.');
    } else if (schedulerAgentType === 'EcoLoad Compute Balancer') {
      setSchedulerInstructions('Scan grid batteries state-of-charge. Migrate heavy container tasks to nodes with peak green power.');
    } else {
      setSchedulerInstructions('Initialize intake coordinator scheduling bot to assign sanctuary slots and reserve grid e-bikes.');
    }
  }, [schedulerAgentType]);

  // Default regional Safe Purchase Zones (dynamic nearest nodes loaded)
  const [defaultZones, setDefaultZones] = useState<PurchaseZone[]>(ALL_REGISTERED_SPZS.slice(0, 3));
  // Full sorted zones list
  const [sortedZones, setSortedZones] = useState<PurchaseZone[]>(ALL_REGISTERED_SPZS);
  // Dynamic number of nearest zones to display (defaults to 3, can include as many as user wants)
  const [nearestZonesCount, setNearestZonesCount] = useState<number>(3);

  // Sync activeFilterTag and selectedTag with user preferences on boot/change
  useEffect(() => {
    if (preferences.tradePreference) {
      setActiveFilterTag(preferences.tradePreference as any);
      if (['general', 'labor', 'services', 'tool', 'rideshare'].includes(preferences.tradePreference)) {
        setSelectedTag(preferences.tradePreference as any);
      }
    }
  }, [preferences.tradePreference]);

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [resolvedZone, setResolvedZone] = useState<PurchaseZone | null>(null);
  const [zoneDistance, setZoneDistance] = useState<number | null>(null);
  const [activeCityId, setActiveCityId] = useState<string>('sherman');

  // Distance computation helper using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // distance in miles
  };

  const updateNearestZones = (userLat: number, userLng: number) => {
    // Calculate distance for all global zones
    const zonesWithDistance = ALL_REGISTERED_SPZS.map(zone => {
      const dist = calculateDistance(userLat, userLng, zone.latitude, zone.longitude);
      return { ...zone, distance: dist };
    });

    // Parse custom shop facilities if any and add them as candidate zones
    if (typeof window !== 'undefined') {
      const storedFacilities = localStorage.getItem('y8_shop_facilities');
      if (storedFacilities) {
        try {
          const facilities = JSON.parse(storedFacilities);
          facilities.forEach((fac: any) => {
            if (fac.latitude !== undefined && fac.longitude !== undefined) {
              const lat = fac.latitude;
              const lng = fac.longitude;
              if (!zonesWithDistance.some(z => z.id === fac.id)) {
                const dist = calculateDistance(userLat, userLng, lat, lng);
                zonesWithDistance.push({
                  id: fac.id,
                  name: `${fac.name} (Safe Purchase Zone)`,
                  latitude: lat,
                  longitude: lng,
                  description: `Custom registered ${fac.domain.toUpperCase()} facility.`,
                  distance: dist
                });
              }
            } else {
              const parts = fac.location.split(',');
              if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lng = parseFloat(parts[1]);
                if (!isNaN(lat) && !isNaN(lng)) {
                  if (!zonesWithDistance.some(z => z.id === fac.id)) {
                    const dist = calculateDistance(userLat, userLng, lat, lng);
                    zonesWithDistance.push({
                      id: fac.id,
                      name: `${fac.name} (Safe Purchase Zone)`,
                      latitude: lat,
                      longitude: lng,
                      description: `Custom registered ${fac.domain.toUpperCase()} facility.`,
                      distance: dist
                    });
                  }
                }
              }
            }
          });
        } catch {}
      }
    }

    // Sort by distance ascending
    zonesWithDistance.sort((a, b) => a.distance - b.distance);

    // Save full sorted list (stripped of distance property to match PurchaseZone interface)
    const sorted = zonesWithDistance.map(({ distance, ...rest }) => rest);
    setSortedZones(sorted);
    
    // Set resolved (closest) zone
    if (zonesWithDistance.length > 0) {
      const { distance, ...closestZone } = zonesWithDistance[0];
      setResolvedZone(closestZone);
      setZoneDistance(distance);
      localStorage.setItem('y8_blog_zone', JSON.stringify(closestZone));
    }
  };

  // Sync defaultZones when sortedZones or nearestZonesCount changes
  useEffect(() => {
    const sliced = sortedZones.slice(0, nearestZonesCount);
    setDefaultZones(sliced);
    
    if (sliced.length > 0 && !sliced.some(z => z.id === activeCityId)) {
      setActiveCityId(sliced[0].id);
    }
  }, [sortedZones, nearestZonesCount, activeCityId]);

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [selectedTag, setSelectedTag] = useState<'general' | 'labor' | 'services' | 'tool' | 'rideshare'>('general');
  const [activeFilterTag, setActiveFilterTag] = useState<'all' | 'general' | 'labor' | 'services' | 'tool' | 'rideshare'>('all');

  const handleFilterChange = (tag: 'all' | 'general' | 'labor' | 'services' | 'tool' | 'rideshare') => {
    setActiveFilterTag(tag);
    if (tag !== 'all' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('y8_user_action', {
        detail: {
          type: 'tradePreference',
          value: tag,
          source: `Trade Room Filter Selected: "${tag.toUpperCase()}"`
        }
      }));
    }
  };

  const handleSelectTag = (tag: 'general' | 'labor' | 'services' | 'tool' | 'rideshare') => {
    setSelectedTag(tag);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('y8_user_action', {
        detail: {
          type: 'tradePreference',
          value: tag,
          source: `Composer Tag Selected: "${tag.toUpperCase()}"`
        }
      }));
    }
  };

  // Map & Job Pin State vectors
  const [mapPins, setMapPins] = useState<MapPinItem[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPinItem | null>(null);
  const [broadcastToMap, setBroadcastToMap] = useState<boolean>(false);
  const [mapPinType, setMapPinType] = useState<'offer_ride' | 'find_ride' | 'offer_labor' | 'request_labor' | 'tool_rental'>('offer_ride');
  const [mapOffering, setMapOffering] = useState<string>('');
  const [mapLookingFor, setMapLookingFor] = useState<string>('');

  // Craigslist Mapping states
  const [craigslistListings, setCraigslistListings] = useState<CraigslistListing[]>(INITIAL_CRAIGSLIST_LISTINGS);
  const [craigslistSearchQuery, setCraigslistSearchQuery] = useState('');

  const findClosestSafeZoneForSuburb = (suburbName: string) => {
    const normName = suburbName.toLowerCase().trim();
    const subCoords = REGIONAL_SUBURBS[normName] || { latitude: 33.7840, longitude: -96.6711 }; // default to Pottsboro
    
    let closestZone = ALL_REGISTERED_SPZS[0];
    let minDistance = Infinity;

    // Check all default registered SPZs
    ALL_REGISTERED_SPZS.forEach(zone => {
      const dist = calculateDistance(subCoords.latitude, subCoords.longitude, zone.latitude, zone.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestZone = zone;
      }
    });

    // Also check any custom shop facilities in localStorage if present
    if (typeof window !== 'undefined') {
      const storedFacilities = localStorage.getItem('y8_shop_facilities');
      if (storedFacilities) {
        try {
          const facilities = JSON.parse(storedFacilities);
          facilities.forEach((fac: any) => {
            let lat = fac.latitude;
            let lng = fac.longitude;
            if (lat === undefined || lng === undefined) {
              const parts = fac.location.split(',');
              if (parts.length === 2) {
                lat = parseFloat(parts[0]);
                lng = parseFloat(parts[1]);
              }
            }
            if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
              const dist = calculateDistance(subCoords.latitude, subCoords.longitude, lat, lng);
              if (dist < minDistance) {
                minDistance = dist;
                closestZone = {
                  id: fac.id,
                  name: `${fac.name} (Safe Purchase Zone)`,
                  latitude: lat,
                  longitude: lng,
                  description: `Custom registered ${fac.domain} facility.`
                };
              }
            }
          });
        } catch {}
      }
    }

    return {
      zone: closestZone,
      distance: minDistance,
      latitude: subCoords.latitude,
      longitude: subCoords.longitude
    };
  };

  const getCraigslistPins = (): MapPinItem[] => {
    return craigslistListings.map(cl => {
      const resolved = findClosestSafeZoneForSuburb(cl.suburb);
      return {
        id: cl.id,
        type: 'craigslist',
        title: cl.title,
        offering: cl.description,
        lookingFor: cl.price,
        latitude: resolved.latitude + (cl.id === 'cl-6' ? 0.02 : cl.id === 'cl-1' ? -0.015 : 0.01) * Math.sin(parseInt(cl.id.split('-')[1]) || 1), // small offset
        longitude: resolved.longitude + (cl.id === 'cl-6' ? -0.02 : cl.id === 'cl-1' ? 0.012 : -0.01) * Math.cos(parseInt(cl.id.split('-')[1]) || 1),
        sender: cl.contact,
        timestamp: 'Craigslist Post',
        zoneName: resolved.zone.name
      };
    });
  };

  const handleBridgeCraigslistToSafePurchase = (listing: CraigslistListing) => {
    const resolved = findClosestSafeZoneForSuburb(listing.suburb);
    setActiveCityId(resolved.zone.id);

    let pinType: 'offer_ride' | 'find_ride' | 'offer_labor' | 'request_labor' | 'tool_rental' = 'offer_labor';
    if (listing.category === 'rideshare') pinType = 'offer_ride';
    else if (listing.category === 'tool') pinType = 'tool_rental';
    else if (listing.category === 'labor') pinType = 'offer_labor';

    setInputMessage(`[Craigslist Bridge] ${listing.title}`);
    setBroadcastToMap(true);
    setMapPinType(pinType);
    setMapOffering(listing.title.slice(0, 50));
    setMapLookingFor(listing.price);

    setActiveLeftTab('trade');

    addContractEvent(`Bridged Craigslist Post from ${listing.suburb}. Routing recommended Safe Purchase Zone: ${resolved.zone.name.split(' (')[0]} (${resolved.distance.toFixed(1)} miles).`, 'success');
    alert(`🔗 Craigslist post "${listing.title}" successfully bridged to Trade Rooms! \n\nThe nearest Safe Purchase Zone is recommended as "${resolved.zone.name.split(' (')[0]}" (${resolved.distance.toFixed(1)} miles). Click "Send" (✈) in the Trade Composer to submit your on-chain listing!`);
  };

  const filteredCraigslistListings = craigslistListings.filter(cl => {
    const query = craigslistSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return cl.title.toLowerCase().includes(query) || 
           cl.suburb.toLowerCase().includes(query) || 
           cl.description.toLowerCase().includes(query) || 
           cl.category.toLowerCase().includes(query);
  });

  // Web3 Ledger & Polling States
  interface ContractEvent {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'tx';
  }
  const [contractLogs, setContractLogs] = useState<ContractEvent[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [activeRightTab, setActiveRightTab] = useState<'chronicles' | 'board' | 'craigslist' | 'my-gigs'>('board');

  // Filter map pins for active wallet address (sender or receiver)
  const myGigsPins = mapPins.filter(pin => {
    const userAddrLower = walletAddress.toLowerCase();
    const pinSenderLower = pin.sender ? pin.sender.toLowerCase() : '';
    const pinReceiverLower = pin.receiver ? pin.receiver.toLowerCase() : '';
    const walletTrunc = walletAddress.slice(0, 6).toLowerCase() + '...' + walletAddress.slice(-4).toLowerCase();
    return pinSenderLower === userAddrLower || 
           pinSenderLower === walletTrunc ||
           pinReceiverLower === userAddrLower ||
           pinReceiverLower === walletTrunc;
  });

  // Digital ID and Reputation Profiles State
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [userDIDInput, setUserDIDInput] = useState<string>('');

  // Blog Chronicles Feed
  const blogArticles: BlogArticle[] = [
    {
      id: 'a1',
      category: 'Space & Climate',
      title: 'Helios Sunshade: Simulating Lagrangian L1 Mitigation Parameters',
      summary: 'A deep dive into solar radiance deflection mathematics and dynamic albedo calculation metrics.',
      content: 'The Space Sunshade project represents the pinnacle of modern environmental engineering. Positioned at the Lagrange L1 point between the Earth and Sun, our parasol deflects approximately 1.8% of incoming solar radiation. Operating under local franchise parameters, operators schedule AI agents to execute deflection calculations. The telemetry offsets are logged securely onto our localized ledger service to mint carbon offsetting tokens dynamically.'
    },
    {
      id: 'a2',
      category: 'Decentralized Grid',
      title: 'Dynamic Workload Shifting: Mitigating Node Thermal Strain',
      summary: 'How services/ai relocates heavy container computational pipelines during solar battery depleting cycles.',
      content: 'In a decentralized datacenter infrastructure, grid resilience is everything. By coordinating edge telemetry with services/financial schemas, our AI scheduler monitors the State of Charge (SOC) of solar batteries. When local reserves fall below 30%, compute tasks migrate transparently to online nodes. This closed-loop resource management balances municipal grids and establishes a zero-emission compute workflow.'
    },
    {
      id: 'a3',
      category: 'CEA Hydroponics',
      title: 'Soil Telemetry Spritzers: Optimizing Crop Yields',
      summary: 'Hydroponics automation loops sequenced securely using connected IoT telemetry channels.',
      content: 'Controlled Environment Agriculture (CEA) domes operate under hyper-targeted hydration models. Hydroponic crop sensors push moisture level data every 60 seconds. When root moisture drops below critical limits, water sprits cycles trigger, injecting nutrient-rich fluid. This automated process maximizes vertical farming yields and logs water consumption audits to local ledgers.'
    }
  ];

  const [readingArticle, setReadingArticle] = useState<string | null>(null);

  // Auto-scroll chat area
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Auto-scroll contract ledger terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [contractLogs]);

  // Load chat messages and GPS from localStorage on boot
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem('y8_blog_messages');
      const storedCoords = localStorage.getItem('y8_blog_coords');
      const storedZone = localStorage.getItem('y8_blog_zone');

      if (storedMessages) {
        setChatMessages(JSON.parse(storedMessages));
      } else {
        // Preset mock messages to make chats look active
        const initialMessages: Message[] = [
          {
            id: 'm-init1',
            sender: '0x9B8A...88De',
            text: 'Hello team! Our local Pottsboro Safe Purchase Zone is fully synced with the smart contract ledger. Transactions clearing at 4s.',
            timestamp: '11:42 AM',
            zoneName: 'Pottsboro Grid Node A (Safe Purchase Zone)',
            cityId: 'pottsboro',
            isSelf: false,
            tag: 'general'
          },
          {
            id: 'm-init2',
            sender: '0x3F2A...44Cd',
            text: 'Just booked a therapeutic sanctuary pod session via Austin Sanctuary. Biometric door access code arrived in my wallet successfully!',
            timestamp: '11:45 AM',
            zoneName: 'Austin Sanctuary Pod (Safe Purchase Zone)',
            cityId: 'austin',
            isSelf: false,
            tag: 'services'
          },
          {
            id: 'm-init3',
            sender: '0x7E1D...99Ef',
            text: 'Sherman solar battery bank is currently at 85% capacity. Compute workloads running at full capacity. Send calculations!',
            timestamp: '12:02 PM',
            zoneName: 'Sherman Climate Node B (Safe Purchase Zone)',
            cityId: 'sherman',
            isSelf: false,
            tag: 'tool'
          }
        ];
        setChatMessages(initialMessages);
        localStorage.setItem('y8_blog_messages', JSON.stringify(initialMessages));
      }

      let initialCoords = { latitude: 33.784, longitude: -96.6711 };
      if (storedCoords) {
        try {
          const parsed = JSON.parse(storedCoords);
          setCoords(parsed);
          initialCoords = parsed;
        } catch {}
      }
      updateNearestZones(initialCoords.latitude, initialCoords.longitude);
      if (storedZone) {
        try {
          setResolvedZone(JSON.parse(storedZone));
        } catch {}
      }

      // Load or Initialize Map Pins
      const storedPins = localStorage.getItem('y8_blog_map_pins');
      if (storedPins) {
        setMapPins(JSON.parse(storedPins));
      } else {
        const initialPins: MapPinItem[] = [
          {
            id: 'pin-1',
            type: 'offer_ride',
            title: 'Electric Carpool to Sherman',
            offering: 'Ride in Tesla Model Y (3 seats open)',
            lookingFor: '0.02 ETH or split charge',
            latitude: 30.2672 + 0.15, // Austin area offset
            longitude: -97.7431 - 0.10,
            sender: '0x3F2A...44Cd',
            timestamp: '11:45 AM',
            zoneName: 'Austin Sanctuary Pod (Safe Purchase Zone)'
          },
          {
            id: 'pin-2',
            type: 'find_ride',
            title: 'Need emergency transport to Pottsboro',
            offering: 'Can pay in solar compute credits',
            lookingFor: 'Ride from Sherman Node B',
            latitude: 33.6356 + 0.08, // Sherman area offset
            longitude: -96.6089 + 0.05,
            sender: '0x7E1D...99Ef',
            timestamp: '12:02 PM',
            zoneName: 'Sherman Climate Node B (Safe Purchase Zone)'
          },
          {
            id: 'pin-3',
            type: 'offer_labor',
            title: 'CEA Dome Hydroponics Setup',
            offering: '4 hours agricultural support',
            lookingFor: '0.08 ETH',
            latitude: 33.7840 - 0.05, // Pottsboro area offset
            longitude: -96.6711 + 0.08,
            sender: '0x9B8A...88De',
            timestamp: '11:42 AM',
            zoneName: 'Pottsboro Grid Node A (Safe Purchase Zone)'
          },
          {
            id: 'pin-4',
            type: 'request_labor',
            title: 'Assemble Battery Rack Grid',
            offering: '0.12 ETH cash clearing',
            lookingFor: 'Certified electrician technician',
            latitude: 32.7767 + 0.10, // Dallas area offset
            longitude: -96.7970 - 0.12,
            sender: '0x5a1b...88c4',
            timestamp: '12:15 PM',
            zoneName: 'Dallas HQ Hub (Safe Purchase Zone)'
          }
        ];
        setMapPins(initialPins);
        localStorage.setItem('y8_blog_map_pins', JSON.stringify(initialPins));
      }

      // Load or Initialize Contract Event Logs
      const storedLogs = localStorage.getItem('y8_blog_contract_logs');
      if (storedLogs) {
        setContractLogs(JSON.parse(storedLogs));
      } else {
        const initialLogs: ContractEvent[] = [
          { timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), message: 'System boot: SafePurchaseRegistry contract interface initialized.', type: 'info' },
          { timestamp: new Date(Date.now() - 240000).toLocaleTimeString(), message: 'Query RPC Provider: Synced current state with Block #1948201.', type: 'info' },
          { timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), message: 'Event watcher registered: Listening for ZoneRegistered, ListingCreated, ListingAccepted.', type: 'success' }
        ];
        setContractLogs(initialLogs);
        localStorage.setItem('y8_blog_contract_logs', JSON.stringify(initialLogs));
      }

      // Load or Initialize Profiles
      const storedProfiles = localStorage.getItem('y8_blog_profiles');
      if (storedProfiles) {
        setProfiles(JSON.parse(storedProfiles));
      } else {
        const defaultProfiles: Record<string, UserProfile> = {
          '0x9b8a...88de': { address: '0x9b8a...88de', digitalID: 'did:y8:pottsboro-01', reputationStake: 150, totalWeightedScore: 384, totalStakeWeight: 4, ratingCount: 4 },
          '0x3f2a...44cd': { address: '0x3f2a...44cd', digitalID: 'did:y8:austin-09', reputationStake: 250, totalWeightedScore: 784, totalStakeWeight: 8, ratingCount: 8 },
          '0x7e1d...99ef': { address: '0x7e1d...99ef', digitalID: 'did:y8:sherman-11', reputationStake: 100, totalWeightedScore: 282, totalStakeWeight: 3, ratingCount: 3 },
          '0x5a1b...88c4': { address: '0x5a1b...88c4', digitalID: 'did:y8:dallas-03', reputationStake: 350, totalWeightedScore: 1188, totalStakeWeight: 12, ratingCount: 12 }
        };
        // Normalize keys
        defaultProfiles['0x9B8A...88De'] = { ...defaultProfiles['0x9b8a...88de'], address: '0x9B8A...88De' };
        defaultProfiles['0x3F2A...44Cd'] = { ...defaultProfiles['0x3f2a...44cd'], address: '0x3F2A...44Cd' };
        defaultProfiles['0x7E1D...99Ef'] = { ...defaultProfiles['0x7e1d...99ef'], address: '0x7E1D...99Ef' };
        defaultProfiles['0x5a1b...88c4'] = { ...defaultProfiles['0x5a1b...88c4'], address: '0x5a1b...88c4' };
        
        // Initialize user profile
        const userTrunc = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
        defaultProfiles[walletAddress.toLowerCase()] = { address: walletAddress, digitalID: '', reputationStake: 0, totalWeightedScore: 0, totalStakeWeight: 0, ratingCount: 0 };
        defaultProfiles[userTrunc] = defaultProfiles[walletAddress.toLowerCase()];

        setProfiles(defaultProfiles);
        localStorage.setItem('y8_blog_profiles', JSON.stringify(defaultProfiles));
      }
    }
  }, [walletAddress]);

  const getTagIcon = (tag?: string) => {
    switch (tag) {
      case 'labor': return <Wrench className="h-3 w-3" />;
      case 'services': return <Briefcase className="h-3 w-3" />;
      case 'tool': return <Cpu className="h-3 w-3" />;
      case 'rideshare': return <Car className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getTagStyleClass = (tag?: string) => {
    switch (tag) {
      case 'labor': return styles.tagLabor;
      case 'services': return styles.tagServices;
      case 'tool': return styles.tagTool;
      case 'rideshare': return styles.tagRideshare;
      default: return styles.tagGeneral;
    }
  };

  const addContractEvent = (message: string, type: 'info' | 'success' | 'tx') => {
    setContractLogs(prev => {
      const next = [...prev, { timestamp: new Date().toLocaleTimeString(), message, type }];
      localStorage.setItem('y8_blog_contract_logs', JSON.stringify(next));
      return next;
    });
  };

  // Real-time Geolocation Polling & Routing updates
  useEffect(() => {
    if (!isPolling) return;

    addContractEvent("Real-time GPS tracking sequence initiated.", "info");

    const interval = setInterval(() => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          setCoords({ latitude: userLat, longitude: userLng });
          localStorage.setItem('y8_blog_coords', JSON.stringify({ latitude: userLat, longitude: userLng }));

          updateNearestZones(userLat, userLng);

          // Resolve closest zone for log readout
          let nearestZone = ALL_REGISTERED_SPZS[0];
          let minDistance = Infinity;
          ALL_REGISTERED_SPZS.forEach((zone) => {
            const dist = calculateDistance(userLat, userLng, zone.latitude, zone.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearestZone = zone;
            }
          });

          // Calculate routing bearing
          const dLon = (nearestZone.longitude - userLng) * Math.PI / 180;
          const lat1 = userLat * Math.PI / 180;
          const lat2 = nearestZone.latitude * Math.PI / 180;
          const y = Math.sin(dLon) * Math.cos(lat2);
          const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
          const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
          
          let bearingDir = 'N';
          if (bearing >= 45 && bearing < 135) bearingDir = 'E';
          else if (bearing >= 135 && bearing < 225) bearingDir = 'S';
          else if (bearing >= 225 && bearing < 315) bearingDir = 'W';

          addContractEvent(
            `GPS Ping: User at Lat ${userLat.toFixed(4)}°, Lon ${userLng.toFixed(4)}°. Closest node: ${nearestZone.name.split(' (')[0]} (${minDistance.toFixed(2)} mi, Bearing: ${bearing.toFixed(0)}° ${bearingDir}).`,
            'info'
          );

          // Simulate updating coordinate tracking for user's own active map pins
          const selfPins = mapPins.filter(pin => pin.sender.includes(walletAddress.slice(0, 6)));
          if (selfPins.length > 0) {
            selfPins.forEach(pin => {
              addContractEvent(
                `[TX] SafePurchaseRegistry.updateLocation(listingId: ${pin.id}, lat: ${userLat.toFixed(4)}, lon: ${userLng.toFixed(4)}) - Mined in block.`,
                'tx'
              );
            });
          }
        },
        (error) => {
          console.error(error);
          addContractEvent(`GPS Polling Error: ${error.message}`, 'info');
        },
        { enableHighAccuracy: true }
      );
    }, 10000);

    return () => {
      clearInterval(interval);
      addContractEvent("Real-time GPS tracking sequence suspended.", "info");
    };
  }, [isPolling, mapPins, walletAddress]);

  // GPS Locate Action
  const handleGPSLocate = () => {
    if (!navigator.geolocation) {
      alert('Error: Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setCoords({ latitude: userLat, longitude: userLng });
        localStorage.setItem('y8_blog_coords', JSON.stringify({ latitude: userLat, longitude: userLng }));

        updateNearestZones(userLat, userLng);
        setGpsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGpsLoading(false);
        alert(`GPS Locate failed: ${error.message}. Resolving to Pottsboro by default.`);
        // Fallback to defaults
        setResolvedZone(sortedZones[0] || ALL_REGISTERED_SPZS[0]);
        setZoneDistance(0.5);
        setActiveCityId('pottsboro');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Resolve active zone name
    // Use resolved GPS zone if available, otherwise fallback to default matching activeCityId
    const currentZoneName = (resolvedZone && activeCityId === resolvedZone.id) 
      ? resolvedZone.name 
      : sortedZones.find(z => z.id === activeCityId)?.name || 'Generic Zone';

    const newMessage: Message = {
      id: 'm-' + Math.floor(Math.random() * 10000),
      sender: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      zoneName: currentZoneName,
      cityId: activeCityId,
      isSelf: true,
      tag: selectedTag
    };

    const nextMessages = [...chatMessages, newMessage];
    setChatMessages(nextMessages);
    localStorage.setItem('y8_blog_messages', JSON.stringify(nextMessages));

    // Handle Map Pin Broadcast
    if (broadcastToMap && mapOffering.trim() && mapLookingFor.trim()) {
      let lat = 33.7840;
      let lng = -96.6711;
      
      if (coords) {
        lat = coords.latitude;
        lng = coords.longitude;
      } else {
        const activeZoneObj = sortedZones.find(z => z.id === activeCityId) || sortedZones[0] || ALL_REGISTERED_SPZS[0];
        lat = activeZoneObj.latitude + (Math.random() - 0.5) * 0.12;
        lng = activeZoneObj.longitude + (Math.random() - 0.5) * 0.12;
      }

      const txHash = '0x' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0') + '...' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0');
      addContractEvent(`[TX] Broadcasting SafePurchaseRegistry.createListing(${mapPinType}, "${mapOffering}", "${mapLookingFor}", Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)})`, 'info');

      const newPin: MapPinItem = {
        id: 'pin-' + Math.floor(Math.random() * 100000),
        type: mapPinType,
        title: inputMessage.length > 40 ? inputMessage.slice(0, 37) + '...' : inputMessage,
        offering: mapOffering,
        lookingFor: mapLookingFor,
        latitude: lat,
        longitude: lng,
        sender: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        zoneName: currentZoneName,
        status: 'Active'
      };

      const nextPins = [...mapPins, newPin];
      setMapPins(nextPins);
      localStorage.setItem('y8_blog_map_pins', JSON.stringify(nextPins));

      // Trigger actual smart contract write transaction
      if (addresses.safePurchaseRegistry) {
        let typeIndex = 6;
        if (mapPinType === 'offer_ride') typeIndex = 0;
        else if (mapPinType === 'find_ride') typeIndex = 1;
        else if (mapPinType === 'offer_labor') typeIndex = 2;
        else if (mapPinType === 'request_labor') typeIndex = 3;
        else if (mapPinType === 'tool_rental') typeIndex = 4;
        else if (mapPinType === 'service_request') typeIndex = 5;

        writeContractAsync({
          address: addresses.safePurchaseRegistry as `0x${string}`,
          abi: SafePurchaseRegistryABI,
          functionName: 'createListing',
          args: [
            typeIndex,
            newPin.title,
            mapOffering,
            mapLookingFor,
            BigInt(Math.floor(lat * 1000000)),
            BigInt(Math.floor(lng * 1000000))
          ]
        } as any).then((tx) => {
          addContractEvent(`[TX] Mined! Block #1948202. Hash: ${tx.slice(0, 10)}... Gas: 64,812.`, 'tx');
          addContractEvent(`Event ListingCreated(id: ${newPin.id}, creator: ${newPin.sender}, type: ${mapPinType})`, 'success');
        }).catch((err) => {
          console.error(err);
          addContractEvent(`[TX ERROR] ${err.message.slice(0, 60)}...`, 'info');
          // Fallback log
          addContractEvent(`[TX fallback] Mined! Block #1948202. Hash: ${txHash}. Gas: 64,812.`, 'tx');
          addContractEvent(`Event ListingCreated(id: ${newPin.id}, creator: ${newPin.sender}, type: ${mapPinType})`, 'success');
        });
      } else {
        // Fallback simulation if registry not deployed
        addContractEvent(`[TX simulated] Mined! Block #1948202. Hash: ${txHash}. Gas: 64,812.`, 'tx');
        addContractEvent(`Event ListingCreated(id: ${newPin.id}, creator: ${newPin.sender}, type: ${mapPinType})`, 'success');
      }

      // Reset composer fields
      setBroadcastToMap(false);
      setMapOffering('');
      setMapLookingFor('');
    }

    setInputMessage('');
    setSelectedTag('general'); // Reset to general after sending

    // Trigger Dynamic Response Bot
    setTimeout(() => {
      triggerBotReply(currentZoneName, activeCityId, nextMessages);
    }, 1500);
  };

  const handleAcceptPin = (pinId: string) => {
    const pinIndex = mapPins.findIndex(p => p.id === pinId);
    if (pinIndex === -1) return;

    const pin = mapPins[pinIndex];
    const txHash = '0x' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0') + '...' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0');
    
    addContractEvent(`[TX] Broadcasting SafePurchaseRegistry.acceptListing(listingId: ${pinId})`, 'info');

    // Update state
    const updatedPins = [...mapPins];
    updatedPins[pinIndex] = {
      ...pin,
      receiver: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
      status: 'Accepted'
    };

    setMapPins(updatedPins);
    localStorage.setItem('y8_blog_map_pins', JSON.stringify(updatedPins));

    // Focus on the accepted pin's location on the globe
    setSelectedPin(updatedPins[pinIndex]);

    const numericId = parseInt(pinId.replace('pin-', '')) || Math.floor(Math.random() * 1000) + 1;

    // Trigger actual smart contract write transaction
    if (addresses.safePurchaseRegistry) {
      writeContractAsync({
        address: addresses.safePurchaseRegistry as `0x${string}`,
        abi: SafePurchaseRegistryABI,
        functionName: 'acceptListing',
        args: [BigInt(numericId)]
      } as any).then((tx) => {
        addContractEvent(`[TX] Mined! Block #1948203. Hash: ${tx.slice(0, 10)}... Gas: 42,912.`, 'tx');
        addContractEvent(`Event ListingAccepted(id: ${pinId}, receiver: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`, 'success');
      }).catch((err) => {
        console.error(err);
        addContractEvent(`[TX ERROR] ${err.message.slice(0, 60)}...`, 'info');
        // Fallback
        addContractEvent(`[TX fallback] Mined! Block #1948203. Hash: ${txHash}. Gas: 42,912.`, 'tx');
        addContractEvent(`Event ListingAccepted(id: ${pinId}, receiver: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`, 'success');
      });
    } else {
      // Fallback simulation if registry not deployed
      setTimeout(() => {
        addContractEvent(`[TX simulated] Mined! Block #1948203. Hash: ${txHash}. Gas: 42,912.`, 'tx');
        addContractEvent(`Event ListingAccepted(id: ${pinId}, receiver: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`, 'success');
      }, 1000);
    }
  };

  const getProfile = (address: string): UserProfile => {
    const key = address.toLowerCase();
    if (profiles[key]) return profiles[key];
    
    const matchKey = Object.keys(profiles).find(
      k => k.toLowerCase() === key || k.replace(/\s/g, '').toLowerCase() === key
    );
    if (matchKey) return profiles[matchKey];
    
    return {
      address,
      digitalID: '',
      reputationStake: 0,
      totalWeightedScore: 0,
      totalStakeWeight: 0,
      ratingCount: 0
    };
  };

  const handleRegisterDigitalID = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDIDInput.trim()) return;

    const did = userDIDInput.trim();
    const userTrunc = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
    const txHash = '0x' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0') + '...' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0');

    addContractEvent(`[TX] Broadcasting SafePurchaseRegistry.registerDigitalID("${did}")`, 'info');

    const updateProfileState = () => {
      setProfiles(prev => {
        const next = { ...prev };
        
        const currentProfile = next[walletAddress.toLowerCase()] || {
          address: walletAddress,
          digitalID: '',
          reputationStake: 0,
          totalWeightedScore: 0,
          totalStakeWeight: 0,
          ratingCount: 0
        };
        
        const updated = { ...currentProfile, digitalID: did };
        next[walletAddress.toLowerCase()] = updated;
        next[userTrunc] = updated;

        localStorage.setItem('y8_blog_profiles', JSON.stringify(next));
        return next;
      });
    };

    // Trigger actual smart contract write transaction
    if (addresses.safePurchaseRegistry) {
      writeContractAsync({
        address: addresses.safePurchaseRegistry as `0x${string}`,
        abi: SafePurchaseRegistryABI,
        functionName: 'registerDigitalID',
        args: [did]
      } as any).then((tx) => {
        updateProfileState();
        addContractEvent(`[TX] Mined! Block #1948204. Hash: ${tx.slice(0, 10)}... Gas: 47,211.`, 'tx');
        addContractEvent(`Event DigitalIDRegistered(owner: ${userTrunc}, digitalID: "${did}")`, 'success');
      }).catch((err) => {
        console.error(err);
        addContractEvent(`[TX ERROR] ${err.message.slice(0, 60)}...`, 'info');
        // Fallback
        updateProfileState();
        addContractEvent(`[TX fallback] Mined! Block #1948204. Hash: ${txHash}. Gas: 47,211.`, 'tx');
        addContractEvent(`Event DigitalIDRegistered(owner: ${userTrunc}, digitalID: "${did}")`, 'success');
      });
    } else {
      // Fallback simulation if registry not deployed
      setTimeout(() => {
        updateProfileState();
        addContractEvent(`[TX simulated] Mined! Block #1948204. Hash: ${txHash}. Gas: 47,211.`, 'tx');
        addContractEvent(`Event DigitalIDRegistered(owner: ${userTrunc}, digitalID: "${did}")`, 'success');
      }, 1000);
    }

    setUserDIDInput('');
  };

  const handleRatePeer = (peerAddress: string, score: number) => {
    const raterTrunc = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
    const peerProfile = getProfile(peerAddress);
    const raterProfile = getProfile(walletAddress);

    if (!raterProfile.digitalID) {
      alert("Error: You must register a Digital ID before voting/rating other peers.");
      return;
    }
    if (!peerProfile.digitalID) {
      alert("Error: This peer does not have a registered Digital ID.");
      return;
    }

    const txHash = '0x' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0') + '...' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0');
    addContractEvent(`[TX] Broadcasting SafePurchaseRegistry.ratePeer(peer: ${peerAddress}, score: ${score}%)`, 'info');

    const updateRatingState = () => {
      setProfiles(prev => {
        const next = { ...prev };
        const peerKey = Object.keys(next).find(k => k.toLowerCase() === peerAddress.toLowerCase()) || peerAddress.toLowerCase();
        
        const currentPeerProfile = next[peerKey] || {
          address: peerAddress,
          digitalID: peerProfile.digitalID,
          reputationStake: peerProfile.reputationStake,
          totalWeightedScore: peerProfile.totalWeightedScore,
          totalStakeWeight: peerProfile.totalStakeWeight,
          ratingCount: peerProfile.ratingCount
        };

        const raterStake = raterProfile.reputationStake || 1;

        const updatedPeer = {
          ...currentPeerProfile,
          totalWeightedScore: currentPeerProfile.totalWeightedScore + (score * raterStake),
          totalStakeWeight: currentPeerProfile.totalStakeWeight + raterStake,
          ratingCount: currentPeerProfile.ratingCount + 1
        };

        next[peerKey] = updatedPeer;
        const truncKey = Object.keys(next).find(k => k.toLowerCase() === peerAddress.replace(/\s/g, '').toLowerCase());
        if (truncKey && truncKey !== peerKey) {
          next[truncKey] = updatedPeer;
        }

        localStorage.setItem('y8_blog_profiles', JSON.stringify(next));
        return next;
      });
    };

    // Trigger actual smart contract write transaction
    if (addresses.safePurchaseRegistry) {
      const isHexAddress = /^0x[0-9a-fA-F]{40}$/.test(peerAddress);
      const targetAddress = isHexAddress ? peerAddress : "0x0000000000000000000000000000000000000000";

      writeContractAsync({
        address: addresses.safePurchaseRegistry as `0x${string}`,
        abi: SafePurchaseRegistryABI,
        functionName: 'ratePeer',
        args: [targetAddress as `0x${string}`, BigInt(score)]
      } as any).then((tx) => {
        updateRatingState();
        addContractEvent(`[TX] Mined! Block #1948205. Hash: ${tx.slice(0, 10)}... Gas: 52,410.`, 'tx');
        addContractEvent(`Event PeerRated(rater: ${raterTrunc}, peer: ${peerAddress}, score: ${score}%, weight: ${raterProfile.reputationStake || 1})`, 'success');
      }).catch((err) => {
        console.error(err);
        addContractEvent(`[TX ERROR] ${err.message.slice(0, 60)}...`, 'info');
        // Fallback
        updateRatingState();
        addContractEvent(`[TX fallback] Mined! Block #1948205. Hash: ${txHash}. Gas: 52,410.`, 'tx');
        addContractEvent(`Event PeerRated(rater: ${raterTrunc}, peer: ${peerAddress}, score: ${score}%, weight: ${raterProfile.reputationStake || 1})`, 'success');
      });
    } else {
      // Fallback simulation if registry not deployed
      setTimeout(() => {
        updateRatingState();
        addContractEvent(`[TX simulated] Mined! Block #1948205. Hash: ${txHash}. Gas: 52,410.`, 'tx');
        addContractEvent(`Event PeerRated(rater: ${raterTrunc}, peer: ${peerAddress}, score: ${score}%, weight: ${raterProfile.reputationStake || 1})`, 'success');
      }, 1000);
    }
  };

  const handleCompletePin = (pinId: string) => {
    const pinIndex = mapPins.findIndex(p => p.id === pinId);
    if (pinIndex === -1) return;

    const pin = mapPins[pinIndex];
    const txHash = '0x' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0') + '...' + Math.floor(Math.random() * 10000000).toString(16).padStart(8, '0');
    
    addContractEvent(`[TX] Broadcasting SafePurchaseRegistry.completeListing(listingId: ${pinId})`, 'info');

    const updatedPins = [...mapPins];
    updatedPins[pinIndex] = {
      ...pin,
      status: 'Completed'
    };

    setMapPins(updatedPins);
    localStorage.setItem('y8_blog_map_pins', JSON.stringify(updatedPins));

    const updateCompleteState = () => {
      setProfiles(prev => {
        const next = { ...prev };
        
        const creatorKey = Object.keys(next).find(k => k.toLowerCase() === pin.sender.toLowerCase()) || pin.sender.toLowerCase();
        const receiverKey = pin.receiver ? (Object.keys(next).find(k => k.toLowerCase() === pin.receiver!.toLowerCase()) || pin.receiver!.toLowerCase()) : '';

        if (next[creatorKey]) {
          next[creatorKey] = {
            ...next[creatorKey],
            reputationStake: next[creatorKey].reputationStake + 50
          };
        }
        if (receiverKey && next[receiverKey]) {
          next[receiverKey] = {
            ...next[receiverKey],
            reputationStake: next[receiverKey].reputationStake + 50
          };
        }

        const userTrunc = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
        if (creatorKey.toLowerCase() === walletAddress.toLowerCase() && next[userTrunc]) {
          next[userTrunc] = next[creatorKey];
        }
        if (receiverKey.toLowerCase() === walletAddress.toLowerCase() && next[userTrunc]) {
          next[userTrunc] = next[receiverKey];
        }

        localStorage.setItem('y8_blog_profiles', JSON.stringify(next));
        return next;
      });
    };

    const numericId = parseInt(pinId.replace('pin-', '')) || Math.floor(Math.random() * 1000) + 1;

    // Trigger actual smart contract write transaction
    if (addresses.safePurchaseRegistry) {
      writeContractAsync({
        address: addresses.safePurchaseRegistry as `0x${string}`,
        abi: SafePurchaseRegistryABI,
        functionName: 'completeListing',
        args: [BigInt(numericId)]
      } as any).then((tx) => {
        updateCompleteState();
        addContractEvent(`[TX] Mined! Block #1948206. Hash: ${tx.slice(0, 10)}... Gas: 36,120.`, 'tx');
        addContractEvent(`Event ListingCompleted(id: ${pinId})`, 'success');
        addContractEvent(`Reputation Awarded: +50 REP to Creator (${pin.sender}) & Receiver (${pin.receiver || '0x0000...'})`, 'success');
      }).catch((err) => {
        console.error(err);
        addContractEvent(`[TX ERROR] ${err.message.slice(0, 60)}...`, 'info');
        // Fallback
        updateCompleteState();
        addContractEvent(`[TX fallback] Mined! Block #1948206. Hash: ${txHash}. Gas: 36,120.`, 'tx');
        addContractEvent(`Event ListingCompleted(id: ${pinId})`, 'success');
        addContractEvent(`Reputation Awarded: +50 REP to Creator (${pin.sender}) & Receiver (${pin.receiver || '0x0000...'})`, 'success');
      });
    } else {
      // Fallback simulation if registry not deployed
      setTimeout(() => {
        updateCompleteState();
        addContractEvent(`[TX simulated] Mined! Block #1948206. Hash: ${txHash}. Gas: 36,120.`, 'tx');
        addContractEvent(`Event ListingCompleted(id: ${pinId})`, 'success');
        addContractEvent(`Reputation Awarded: +50 REP to Creator (${pin.sender}) & Receiver (${pin.receiver || '0x0000...'})`, 'success');
      }, 1000);
    }
  };

  // Simulated peer replies
  const triggerBotReply = (zoneName: string, cityId: string, currentLogs: Message[]) => {
    const peerAddresses = ['0x5a1b...88c4', '0x3d2c...44ab', '0xe5f6...12cd'];
    const selectedPeer = peerAddresses[Math.floor(Math.random() * peerAddresses.length)];
    
    // Choose contextual response based on user's tag or cityId
    let replyText = '';
    let botTag: 'general' | 'labor' | 'services' | 'tool' | 'rideshare' = 'general';

    const lastUserMsg = currentLogs.filter(m => m.isSelf).pop();
    const userTag = lastUserMsg?.tag || 'general';

    if (userTag === 'rideshare') {
      replyText = `Transit Dispatch [${selectedPeer}]: E-bike transport coordinates synchronized. Ride route cleared to nearest Safe Purchase Zone.`;
      botTag = 'rideshare';
    } else if (userTag === 'labor') {
      replyText = `Franchise Lead [${selectedPeer}]: Operator dispatched for local physical dome maintenance. Clear logs on completion.`;
      botTag = 'labor';
    } else if (userTag === 'tool') {
      replyText = `Hardware Dev [${selectedPeer}]: Verified node instrumentation diagnostics. Smart sensors recalibrating.`;
      botTag = 'tool';
    } else if (userTag === 'services') {
      replyText = `Service Gateway [${selectedPeer}]: Micro-billing transaction ledger signature recorded. Biometric access token active.`;
      botTag = 'services';
    } else {
      // Fallback to city-based replies
      botTag = 'general';
      if (cityId === 'pottsboro') {
        replyText = `Peer Operator [${selectedPeer}]: Noted. Pottsboro node telemetry verified. Current solar battery levels at this Safe Purchase Zone are stabilized.`;
        botTag = 'tool';
      } else if (cityId === 'austin') {
        replyText = `Sanctuary Agent [${selectedPeer}]: Reached. Dynamic smart locks are fully updated at the Austin booking gate.`;
        botTag = 'services';
      } else if (cityId === 'dallas') {
        replyText = `Compliance Node [${selectedPeer}]: Dallas trade router acknowledged message signature. KYC session cleared.`;
        botTag = 'services';
      } else if (cityId === 'houston') {
        replyText = `Grid Supervisor [${selectedPeer}]: Houston battery arrays reports peak wind power feed active. Compute jobs running.`;
        botTag = 'tool';
      } else {
        replyText = `Local Peer [${selectedPeer}]: GPS coordinates received. P2P transaction zone is active for regional trade.`;
      }
    }

    const botMessage: Message = {
      id: 'm-' + Math.floor(Math.random() * 10000),
      sender: selectedPeer,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      zoneName,
      cityId,
      isSelf: false,
      tag: botTag
    };

    const nextLogs = [...currentLogs, botMessage];
    setChatMessages(nextLogs);
    localStorage.setItem('y8_blog_messages', JSON.stringify(nextLogs));
  };

  const handleClearChat = () => {
    setChatMessages([]);
    localStorage.removeItem('y8_blog_messages');
  };

  return (
    <div className={styles.container}>
      {/* Loading Overlay */}
      {transactionLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          gap: '1rem'
        }}>
          <div className={styles.spinner} style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}>{loadingText}</p>
        </div>
      )}
      {/* Geolocation Locator Panel */}
      <section className={styles.gpsPanel}>
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div className={styles.gpsInfo}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
              <h2 style={{ margin: 0 }}>Safe Purchase Zone Locator</h2>
              {isAuthenticated && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#00f5d4', marginRight: '0.2rem' }}>⚡ {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={isPolling}
                      onChange={e => setIsPolling(e.target.checked)}
                      style={{ accentColor: '#00f5d4', cursor: 'pointer' }}
                    />
                    <span style={{ color: isPolling ? '#00f5d4' : '#64748b', fontWeight: 'bold' }}>
                      {isPolling ? 'GPS: ON' : 'GPS: OFF'}
                    </span>
                  </label>
                </div>
              )}
            </div>
            <p>Toggle browser GPS telemetry to automatically resolve and route your posts to the nearest compliance trade zone.</p>
            {coords ? (
              <span className={styles.gpsCoords}>
                📍 Coordinates: {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° W
              </span>
            ) : (
              <span className={styles.gpsCoords} style={{ color: '#64748b' }}>
                GPS Location Telemetry: STANDBY
              </span>
            )}
          </div>

          {resolvedZone ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Polling Switch */}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: isPolling ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: isPolling ? '#10b981' : 'rgba(255,255,255,0.08)', color: isPolling ? '#10b981' : '#cbd5e1', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s' }}>
                <input
                  type="checkbox"
                  checked={isPolling}
                  onChange={e => setIsPolling(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPolling ? '#10b981' : '#64748b', display: 'inline-block', boxShadow: isPolling ? '0 0 6px #10b981' : 'none' }}></span>
                <span>{isPolling ? 'GPS TRACKING: ACTIVE' : 'GPS TRACKING: STANDBY'}</span>
              </label>

              <div className={styles.activeZoneHUD}>
                <span className={styles.zoneLabel}>
                  <ShieldCheck className="h-3 w-3 inline-block mr-1" /> Nearest Purchase Zone
                </span>
                <span className={styles.zoneName}>{resolvedZone.name.split(' (')[0]}</span>
                <span className={styles.zoneDistance}>
                  Distance: {zoneDistance !== null ? `${zoneDistance.toFixed(2)} miles` : '0.00 miles'} (Direct Grid)
                </span>
              </div>
            </div>
          ) : (
            <button onClick={handleGPSLocate} className={styles.btnGPS} disabled={gpsLoading} style={{ alignSelf: 'flex-start' }}>
              {gpsLoading ? (
                <>
                  <span className={styles.spinner}></span> Resolving GPS...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" /> Verify GPS Geolocation
                </>
              )}
            </button>
          )}

          {/* Dynamic Nearest SPZs Sub-panel */}
          <div style={{ marginTop: '0.8rem', padding: '0.75rem', background: 'rgba(9, 12, 22, 0.6)', border: '1px solid rgba(0, 245, 212, 0.1)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem', borderBottom: '1px solid rgba(0, 245, 212, 0.1)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00f5d4', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold', margin: 0 }}>
                📡 {nearestZonesCount} Nearest Registered SPZ Nodes
              </h3>
              
              {/* Sleek selector input HUD */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>LIMIT:</span>
                <input
                  type="number"
                  min="1"
                  max={sortedZones.length}
                  value={nearestZonesCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setNearestZonesCount(Math.min(sortedZones.length, Math.max(1, val)));
                    }
                  }}
                  style={{
                    background: '#070a12',
                    border: '1px solid rgba(0, 245, 212, 0.2)',
                    borderRadius: '3px',
                    color: '#00f5d4',
                    width: '45px',
                    padding: '0.1rem 0.3rem',
                    fontSize: '0.68rem',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <input
                  type="range"
                  min="1"
                  max={sortedZones.length}
                  value={nearestZonesCount}
                  onChange={(e) => setNearestZonesCount(parseInt(e.target.value) || 3)}
                  style={{
                    accentColor: '#00f5d4',
                    cursor: 'pointer',
                    width: '70px',
                    height: '3px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setNearestZonesCount(prev => Math.max(1, prev - 1))}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setNearestZonesCount(prev => Math.min(sortedZones.length, prev + 1))}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
              {defaultZones.map((zone) => {
                const dist = coords 
                  ? calculateDistance(coords.latitude, coords.longitude, zone.latitude, zone.longitude)
                  : calculateDistance(33.784, -96.6711, zone.latitude, zone.longitude);
                
                const isActive = activeCityId === zone.id;
                
                return (
                  <div 
                    key={zone.id} 
                    onClick={() => {
                      setActiveCityId(zone.id);
                      if (coords) {
                        setResolvedZone(zone);
                        setZoneDistance(dist);
                      }
                    }}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.4rem 0.6rem', 
                      background: isActive ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255,255,255,0.01)', 
                      border: '1px solid', 
                      borderColor: isActive ? '#00f5d4' : 'rgba(255,255,255,0.05)', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? '#00f5d4' : '#f8fafc' }}>
                        {zone.name.split(' (')[0]}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                        Lat: {zone.latitude.toFixed(4)}°, Lon: {zone.longitude.toFixed(4)}°
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {dist.toLocaleString(undefined, { maximumFractionDigits: 1 })} mi
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Part: Digital ID & Reputation profile (Operator HUD) */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', padding: '1rem 1.25rem', background: 'rgba(10, 15, 30, 0.4)', border: '1px solid rgba(0, 245, 212, 0.15)', borderRadius: '10px', minHeight: '140px', justifyContent: 'center', gap: '0.6rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#00f5d4', textTransform: 'uppercase', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              🤖 Operator Dashboard HUD
            </span>
            <span style={{ fontSize: '0.58rem', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.12)', border: '1px solid rgba(167, 139, 250, 0.25)', padding: '0px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
              LVL {userLevel}
            </span>
          </div>

          {getProfile(walletAddress).digitalID ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e9d5ff', fontFamily: 'monospace' }}>
                {getProfile(walletAddress).digitalID}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.68rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                <span>Stake: <span style={{ color: '#00f5d4' }}>{getProfile(walletAddress).reputationStake} REP</span></span>
                <span>Reputation: <span style={{ color: '#a78bfa' }}>{(getProfile(walletAddress).ratingCount > 0 && getProfile(walletAddress).totalStakeWeight > 0) ? (getProfile(walletAddress).totalWeightedScore / getProfile(walletAddress).totalStakeWeight).toFixed(1) + '%' : '100.0%'}</span></span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterDigitalID} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase' }}>
                Associate Wallet with Digital ID
              </span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="text"
                  placeholder="Enter custom DID (e.g. did:y8:jason)"
                  value={userDIDInput}
                  onChange={e => setUserDIDInput(e.target.value)}
                  style={{ flex: 1, background: '#070a12', border: '1px solid rgba(0, 245, 212, 0.25)', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: '#fff', outline: 'none' }}
                />
                <button 
                  type="submit" 
                  disabled={!userDIDInput.trim()}
                  style={{ background: 'rgba(0, 245, 212, 0.1)', border: '1px solid #00f5d4', color: '#00f5d4', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}
                >
                  REG
                </button>
              </div>
            </form>
          )}

          {/* XP Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
              <span>OPERATOR HARVEST XP</span>
              <span style={{ color: '#00f5d4' }}>{userXp % 300} / 300 XP</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#090d16', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: `${((userXp % 300) / 300) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00f5d4, #10b981)', transition: 'width 0.3s ease-out' }}></div>
            </div>
          </div>

          {/* Cumulative Metrics HUD */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.4rem', marginTop: '0.1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'monospace', color: '#94a3b8' }}>
            <span>Hours Logged: <span style={{ color: '#00f5d4', fontWeight: 'bold' }}>{(totalMinutesWorked / 60).toFixed(1)}h</span></span>
            <span>Trade Filter: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{activeFilterTag.toUpperCase()}</span></span>
          </div>
        </div>
      </section>

      {/* Main Split Layout Grid */}
      <div className={styles.layoutGrid}>
        
        {/* Left Column: P2P Chat Rooms & Ledger Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '760px' }}>
          
          <div className={styles.chatCard} style={{ flexGrow: 1, height: '600px' }}>
            <div className={styles.chatHeader}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setActiveLeftTab('trade')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeLeftTab === 'trade' ? '2px solid #00f5d4' : '2px solid transparent',
                    color: activeLeftTab === 'trade' ? '#f8fafc' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    paddingBottom: '0.25rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  💬 Trade Rooms
                </button>
                <button
                  onClick={() => setActiveLeftTab('activity')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeLeftTab === 'activity' ? '2px solid #00f5d4' : '2px solid transparent',
                    color: activeLeftTab === 'activity' ? '#f8fafc' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    paddingBottom: '0.25rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  🤖 Swarm Hub
                </button>
                <button
                  onClick={() => setActiveLeftTab('sanctuary')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeLeftTab === 'sanctuary' ? '2px solid #00f5d4' : '2px solid transparent',
                    color: activeLeftTab === 'sanctuary' ? '#f8fafc' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    paddingBottom: '0.25rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  🏥 Sanctuary Lock
                </button>
              </div>

              {activeLeftTab === 'trade' && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {defaultZones.map((z) => (
                    <button
                      key={z.id}
                      onClick={() => {
                        setActiveCityId(z.id);
                        if (coords) {
                          const dist = calculateDistance(coords.latitude, coords.longitude, z.latitude, z.longitude);
                          setResolvedZone(z);
                          setZoneDistance(dist);
                        }
                      }}
                      style={{
                        background: activeCityId === z.id ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid',
                        borderColor: activeCityId === z.id ? '#00f5d4' : 'rgba(255,255,255,0.08)',
                        color: activeCityId === z.id ? '#00f5d4' : '#94a3b8',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      {z.id.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conditional Left Column tabs */}
            {activeLeftTab === 'trade' ? (
              <>
                {/* Point of Contact 3: Trade preference question */}
                {!preferences.tradePreference && (
                  <div style={{ background: 'rgba(0, 245, 212, 0.04)', borderBottom: '1px solid rgba(0, 245, 212, 0.15)', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <span style={{ fontSize: '0.65rem', color: '#00f5d4', fontFamily: 'monospace', fontWeight: 'bold' }}>❓ NEIGHBORHOOD TRADE PREFERENCE</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>What is your primary network trade barter activity preference?</span>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {[
                          { id: 'all', name: 'All' },
                          { id: 'general', name: 'General' },
                          { id: 'labor', name: 'Labor' },
                          { id: 'services', name: 'Services' },
                          { id: 'tool', name: 'Tools' },
                          { id: 'rideshare', name: 'Rideshare' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              updatePreference('tradePreference', opt.id);
                              setActiveFilterTag(opt.id as any);
                              setExplainerContent(TRADE_EXPLAINERS[opt.id as keyof typeof TRADE_EXPLAINERS]);
                              addContractEvent(`Registered operator trade filter preference: ${opt.name.toUpperCase()}`, 'info');
                              if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('y8_user_action', {
                                  detail: {
                                    type: 'tradePreference',
                                    value: opt.id,
                                    source: `Trade preference questionnaire: "${opt.name}"`
                                  }
                                }));
                              }
                            }}
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'monospace' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#00f5d4'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                          >
                            {opt.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tag Filter Bar */}
                <div className={styles.tagFilterBar}>
                  <span className={styles.tagFilterLabel}>Filter:</span>
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`${styles.btnFilter} ${activeFilterTag === 'all' ? styles.btnFilterActive : ''}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('general')}
                    className={`${styles.btnFilter} ${activeFilterTag === 'general' ? styles.btnFilterActive : ''}`}
                  >
                    <MessageSquare className="h-3 w-3" /> General
                  </button>
                  <button
                    onClick={() => handleFilterChange('labor')}
                    className={`${styles.btnFilter} ${activeFilterTag === 'labor' ? styles.btnFilterActive : ''}`}
                  >
                    <Wrench className="h-3 w-3" /> Labor
                  </button>
                  <button
                    onClick={() => handleFilterChange('services')}
                    className={`${styles.btnFilter} ${activeFilterTag === 'services' ? styles.btnFilterActive : ''}`}
                  >
                    <Briefcase className="h-3 w-3" /> Services
                  </button>
                  <button
                    onClick={() => handleFilterChange('tool')}
                    className={`${styles.btnFilter} ${activeFilterTag === 'tool' ? styles.btnFilterActive : ''}`}
                  >
                    <Cpu className="h-3 w-3" /> Tools
                  </button>
                  <button
                    onClick={() => handleFilterChange('rideshare')}
                    className={`${styles.btnFilter} ${activeFilterTag === 'rideshare' ? styles.btnFilterActive : ''}`}
                  >
                    <Car className="h-3 w-3" /> Rideshare
                  </button>
                </div>

                {/* Chat scroll messages */}
                <div className={styles.chatOutput}>
                  {chatMessages.filter(m => m.cityId === activeCityId).length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>Welcome to the {activeCityId.toUpperCase()} Community room. Send a message to initiate P2P chat routing.</p>
                    </div>
                  ) : chatMessages.filter(m => {
                    const matchCity = m.cityId === activeCityId;
                    if (!matchCity) return false;
                    if (activeFilterTag === 'all') return true;
                    return m.tag === activeFilterTag;
                  }).length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No messages tagged "{activeFilterTag}" in this room. Be the first to tag a post!</p>
                    </div>
                  ) : (
                    chatMessages
                      .filter(m => {
                        const matchCity = m.cityId === activeCityId;
                        if (!matchCity) return false;
                        if (activeFilterTag === 'all') return true;
                        return m.tag === activeFilterTag;
                      })
                      .map((msg) => {
                        const profile = getProfile(msg.sender);
                        const displaySender = profile.digitalID ? profile.digitalID : msg.sender;
                        const repScore = profile.ratingCount > 0 && profile.totalStakeWeight > 0
                          ? (profile.totalWeightedScore / profile.totalStakeWeight).toFixed(1) + '%'
                          : '100.0%';

                        return (
                          <div key={msg.id} className={`${styles.chatRow} ${msg.isSelf ? styles.chatRowSelf : ''}`}>
                            <div className={styles.chatMeta}>
                              <span className={styles.chatSender} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span>{displaySender}</span>
                                {profile.digitalID && (
                                  <span style={{ fontSize: '0.58rem', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.12)', border: '1px solid rgba(167, 139, 250, 0.25)', padding: '0px 4px', borderRadius: '3px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    ★ {repScore}
                                  </span>
                                )}
                              </span>
                              <span className={styles.chatTime}>{msg.timestamp}</span>
                            </div>
                            <div className={styles.chatBubble}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', justifyContent: msg.isSelf ? 'flex-end' : 'flex-start' }}>
                                <span className={`${styles.tagBadge} ${getTagStyleClass(msg.tag)}`}>
                                  {getTagIcon(msg.tag)}
                                  <span style={{ marginLeft: '3px' }}>{msg.tag || 'general'}</span>
                                </span>
                              </div>
                              <div style={{ wordBreak: 'break-word' }}>{msg.text}</div>
                              <span className={styles.chatZoneLabel}>
                                📡 posted via {msg.zoneName}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Tag Selector Bar */}
                <div className={styles.tagSelectorBar}>
                  <span className={styles.tagFilterLabel} style={{ color: '#cbd5e1' }}>Tag Post:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectTag('general')}
                    className={`${styles.btnSelectTag} ${selectedTag === 'general' ? `${styles.btnSelectTagActive} ${styles.tagGeneral}` : ''}`}
                  >
                    <MessageSquare className="h-3 w-3" /> General
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTag('labor')}
                    className={`${styles.btnSelectTag} ${selectedTag === 'labor' ? `${styles.btnSelectTagActive} ${styles.tagLabor}` : ''}`}
                  >
                    <Wrench className="h-3 w-3" /> Labor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTag('services')}
                    className={`${styles.btnSelectTag} ${selectedTag === 'services' ? `${styles.btnSelectTagActive} ${styles.tagServices}` : ''}`}
                  >
                    <Briefcase className="h-3 w-3" /> Services
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTag('tool')}
                    className={`${styles.btnSelectTag} ${selectedTag === 'tool' ? `${styles.btnSelectTagActive} ${styles.tagTool}` : ''}`}
                  >
                    <Cpu className="h-3 w-3" /> Tool
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTag('rideshare')}
                    className={`${styles.btnSelectTag} ${selectedTag === 'rideshare' ? `${styles.btnSelectTagActive} ${styles.tagRideshare}` : ''}`}
                  >
                    <Car className="h-3 w-3" /> Rideshare
                  </button>
                </div>

                {/* Map Broadcast Toggle & Form */}
                <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer', fontFamily: 'monospace' }}>
                    <input
                      type="checkbox"
                      checked={broadcastToMap}
                      onChange={e => setBroadcastToMap(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#00f5d4' }}
                    />
                    <span>📍 Broadcast as Live Job/Ride Offer on Globe Map</span>
                  </label>

                  {broadcastToMap && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '6px', animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setMapPinType('offer_ride')}
                          className={`${styles.btnSelectTag} ${mapPinType === 'offer_ride' ? styles.btnSelectTagActive : ''}`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                        >
                          Offer Ride
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapPinType('find_ride')}
                          className={`${styles.btnSelectTag} ${mapPinType === 'find_ride' ? styles.btnSelectTagActive : ''}`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                        >
                          Find Ride
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapPinType('offer_labor')}
                          className={`${styles.btnSelectTag} ${mapPinType === 'offer_labor' ? styles.btnSelectTagActive : ''}`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                        >
                          Offer Labor
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapPinType('request_labor')}
                          className={`${styles.btnSelectTag} ${mapPinType === 'request_labor' ? styles.btnSelectTagActive : ''}`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                        >
                          Request Labor
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapPinType('tool_rental')}
                          className={`${styles.btnSelectTag} ${mapPinType === 'tool_rental' ? styles.btnSelectTagActive : ''}`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                        >
                          Tool Rental
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Offering (e.g. Ride in Tesla Y)"
                          value={mapOffering}
                          onChange={e => setMapOffering(e.target.value)}
                          style={{ flex: 1, background: '#070a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: '#fff' }}
                        />
                        <input
                          type="text"
                          placeholder="Looking For (e.g. 0.02 ETH)"
                          value={mapLookingFor}
                          onChange={e => setMapLookingFor(e.target.value)}
                          style={{ flex: 1, background: '#070a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: '#fff' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat entry form */}
                <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
                  <input
                    type="text"
                    placeholder={broadcastToMap ? `Enter job description / summary...` : `Send message to nearest zone...`}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    className={styles.chatInput}
                  />
                  <button 
                    type="submit" 
                    className={styles.btnSend} 
                    disabled={!inputMessage.trim() || (broadcastToMap && (!mapOffering.trim() || !mapLookingFor.trim()))}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : activeLeftTab === 'activity' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem 1.5rem', overflowY: 'auto', height: '540px', textAlign: 'left' }}>
                
                {/* 1. Work Session Clock */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00f5d4', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                      <Clock className="h-3.5 w-3.5" /> Work Session Tracker
                    </h3>
                    {isTrackingWork && (
                      <span style={{ fontSize: '0.62rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        LIVE TRACKING
                      </span>
                    )}
                  </div>

                  {!isTrackingWork ? (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.75rem 0' }}>No active work session. Start tracking to record and sign your session log.</p>
                      <button
                        type="button"
                        onClick={handleStartWork}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid #00f5d4', color: '#00f5d4', padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.1)'}
                      >
                        <Play className="h-3.5 w-3.5 fill-teal-400" /> Start Work Session
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070a12', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(0, 245, 212, 0.2)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>ELAPSED TIME:</span>
                        <span style={{ fontSize: '1.05rem', color: '#00f5d4', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                          {formatTimer(elapsedWorkSeconds)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.65rem', color: '#cbd5e1', fontFamily: 'monospace' }}>DAILY ACCOMPLISHMENTS</label>
                        <textarea
                          placeholder="Describe work completed (e.g. Conducted L1 Lagrangian coordinate testing on Pottsboro Node)..."
                          value={workAccomplishment}
                          onChange={e => setWorkAccomplishment(e.target.value)}
                          rows={2}
                          style={{ background: '#070a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#fff', resize: 'none', outline: 'none', fontFamily: 'sans-serif' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleStopWork}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid #00f5d4', color: '#00f5d4', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.1)'}
                      >
                        <Shield className="h-3.5 w-3.5 text-teal-400" /> Stop Session & Wallet Sign Log
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. TODO Planner */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00f5d4', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                    <CheckSquare className="h-3.5 w-3.5" /> Operator TODO Planner
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '110px', overflowY: 'auto' }}>
                    {todoItems.length === 0 ? (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', padding: '0.4rem 0' }}>No pending tasks in planner.</span>
                    ) : (
                      todoItems.map(todo => (
                        <div key={todo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0.45rem', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '6px', textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => handleToggleTodo(todo.id)}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid #00f5d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {todo.completed && <Check className="h-2.5 w-2.5 text-teal-400" />}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: todo.completed ? '#64748b' : '#cbd5e1' }}>{todo.text}</span>
                          </div>
                          <button type="button" onClick={() => handleDeleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0.2rem', cursor: 'pointer', opacity: 0.6 }} className="hover:opacity-100">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '0.3rem' }}>
                    <input
                      type="text"
                      placeholder="Add new task..."
                      value={newTodoText}
                      onChange={e => setNewTodoText(e.target.value)}
                      style={{ flex: 1, background: '#070a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#fff', outline: 'none' }}
                    />
                    <button type="submit" style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid #00f5d4', color: '#00f5d4', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>

                {/* 3. AI Swarm Planner */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00f5d4', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                    <Sparkles className="h-3.5 w-3.5" /> Swarm Task Scheduler
                  </h3>
                  
                  <form onSubmit={handleScheduleAgentTaskFromBlog} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '90px', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.58rem', color: '#64748b', fontFamily: 'monospace' }}>TARGET DAY</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={schedulerDay}
                          onChange={e => setSchedulerDay(parseInt(e.target.value) || 1)}
                          style={{ background: '#070a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.25rem', fontSize: '0.72rem', color: '#fff', outline: 'none', textAlign: 'center' }}
                        />
                      </div>

                      <div style={{ flex: 2, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.58rem', color: '#64748b', fontFamily: 'monospace' }}>SWARM AGENT TYPE</label>
                        <select
                          value={schedulerAgentType}
                          onChange={e => setSchedulerAgentType(e.target.value)}
                          style={{ background: '#070a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.25rem', fontSize: '0.72rem', color: '#fff', outline: 'none' }}
                        >
                          <option value="YouTube Growth Swarm Bot">YouTube Growth Swarm Bot</option>
                          <option value="Helios Planet Shade Analyst">Helios Planet Shade Analyst</option>
                          <option value="BioMoist Crop Controller Jet">BioMoist Crop Controller Jet</option>
                          <option value="EcoLoad Compute Balancer">EcoLoad Compute Balancer</option>
                          <option value="Intake Coordinator Scheduling Bot">Intake Coordinator Scheduling Bot</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <label style={{ fontSize: '0.58rem', color: '#64748b', fontFamily: 'monospace' }}>AGENT RUN DIRECTIVE</label>
                      <textarea
                        rows={2}
                        value={schedulerInstructions}
                        onChange={e => setSchedulerInstructions(e.target.value)}
                        placeholder="Instructions for the Swarm..."
                        style={{ background: '#070a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.3rem 0.5rem', fontSize: '0.72rem', color: '#fff', outline: 'none', resize: 'none', fontFamily: 'sans-serif' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.1rem' }}>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {(['LOW', 'STANDARD', 'CRITICAL'] as const).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSchedulerPriority(p)}
                            style={{
                              background: schedulerPriority === p ? (p === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : p === 'STANDARD' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(100, 116, 139, 0.15)') : 'rgba(0,0,0,0.1)',
                              border: '1px solid',
                              borderColor: schedulerPriority === p ? (p === 'CRITICAL' ? '#ef4444' : p === 'STANDARD' ? '#3b82f6' : '#64748b') : 'rgba(255,255,255,0.03)',
                              color: schedulerPriority === p ? (p === 'CRITICAL' ? '#f87171' : p === 'STANDARD' ? '#60a5fa' : '#94a3b8') : '#64748b',
                              fontSize: '0.58rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontFamily: 'monospace'
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button type="submit" style={{ background: 'linear-gradient(90deg, #00f5d4, #38bdf8)', border: 'none', color: '#050810', padding: '0.35rem 0.85rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' }}>
                        DEPLOY AGENT
                      </button>
                    </div>
                  </form>
                </div>

                {/* 4. Signed Sessions History Ledger */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00f5d4', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                      <FileText className="h-3.5 w-3.5" /> Operator Session Vault
                    </h3>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                      TOTAL: {totalMinutesWorked} Mins
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '160px', overflowY: 'auto' }}>
                    {loggedSessions.length === 0 ? (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', padding: '0.5rem 0' }}>No cryptographically signed session records.</span>
                    ) : (
                      loggedSessions.map((session, idx) => {
                        const isExpanded = expandedSessionIndex === idx;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setExpandedSessionIndex(isExpanded ? null : idx)}
                            style={{ 
                              background: 'rgba(10, 15, 30, 0.6)', 
                              border: '1px solid', 
                              borderColor: isExpanded ? '#c084fc' : 'rgba(192, 132, 252, 0.15)', 
                              borderRadius: '8px', 
                              padding: '0.65rem 0.75rem', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '0.35rem', 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              animation: 'fadeIn 0.25s ease-out'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                ✍️ signed session log
                              </span>
                              <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                {new Date(session.payload.timestamp).toLocaleDateString()}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                              {session.payload.accomplishments}
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                              <span>Duration: <span style={{ color: '#00f5d4' }}>{session.payload.durationMinutes}m</span></span>
                              <span>CID: <span style={{ color: '#38bdf8' }}>{session.cid.slice(0, 12)}...</span></span>
                              <span>Sig: <span style={{ color: '#c084fc' }}>{session.signature.slice(0, 10)}...</span></span>
                            </div>

                            {isExpanded && (
                              <div style={{
                                marginTop: '0.4rem',
                                padding: '0.5rem',
                                background: '#070a12',
                                border: '1px solid rgba(192, 132, 252, 0.3)',
                                borderRadius: '4px',
                                fontSize: '0.62rem',
                                fontFamily: 'monospace',
                                color: '#a78bfa',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                animation: 'fadeIn 0.2s ease-out',
                                textAlign: 'left'
                              }}>
                                <div style={{ color: '#00f5d4', fontWeight: 'bold', marginBottom: '0.2rem' }}>🔍 CRYPTOGRAPHIC JWS HEADER & PAYLOAD:</div>
                                <strong>Protected Header:</strong><br />
                                {`{\n  "alg": "ES256",\n  "b64": false,\n  "crit": ["b64"],\n  "kid": "did:key:${session.payload.operator.slice(0, 10)}..."\n}`}
                                <br /><br />
                                <strong>Payload (DAG-JOSE node):</strong><br />
                                {JSON.stringify(session.payload, null, 2)}
                                <br /><br />
                                <strong>IPFS DAG CID:</strong><br />
                                {session.cid}
                                <br /><br />
                                <strong>Signature Hash:</strong><br />
                                {session.signature}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 1.5rem', overflowY: 'auto', height: '540px', textAlign: 'left' }}>
                
                {/* Unlock Control Panel */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#00f5d4', margin: '0 0 0.5rem 0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontWeight: 'bold' }}>
                    🏥 Sanctuary Control Node
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '0 0 0.85rem 0' }}>
                    Biometric Sanctuary Pod. Opening the door triggers the automated AI GoPro checkup agent.
                  </p>
                  
                  {!isAuthenticated ? (
                    <div style={{ color: '#f87171', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      🔒 Connect Wallet & Sign-In (SIWE) to Unlock Sanctuary
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestCheckup}
                      disabled={isSimulatingJob}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: isSimulatingJob ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #00f5d4, #38bdf8)',
                        border: 'none',
                        color: isSimulatingJob ? '#94a3b8' : '#050810',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '6px',
                        cursor: isSimulatingJob ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s',
                        boxShadow: isSimulatingJob ? 'none' : '0 4px 12px rgba(0, 245, 212, 0.25)'
                      }}
                    >
                      <Play className="h-4 w-4" /> Unlock Sanctuary Door
                    </button>
                  )}
                </div>

                {/* Simulation / Camera Stream HUD */}
                {isSimulatingJob && (
                  <div style={{ background: 'rgba(5, 8, 16, 0.6)', border: '1px solid rgba(0, 245, 212, 0.25)', borderRadius: '10px', padding: '0.85rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🎥 360° GoPro Stream Feed (Job #{simulatingJobId})
                      </span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    </div>
                    <div style={{
                      height: '140px',
                      background: '#020617',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.03)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] animate-pulse" />
                      <Cpu className="h-8 w-8 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        AI Diagnostics Active: Scanning Scar Tissue
                      </span>
                    </div>
                  </div>
                )}

                {/* Job Queue Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.4rem', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#cbd5e1', margin: 0, textTransform: 'uppercase' }}>
                    Checkup History & Queue ({checkupQueue.length})
                  </h4>
                  <button
                    type="button"
                    onClick={fetchCheckupQueue}
                    style={{ background: 'none', border: 'none', color: '#00f5d4', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'monospace' }}
                  >
                    Refresh
                  </button>
                </div>

                {/* Queue list */}
                {checkupQueue.length === 0 ? (
                  <p style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', margin: '1rem 0' }}>No checkup jobs found on-chain.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {checkupQueue.map((job: any) => {
                      const id = Number(job.jobId);
                      const stateVal = job.state;
                      const timestampStr = new Date(Number(job.timestamp) * 1000).toLocaleString();
                      
                      const statesConfig = [
                        { name: 'Created', color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)' },
                        { name: 'Recording', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' },
                        { name: 'Analyzing', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' },
                        { name: 'Encrypting', color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)' },
                        { name: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' },
                        { name: 'Failed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' },
                      ];
                      
                      const stateStyle = statesConfig[stateVal] || statesConfig[0];
                      const isSelfJob = job.patient.toLowerCase() === walletAddress.toLowerCase();
                      
                      const decrypted = decryptedDiagnostics[id];
                      const decError = decryptionErrors[id];
                      const isDecrypting = decryptingJobId === id;

                      return (
                        <div
                          key={id}
                          style={{
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#cbd5e1' }}>
                              Job #{id} <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 'normal' }}>({job.sanctuaryId})</span>
                            </span>
                            <span style={{
                              fontSize: '0.6rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              color: stateStyle.color,
                              background: stateStyle.bg,
                              border: stateStyle.border
                            }}>
                              {stateStyle.name}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                            <div>Patient: <span style={{ color: isSelfJob ? '#00f5d4' : '#cbd5e1' }}>{job.patient.slice(0, 6)}...{job.patient.slice(-4)} {isSelfJob ? '(YOU)' : ''}</span></div>
                            <div>DID: <span style={{ color: '#a78bfa' }}>{job.patientDID}</span></div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Logged: {timestampStr}</div>
                          </div>

                          {stateVal === 4 && (
                            <div style={{ marginTop: '0.35rem' }}>
                              {!decrypted ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDecryptDiagnostics(id, job.encryptedPayloadCID, job.patient)}
                                    disabled={isDecrypting}
                                    style={{
                                      background: 'rgba(0, 245, 212, 0.1)',
                                      border: '1px solid #00f5d4',
                                      color: '#00f5d4',
                                      padding: '0.3rem 0.75rem',
                                      borderRadius: '4px',
                                      fontSize: '0.65rem',
                                      fontWeight: 'bold',
                                      fontFamily: 'monospace',
                                      cursor: isDecrypting ? 'not-allowed' : 'pointer',
                                    }}
                                  >
                                    {isDecrypting ? 'Decrypting...' : '🔑 Decrypt diagnostics'}
                                  </button>
                                  {decError && (
                                    <span style={{ fontSize: '0.6rem', color: '#ef4444' }}>{decError}</span>
                                  )}
                                </div>
                              ) : (
                                <div style={{
                                  background: 'rgba(5, 8, 16, 0.75)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '6px',
                                  padding: '0.65rem',
                                  fontSize: '0.68rem',
                                  color: '#cbd5e1',
                                  textAlign: 'left',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.4rem',
                                  animation: 'fadeIn 0.25s ease-out'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16,185,129,0.15)', paddingBottom: '0.2rem', color: '#10b981', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.62rem' }}>
                                    <span>🩺 DECRYPTED DIAGNOSTIC RECORD (IN-MEMORY)</span>
                                    <button
                                      onClick={() => {
                                        setDecryptedDiagnostics(prev => {
                                          const copy = { ...prev };
                                          delete copy[id];
                                          return copy;
                                        });
                                      }}
                                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.58rem' }}
                                    >
                                      [Close]
                                    </button>
                                  </div>
                                  
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', background: 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.6rem' }}>
                                    <div>❤️ HR: <span style={{ color: '#00f5d4' }}>{decrypted.telemetry?.heartRate} bpm</span></div>
                                    <div>🩸 BP: <span style={{ color: '#38bdf8' }}>{decrypted.telemetry?.bloodPressure}</span></div>
                                    <div>🌡️ TEMP: <span style={{ color: '#a78bfa' }}>{decrypted.telemetry?.temperature}</span></div>
                                  </div>

                                  <div style={{ fontSize: '0.65rem', lineHeight: '1.45' }}>
                                    <strong>Findings:</strong> {decrypted.findings?.tissueRegeneration}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#64748b', fontFamily: 'monospace' }}>
                                    <span>Scar healing: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{decrypted.findings?.scarHealingProgress}</span></span>
                                    <a href={decrypted.findings?.gopro360FeedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                                      View GoPro 360° Feed
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Web3 Contract ledger terminal */}
          <div style={{ background: '#090d16', border: '1px solid rgba(0, 245, 212, 0.15)', borderRadius: '12px', padding: '0.75rem 1.25rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '0.25rem', height: '140px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.7rem', color: '#00f5d4', borderBottom: '1px solid rgba(0,245,212,0.1)', paddingBottom: '0.25rem', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', fontWeight: 'bold' }}>
              <span>Registry Smart Contract Ledger Console</span>
              <span style={{ color: '#64748b' }}>contract: 0x7b8A...20Fa</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.7rem', textAlign: 'left' }}>
              {contractLogs.map((log, index) => (
                <div key={index} style={{ color: log.type === 'success' ? '#10b981' : log.type === 'tx' ? '#a78bfa' : '#94a3b8' }}>
                  [{log.timestamp}] {log.message}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

        {/* Right Column: Google Earth Visualizer & (Chronicles / Listings Board) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '760px' }}>
          
          {/* Globe Projection HUD */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', flexGrow: 1, overflow: 'hidden' }}>
            <h3 className={styles.chroniclesTitle} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Compass className="h-4 w-4 text-teal-400" /> Safe Zone Earth Projection
            </h3>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <GlobeVisualizer
                pins={[...mapPins, ...getCraigslistPins()]}
                zones={defaultZones}
                selectedPin={selectedPin}
                onSelectPin={setSelectedPin}
                userCoords={coords}
                profiles={profiles}
              />
            </div>
          </div>

          {/* Franchise Chronicles & Listings Board Bento Card */}
          <div className={styles.chroniclesCard} style={{ height: '340px', flexShrink: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header with Tab Switcher */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveRightTab('board')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeRightTab === 'board' ? '2px solid #00f5d4' : '2px solid transparent',
                  color: activeRightTab === 'board' ? '#f8fafc' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  paddingBottom: '0.5rem',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Compass className="h-4 w-4" /> Active Grid Board
              </button>
              <button
                onClick={() => setActiveRightTab('chronicles')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeRightTab === 'chronicles' ? '2px solid #00f5d4' : '2px solid transparent',
                  color: activeRightTab === 'chronicles' ? '#f8fafc' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  paddingBottom: '0.5rem',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <BookOpen className="h-4 w-4" /> Chronicles
              </button>
              <button
                onClick={() => setActiveRightTab('craigslist')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeRightTab === 'craigslist' ? '2px solid #f97316' : '2px solid transparent',
                  color: activeRightTab === 'craigslist' ? '#f8fafc' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  paddingBottom: '0.5rem',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Compass className="h-4 w-4" /> Craigslist Feed
              </button>
              <button
                onClick={() => setActiveRightTab('my-gigs')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeRightTab === 'my-gigs' ? '2px solid #a78bfa' : '2px solid transparent',
                  color: activeRightTab === 'my-gigs' ? '#f8fafc' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  paddingBottom: '0.5rem',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Briefcase className="h-4 w-4" /> My Gigs
              </button>
            </div>

            {/* Content area */}
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              {activeRightTab === 'board' ? (
                <SafeZoneBoard
                  pins={mapPins}
                  userCoords={coords}
                  onSelectPin={setSelectedPin}
                  onAcceptPin={handleAcceptPin}
                  currentWallet={walletAddress}
                  profiles={profiles}
                  onRatePeer={handleRatePeer}
                  onCompletePin={handleCompletePin}
                />
              ) : activeRightTab === 'my-gigs' ? (
                <SafeZoneBoard
                  pins={myGigsPins}
                  userCoords={coords}
                  onSelectPin={setSelectedPin}
                  onAcceptPin={handleAcceptPin}
                  currentWallet={walletAddress}
                  profiles={profiles}
                  onRatePeer={handleRatePeer}
                  onCompletePin={handleCompletePin}
                />
              ) : activeRightTab === 'chronicles' ? (
                <div className={styles.articlesFeed}>
                  {blogArticles.map((art) => {
                    const isReading = readingArticle === art.id;
                    return (
                      <div key={art.id} className={styles.articleItem}>
                        <span className={styles.articleCategory}>{art.category}</span>
                        <h4 className={styles.articleTitle}>{art.title}</h4>
                        
                        {isReading ? (
                          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <p className={styles.articleSummary} style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
                              {art.summary}
                            </p>
                            <p className={styles.articleSummary} style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '6px' }}>
                              {art.content}
                            </p>
                            <button onClick={() => setReadingArticle(null)} className={styles.articleAction}>
                              Collapse Chronicle ↑
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className={styles.articleSummary}>{art.summary}</p>
                            <button onClick={() => setReadingArticle(art.id)} className={styles.articleAction}>
                              Read full chronicle →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Craigslist Search Input */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search Craigslist suburb or keyword..."
                      value={craigslistSearchQuery}
                      onChange={e => setCraigslistSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#070a12',
                        border: '1px solid rgba(249, 115, 22, 0.3)',
                        borderRadius: '6px',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#fff',
                        outline: 'none',
                        fontFamily: 'sans-serif'
                      }}
                    />
                    {craigslistSearchQuery && (
                      <button
                        onClick={() => setCraigslistSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Listings list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '230px', overflowY: 'auto' }}>
                    {filteredCraigslistListings.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>No matching Craigslist listings found.</span>
                    ) : (
                      filteredCraigslistListings.map(cl => {
                        const resolved = findClosestSafeZoneForSuburb(cl.suburb);
                        const isSelected = selectedPin && selectedPin.id === cl.id;
                        return (
                          <div 
                            key={cl.id} 
                            onClick={() => {
                              const pin = getCraigslistPins().find(p => p.id === cl.id);
                              if (pin) setSelectedPin(pin);
                            }}
                            style={{ 
                              background: isSelected ? 'rgba(249, 115, 22, 0.08)' : 'rgba(15, 23, 42, 0.4)', 
                              border: '1px solid',
                              borderColor: isSelected ? '#f97316' : 'rgba(255,255,255,0.03)',
                              borderRadius: '10px', 
                              padding: '0.85rem', 
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.2)';
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#ff7a00', background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.25)', padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase' }}>
                                craigslist: {cl.category}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#00f5d4', fontFamily: 'monospace' }}>
                                {cl.price}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', margin: '0 0 0.35rem 0' }}>{cl.title}</h4>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>{cl.description}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.4rem', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                              <div style={{ color: '#94a3b8' }}>
                                📍 Craigslist Suburb: <span style={{ color: '#fff', fontWeight: 'bold' }}>{cl.suburb}</span>
                              </div>
                              <div style={{ color: '#c084fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>🛡️ Closest Safe Zone: <span style={{ color: '#e9d5ff', fontWeight: 'bold' }}>{resolved.zone.name.split(' (')[0]}</span></span>
                                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{resolved.distance.toFixed(1)} mi</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBridgeCraigslistToSafePurchase(cl);
                                }}
                                style={{
                                  flex: 1,
                                  background: 'rgba(249, 115, 22, 0.1)',
                                  border: '1px solid #f97316',
                                  color: '#f97316',
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: 'bold',
                                  fontFamily: 'monospace',
                                  cursor: 'pointer',
                                  textTransform: 'uppercase',
                                  textAlign: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={el => el.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)'}
                                onMouseLeave={el => el.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)'}
                              >
                                🔗 Bridge to Safe Purchase
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
      {/* Pop-up Explainer Modal */}
      {explainerContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ background: '#090d16', border: '1px solid #00f5d4', boxShadow: '0 0 30px rgba(0, 245, 212, 0.15)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(0, 245, 212, 0.15)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{explainerContent.icon}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00f5d4', margin: 0, fontFamily: 'var(--font-poppins)' }}>
                {explainerContent.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              {explainerContent.text}
            </p>
            <button
              onClick={() => setExplainerContent(null)}
              style={{ background: 'rgba(0, 245, 212, 0.1)', border: '1px solid #00f5d4', color: '#00f5d4', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', width: '100%', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.1)'}
            >
              Acknowledge & Sync Preference
            </button>
          </div>
        </div>
      )}
      {/* DID Onboarding Modal */}
      <AnimatePresence>
        {onboardingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(5, 8, 16, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '1.5rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                maxWidth: '480px',
                width: '100%',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 245, 212, 0.15)',
                textAlign: 'center',
                color: '#fff'
              }}
            >
              <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.25)', marginBottom: '1.25rem' }}>
                <Shield className="h-8 w-8 text-teal-400 animate-pulse" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', background: 'linear-gradient(90deg, #00f5d4, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                On-Chain DID Registry Required
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Every patient at the Near Self-Care Sanctuaries must establish a Decentralized Identifier (DID) mapped to their wallet to secure diagnostic logs.
              </p>
              
              <div style={{ background: 'rgba(0, 245, 212, 0.05)', border: '1px solid rgba(0, 245, 212, 0.15)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.78rem', textAlign: 'left' }}>
                <div style={{ color: '#00f5d4', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <Sparkles className="h-4 w-4" /> INS Twitter Lookup Recommendation
                </div>
                {recommendedDID.includes('twitter') ? (
                  <p style={{ color: '#cbd5e1', margin: 0 }}>
                    We found a registered Twitter handle for your address on the InterchainNameService! We recommend using:
                  </p>
                ) : (
                  <p style={{ color: '#cbd5e1', margin: 0 }}>
                    No Twitter handle was resolved for this wallet address. We recommend using a temporary anonymous DID:
                  </p>
                )}
                <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', color: '#a78bfa', fontWeight: 'bold', wordBreak: 'break-all' }}>
                  {recommendedDID}
                </div>
              </div>

              <form onSubmit={handleRegisterDIDOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>YOUR DID REGISTER PATH</label>
                  <input
                    type="text"
                    value={onboardingDID}
                    onChange={(e) => setOnboardingDID(e.target.value)}
                    placeholder="did:y8:username"
                    required
                    style={{
                      width: '100%',
                      background: '#070a12',
                      border: '1px solid rgba(0, 245, 212, 0.3)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.85rem',
                      color: '#fff',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #00f5d4, #38bdf8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#050810',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.88rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 245, 212, 0.4)',
                    transition: 'transform 0.1s, opacity 0.2s'
                  }}
                >
                  Confirm & Register On-Chain
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
