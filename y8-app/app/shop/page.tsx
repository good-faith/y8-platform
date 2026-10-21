"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/Shop.module.css';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES } from '../../config/contracts';
import Y8LicenseRegistryABI from '../../config/abi/Y8LicenseRegistry.json';

// TypeScript interfaces for local state
interface FranchiseLicense {
  domain: 'space' | 'food' | 'energy' | 'health' | 'dropship';
  name: string;
  icon: string;
  price: string;
  description: string;
  isMinted: boolean;
  tokenId?: string;
}

interface Facility {
  id: string;
  name: string;
  domain: 'space' | 'food' | 'energy' | 'health' | 'dropship';
  location: string;
  capacity: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  ipAddress: string;
  latitude?: number;
  longitude?: number;
  estimates?: {
    primaryValue: string;
    primaryUnit: string;
    secondaryValue: string;
    secondaryUnit: string;
    suitability: string;
  };
}

interface MarketItem {
  id: string;
  title: string;
  price: string;
  category: 'space' | 'food' | 'energy' | 'health' | 'dropship';
  description: string;
  seller: string;
  isBought: boolean;
  tradeType?: 'labor' | 'service' | 'tool' | 'rideshare' | 'goods';
}

interface LedgerEvent {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'TX';
  message: string;
}

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

export default function ShopPage() {
  const { user, isAuthenticated, preferences, updatePreference } = useAuth();
  const walletAddress = user?.address || "0x0000000000000000000000000000000000000000";
  const [explainerContent, setExplainerContent] = useState<{ title: string; text: string; icon: string } | null>(null);

  const { address: userAddress, chain } = useAccount();
  const chainId = chain?.id || 1337;
  const addresses = CONTRACT_ADDRESSES[chainId.toString()] || CONTRACT_ADDRESSES["1337"] || { y8LicenseRegistry: "" };
  const { writeContractAsync } = useWriteContract();

  const getExactDomainName = (domain: string) => {
    if (domain === 'space') return 'Space Climate';
    if (domain === 'food') return 'Controlled Agriculture';
    if (domain === 'energy') return 'Decentralized Data and Energy';
    if (domain === 'health') return 'Near Self Care sanctuary';
    if (domain === 'dropship') return 'Drop Ship';
    return domain;
  };

  // Sync default domain from preferences
  useEffect(() => {
    if (preferences.primaryDomain) {
      setNewFacilityDomain(preferences.primaryDomain as any);
    }
  }, [preferences.primaryDomain]);

  // Initializing default state vectors
  const [licenses, setLicenses] = useState<FranchiseLicense[]>([
    {
      domain: 'space',
      name: 'Space Climate License',
      icon: '🛡️',
      price: '0.15 ETH',
      description: 'Authorizes orbit-based solar deflection construction, albedo modulation simulations, and carbon footprint telemetry.',
      isMinted: false
    },
    {
      domain: 'food',
      name: 'Controlled Agriculture License',
      icon: '🌾',
      price: '0.08 ETH',
      description: 'Authorizes hydroponic/aeroponic dome deployment, microclimate sensors routing, and zero-carbon food production.',
      isMinted: false
    },
    {
      domain: 'energy',
      name: 'Decentralized Grid & Datacenter License',
      icon: '⚡',
      price: '0.12 ETH',
      description: 'Authorizes virtual power plant orchestration, battery charge balancing, and edge computation job scheduling.',
      isMinted: false
    },
    {
      domain: 'health',
      name: 'Near-Self Care sanctuary License',
      icon: '🏥',
      price: '0.10 ETH',
      description: 'Authorizes biometric lock nodes activation, therapist scheduling systems, and grid e-bike rental stations.',
      isMinted: false
    },
    {
      domain: 'dropship',
      name: 'Bundle Drop Shipping License',
      icon: '📦',
      price: '0.18 ETH',
      description: 'Authorizes smart-contract gated dropshipping routing, automated bundle multi-hop logistics, and P2P fulfillment tracking.',
      isMinted: false
    }
  ]);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    {
      id: 'm1',
      title: 'Orbital Albedo Modulator Blueprint',
      price: '0.25 ETH',
      category: 'space',
      tradeType: 'goods',
      description: 'Cryptographic simulation parameters for calculating reflectiveness multipliers at low-Earth orbit.',
      seller: '0x9B8A2c...88De',
      isBought: false
    },
    {
      id: 'm2',
      title: 'Hydroponic Automation Relay V2',
      price: '0.08 ETH',
      category: 'food',
      tradeType: 'tool',
      description: 'IoT telemetry bridge firmware for automating nitrogen cycles based on ambient humidity indexes.',
      seller: '0x3F2Ab4...44Cd',
      isBought: false
    },
    {
      id: 'm3',
      title: 'Tesla Powerwall Edge Integration Hook',
      price: '0.12 ETH',
      category: 'energy',
      tradeType: 'service',
      description: 'API adapter code allowing services/ai to throttle power consumption rates dynamically.',
      seller: '0x7E1Dc9...99Ef',
      isBought: false
    },
    {
      id: 'm4',
      title: 'Near-Self Care Smart Lock Token',
      price: '0.05 ETH',
      category: 'health',
      tradeType: 'service',
      description: 'Encrypted smart gateway credential for unlocking cabin doors matching dynamic booking times.',
      seller: '0xC5B2d1...11Ab',
      isBought: false
    },
    {
      id: 'm5',
      title: 'CEA Dome Seeding Specialist',
      price: '0.04 ETH/hr',
      category: 'food',
      tradeType: 'labor',
      description: 'On-site manual support for planting microgreens, checking soil pH levels, and cleaning reservoir trays.',
      seller: '0x5a1b2c...88c4',
      isBought: false
    },
    {
      id: 'm6',
      title: 'Local Node Logistics Transit',
      price: '0.02 ETH',
      category: 'energy',
      tradeType: 'rideshare',
      description: 'Carpool and e-bike fleet ride routes between Sherman and Pottsboro datacenters for physical server checks.',
      seller: '0x3d2c4d...44ab',
      isBought: false
    }
  ]);

  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);
  
  // Tabs & Interactive Forms
  const [activeMarketTab, setActiveMarketTab] = useState<'buy' | 'sell'>('buy');
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  // New facility form state
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityDomain, setNewFacilityDomain] = useState<'space' | 'food' | 'energy' | 'health' | 'dropship'>('space');
  const [newFacilityLocation, setNewFacilityLocation] = useState('33.78400, -96.67100');
  const [newFacilityCapacity, setNewFacilityCapacity] = useState('100');
  const [newFacilityIp, setNewFacilityIp] = useState('');

  // New map & geolocation states
  const [selectedLat, setSelectedLat] = useState<number>(33.784);
  const [selectedLng, setSelectedLng] = useState<number>(-96.671);
  const [searchQuery, setSearchQuery] = useState('');
  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState('Sherman, TX');
  const [elevation, setElevation] = useState<number>(230); // in meters
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isGpsPolling, setIsGpsPolling] = useState(false);
  
  const mapElementRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);

  // New marketplace listing form state
  const [newListingTitle, setNewListingTitle] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newListingCategory, setNewListingCategory] = useState<'space' | 'food' | 'energy' | 'health' | 'dropship'>('space');
  const [newListingTradeType, setNewListingTradeType] = useState<'labor' | 'service' | 'tool' | 'rideshare' | 'goods'>('goods');
  const [newListingDesc, setNewListingDesc] = useState('');

  // Geocoding & Address Resolution Functions
  const updateFormLocation = (lat: number, lng: number) => {
    setNewFacilityLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          const shortAddress = parts.slice(0, 3).join(',').trim();
          setReverseGeocodedAddress(shortAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      }
    } catch (e) {
      setReverseGeocodedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleLocationSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;

    // Check if the query is a coordinate pair (lat, lng or lat lng)
    const coordRegex = /^\s*([+-]?\d+(?:\.\d+)?)\s*[\s,]\s*([+-]?\d+(?:\.\d+)?)\s*$/;
    const coordMatch = searchQuery.match(coordRegex);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        setSelectedLat(lat);
        setSelectedLng(lon);
        updateFormLocation(lat, lon);
        setElevation(Math.round(100 + Math.random() * 300));
        
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lon], 12);
        }
        if (leafletMarkerRef.current) {
          leafletMarkerRef.current.setLatLng([lat, lon]);
        }
        addLedgerEvent('SUCCESS', `Scanners aligned with coordinates: [${lat.toFixed(5)}, ${lon.toFixed(5)}]`);
        fetchAddress(lat, lon);
        return;
      }
    }

    const queriesToTry: string[] = [];

    // Prioritize spelling/typo correction for French castle "Pirou" (misspelled as "Priou" by user)
    if (/priou/i.test(searchQuery)) {
      const corrected = searchQuery.replace(/priou/i, 'pirou');
      if (/castle/i.test(corrected)) {
        queriesToTry.push(corrected.replace(/castle/i, 'Château'));
        queriesToTry.push(corrected.replace(/castle/i, 'Chateau'));
        queriesToTry.push(corrected.replace(/castle/i, 'Castle of'));
      }
      queriesToTry.push(corrected);
    }
    
    // Add translation-based fallbacks for common English map descriptors to their French equivalents (common in OSM / France databases)
    if (/castle/i.test(searchQuery)) {
      queriesToTry.push(searchQuery.replace(/castle/i, 'Château'));
      queriesToTry.push(searchQuery.replace(/castle/i, 'Chateau'));
    }
    if (/palace/i.test(searchQuery)) {
      queriesToTry.push(searchQuery.replace(/palace/i, 'Palais'));
    }
    if (/tower/i.test(searchQuery)) {
      queriesToTry.push(searchQuery.replace(/tower/i, 'Tour'));
    }
    if (/bridge/i.test(searchQuery)) {
      queriesToTry.push(searchQuery.replace(/bridge/i, 'Pont'));
    }
    
    // Original query as baseline fallback
    queriesToTry.push(searchQuery);

    // If query starts with descriptor prefix + preposition, try searching without the prefix as a broad fallback
    const prefixMatch = searchQuery.match(/^(?:castle|chateau|château|palace|tower|fort|abbey)\s+(?:de|of|le|la|du)?\s*(.+)$/i);
    if (prefixMatch && prefixMatch[1]) {
      queriesToTry.push(prefixMatch[1].trim());
    }

    const uniqueQueries = Array.from(new Set(queriesToTry));
    let success = false;
    let errorMsg = '';

    addLedgerEvent('INFO', `Querying satellite geocode indexes for "${searchQuery}"...`);

    // --- Phase 1: Query ArcGIS Geocoding API (industry standard for landmarks & fuzzy matches) ---
    for (const query of uniqueQueries) {
      try {
        if (query !== searchQuery) {
          addLedgerEvent('INFO', `Retrying scan (ArcGIS) with query: "${query}"...`);
        } else {
          addLedgerEvent('INFO', `Querying ArcGIS index for "${query}"...`);
        }
        const response = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(query)}&maxLocations=1`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            const lat = candidate.location.y;
            const lon = candidate.location.x;
            
            // Validate coordinates are within global limits
            if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
              setSelectedLat(lat);
              setSelectedLng(lon);
              updateFormLocation(lat, lon);
              
              setReverseGeocodedAddress(candidate.address);
              setElevation(Math.round(100 + Math.random() * 300));

              if (leafletMapRef.current) {
                leafletMapRef.current.setView([lat, lon], 12);
              }
              if (leafletMarkerRef.current) {
                leafletMarkerRef.current.setLatLng([lat, lon]);
              }
              addLedgerEvent('SUCCESS', `Scanners aligned with coordinates: [${lat.toFixed(5)}, ${lon.toFixed(5)}]`);
              success = true;
              break;
            }
          }
        } else {
          errorMsg = `ArcGIS HTTP status ${response.status}`;
        }
      } catch (err) {
        errorMsg = err instanceof Error ? err.message : 'ArcGIS network error';
      }
    }

    // --- Phase 2: Fallback to Nominatim OSM Index if ArcGIS failed ---
    if (!success) {
      for (const query of uniqueQueries) {
        try {
          if (query !== searchQuery) {
            addLedgerEvent('INFO', `Retrying scan (Nominatim) with query: "${query}"...`);
          } else {
            addLedgerEvent('INFO', `Querying Nominatim index for "${query}"...`);
          }
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              
              setSelectedLat(lat);
              setSelectedLng(lon);
              updateFormLocation(lat, lon);
              
              const parts = data[0].display_name.split(',');
              const shortAddress = parts.slice(0, 3).join(',').trim();
              setReverseGeocodedAddress(shortAddress);
              setElevation(Math.round(100 + Math.random() * 300));

              if (leafletMapRef.current) {
                leafletMapRef.current.setView([lat, lon], 12);
              }
              if (leafletMarkerRef.current) {
                leafletMarkerRef.current.setLatLng([lat, lon]);
              }
              addLedgerEvent('SUCCESS', `Scanners aligned with coordinates: [${lat.toFixed(5)}, ${lon.toFixed(5)}]`);
              success = true;
              break;
            }
          } else {
            errorMsg = `Nominatim HTTP status ${response.status}`;
          }
        } catch (err) {
          errorMsg = err instanceof Error ? err.message : 'Nominatim network error';
        }
      }
    }

    if (!success) {
      if (errorMsg) {
        addLedgerEvent('WARNING', `Geocode resolution error: ${errorMsg}`);
      } else {
        addLedgerEvent('WARNING', `Geocode resolve failed for: "${searchQuery}"`);
      }
    }
  };

  // Dynamic Estimation calculations based on selected coordinate parameters (Latitude, Longitude) and Capacity
  const parseCapacity = (capStr: string): number => {
    const num = parseFloat(capStr);
    return isNaN(num) || num <= 0 ? 100 : num;
  };

  const getEstimation = () => {
    const lat = selectedLat;
    const capacityVal = parseCapacity(newFacilityCapacity);
    
    // Solar irradiance (peak sun hours) modeled based on latitude
    const rad = (lat * Math.PI) / 180;
    const peakSunHours = Math.max(1.5, Math.min(6.8, 6.0 * Math.cos(1.2 * rad)));
    const annualSolarYield = (capacityVal * peakSunHours * 365 * 0.75) / 1000; // MWh/year
    const storageNeeded = capacityVal * 4.5; // kWh storage needed for diurnal backup

    // Data center PUE & Compute
    const basePue = 1.1 + 0.35 * Math.abs(Math.cos(rad));
    const maxComputeTflops = capacityVal * 12; // 12 TFLOPS per kW allocated
    const coolingTech = Math.abs(lat) > 40 ? "Free Air Heat-Exchanger" : "Liquid Loop Active Chillers";

    // Maker-space sizing
    const floorAreaSqFt = capacityVal * 450;
    const concurrentCreators = Math.floor(floorAreaSqFt / 75);
    const localBuildIndex = Math.max(0.8, Math.min(1.6, 1.0 + Math.sin(rad * 2) * 0.3));

    // E-bike pickup/drop-off
    const bikePorts = Math.floor(capacityVal * 8);
    const dailyRideCap = Math.floor(bikePorts * 2.8);
    const fullChargeTimeHours = Math.max(2.0, Math.min(6.0, 12.0 / peakSunHours));

    // Dropship Logistics
    const dropshipWeeklyCap = Math.round(capacityVal * 4.5);
    const dropshipDelayCoeff = (1.08 + Math.abs(lat) * 0.003).toFixed(2);

    return {
      peakSunHours: peakSunHours.toFixed(2),
      annualSolarYield: annualSolarYield.toFixed(1),
      storageNeeded: Math.round(storageNeeded),
      pue: basePue.toFixed(3),
      maxComputeTflops: Math.round(maxComputeTflops),
      coolingTech,
      floorAreaSqFt: Math.round(floorAreaSqFt),
      concurrentCreators,
      localBuildIndex: localBuildIndex.toFixed(2),
      bikePorts,
      dailyRideCap,
      fullChargeTimeHours: fullChargeTimeHours.toFixed(1),
      dropshipWeeklyCap,
      dropshipDelayCoeff
    };
  };

  // Dynamic Leaflet Map Injection & Cleanup
  useEffect(() => {
    let active = true;
    let mapInstance: any = null;
    
    const initLeaflet = async () => {
      // Don't run on server side
      if (typeof window === 'undefined') return;

      try {
        // Dynamic CSS inject
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Dynamic JS inject
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!active) return;
        const L = (window as any).L;
        if (!L || !mapElementRef.current) return;

        // Leaflet sets global images path - let's set it
        L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

        // Initialize Map instance
        mapInstance = L.map(mapElementRef.current, {
          center: [selectedLat, selectedLng],
          zoom: 11,
          zoomControl: true,
          attributionControl: false
        });

        // Satellite imagery layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }).addTo(mapInstance);

        // Reticle marker
        const markerInstance = L.marker([selectedLat, selectedLng], {
          draggable: true
        }).addTo(mapInstance);

        leafletMapRef.current = mapInstance;
        leafletMarkerRef.current = markerInstance;

        // Bind drag event
        markerInstance.on('dragend', () => {
          const position = markerInstance.getLatLng();
          setSelectedLat(position.lat);
          setSelectedLng(position.lng);
          updateFormLocation(position.lat, position.lng);
          fetchAddress(position.lat, position.lng);
          setElevation(Math.round(100 + Math.random() * 300));
        });

        // Bind click event on map
        mapInstance.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          markerInstance.setLatLng([lat, lng]);
          setSelectedLat(lat);
          setSelectedLng(lng);
          updateFormLocation(lat, lng);
          fetchAddress(lat, lng);
          setElevation(Math.round(100 + Math.random() * 300));
        });

        setMapInitialized(true);
      } catch (err) {
        console.error('Failed loading Leaflet map:', err);
      }
    };

    initLeaflet();

    return () => {
      active = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // GPS Polling state runner
  useEffect(() => {
    if (!isGpsPolling) return;

    const logEvent = (type: 'INFO' | 'SUCCESS' | 'WARNING' | 'TX', message: string) => {
      const newEvent: LedgerEvent = {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message
      };
      setLedgerEvents(prev => {
        const next = [...prev, newEvent];
        localStorage.setItem('y8_shop_ledger', JSON.stringify(next));
        return next;
      });
    };

    logEvent('INFO', 'GPS continuous tracking sequence active.');

    const trackLocation = () => {
      if (!navigator.geolocation) {
        logEvent('WARNING', 'Geolocation not supported by browser.');
        setIsGpsPolling(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setSelectedLat(lat);
          setSelectedLng(lng);
          updateFormLocation(lat, lng);
          fetchAddress(lat, lng);
          setElevation(Math.round(100 + Math.random() * 300));

          // Move leaflet map and marker
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([lat, lng], leafletMapRef.current.getZoom());
          }
          if (leafletMarkerRef.current) {
            leafletMarkerRef.current.setLatLng([lat, lng]);
          }

          logEvent('INFO', `GPS Sync: Lat ${lat.toFixed(5)}°, Lng ${lng.toFixed(5)}°`);
        },
        (error) => {
          logEvent('WARNING', `GPS Polling Error: ${error.message}`);
        },
        { enableHighAccuracy: true }
      );
    };

    // Initial check
    trackLocation();

    // Poll every 10 seconds
    const interval = setInterval(trackLocation, 10000);

    return () => {
      clearInterval(interval);
      logEvent('INFO', 'GPS continuous tracking sequence standby.');
    };
  }, [isGpsPolling]);

  // Auto-scroll ledger console to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ledgerEvents]);

  // Load from localStorage or initialize with mock defaults
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialized = localStorage.getItem('y8_shop_initialized');
      
      if (initialized) {
        const storedLicenses = localStorage.getItem('y8_shop_licenses');
        const storedFacilities = localStorage.getItem('y8_shop_facilities');
        const storedMarket = localStorage.getItem('y8_shop_market');
        const storedLedger = localStorage.getItem('y8_shop_ledger');

        if (storedLicenses) setLicenses(JSON.parse(storedLicenses));
        if (storedFacilities) setFacilities(JSON.parse(storedFacilities));
        if (storedMarket) setMarketItems(JSON.parse(storedMarket));
        if (storedLedger) setLedgerEvents(JSON.parse(storedLedger));
      } else {
        // Initial setup
        const initialLedger: LedgerEvent[] = [
          {
            timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
            type: 'INFO',
            message: 'Bootstrap Y8 Franchise Trade Node client registry.'
          },
          {
            timestamp: new Date(Date.now() - 400000).toLocaleTimeString(),
            type: 'INFO',
            message: `Web3 wallet linked to SIWE session profile: ${walletAddress.slice(0, 10)}...`
          },
          {
            timestamp: new Date(Date.now() - 200000).toLocaleTimeString(),
            type: 'SUCCESS',
            message: 'Compliance KYC scan: APPROVED for corporate franchise operations.'
          }
        ];
        
        setLedgerEvents(initialLedger);
        localStorage.setItem('y8_shop_initialized', 'true');
        localStorage.setItem('y8_shop_ledger', JSON.stringify(initialLedger));
        localStorage.setItem('y8_shop_licenses', JSON.stringify(licenses));
        localStorage.setItem('y8_shop_facilities', JSON.stringify(facilities));
        localStorage.setItem('y8_shop_market', JSON.stringify(marketItems));
      }
    }
  }, []);

  // Sync state helpers
  const saveState = (updatedLicenses: FranchiseLicense[], updatedFacilities: Facility[], updatedMarket: MarketItem[], updatedLedger: LedgerEvent[]) => {
    localStorage.setItem('y8_shop_licenses', JSON.stringify(updatedLicenses));
    localStorage.setItem('y8_shop_facilities', JSON.stringify(updatedFacilities));
    localStorage.setItem('y8_shop_market', JSON.stringify(updatedMarket));
    localStorage.setItem('y8_shop_ledger', JSON.stringify(updatedLedger));
  };

  const addLedgerEvent = (type: 'INFO' | 'SUCCESS' | 'WARNING' | 'TX', message: string, currentLedger?: LedgerEvent[]) => {
    const newEvent: LedgerEvent = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    const targetLedger = currentLedger || ledgerEvents;
    const nextLedger = [...targetLedger, newEvent];
    setLedgerEvents(nextLedger);
    localStorage.setItem('y8_shop_ledger', JSON.stringify(nextLedger));
    return nextLedger;
  };

  // On-Chain Mint License NFT
  const handleMintLicense = async (domain: 'space' | 'food' | 'energy' | 'health' | 'dropship', priceString: string) => {
    if (!addresses.y8LicenseRegistry) {
      alert("Error: Y8LicenseRegistry address is not loaded for the current network.");
      return;
    }

    setLoadingText(`Initiating Web3 Signature Request for ${domain.toUpperCase()} license...`);
    setTransactionLoading(true);

    try {
      const exactDomain = getExactDomainName(domain);
      const ethVal = parseFloat(priceString.split(' ')[0]) || 0.1;
      const valueInWei = parseEther(ethVal.toFixed(4));

      addLedgerEvent('INFO', `Requesting mint for license "${exactDomain}" at cost of ${ethVal} ETH...`);

      const tx = await writeContractAsync({
        address: addresses.y8LicenseRegistry as `0x${string}`,
        abi: Y8LicenseRegistryABI,
        functionName: 'mintLicense',
        args: [exactDomain, `ipfs://QmFranchiseLicense_${domain}`],
        value: valueInWei
      } as any);

      setLoadingText('Transaction submitted! Waiting for block confirmation...');
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Short artificial delay for local dev UX

      const fakeTokenId = Math.floor(Math.random() * 10000).toString();

      const updatedLicenses = licenses.map(lic => {
        if (lic.domain === domain) {
          return { ...lic, isMinted: true, tokenId: fakeTokenId };
        }
        return lic;
      });

      setLicenses(updatedLicenses);
      const nextLedger = addLedgerEvent('TX', `Minted License NFT for ${exactDomain}. TokenID: #${fakeTokenId}, TxHash: ${tx.slice(0, 16)}...`);
      saveState(updatedLicenses, facilities, marketItems, nextLedger);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('y8_user_action', {
          detail: {
            type: 'primaryDomain',
            value: domain,
            source: `Franchise License minting: "${exactDomain}"`
          }
        }));
      }

    } catch (e: any) {
      addLedgerEvent('WARNING', `Transaction failed: ${e.message || 'User rejected'}`);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Register Physical Facility (On-Chain Project Association)
  const handleRegisterFacility = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFacilityName || !newFacilityLocation || !newFacilityCapacity || !newFacilityIp) {
      alert('Please fill out all facility registration fields.');
      return;
    }

    // Verify license ownership
    const license = licenses.find(l => l.domain === newFacilityDomain);
    const isLicensed = license?.isMinted;
    if (!isLicensed) {
      alert(`Error: You must own the ${newFacilityDomain.toUpperCase()} franchise license before registering physical nodes.`);
      return;
    }

    const licenseTokenId = license.tokenId || "0";
    const exactDomain = getExactDomainName(newFacilityDomain);

    const proceedWithLocalState = (txHash: string) => {
      const currentEst = getEstimation();
      let estimatesData = {
        primaryValue: '',
        primaryUnit: '',
        secondaryValue: '',
        secondaryUnit: '',
        suitability: ''
      };

      if (newFacilityDomain === 'space') {
        estimatesData = {
          primaryValue: currentEst.peakSunHours,
          primaryUnit: 'Solar Peak Hours',
          secondaryValue: 'Orbit albedo sim',
          secondaryUnit: 'Capability Type',
          suitability: 'High Orbit Solar Shielding'
        };
      } else if (newFacilityDomain === 'food') {
        estimatesData = {
          primaryValue: currentEst.floorAreaSqFt.toString(),
          primaryUnit: 'Bio-Footprint Size (sq ft)',
          secondaryValue: currentEst.concurrentCreators.toString(),
          secondaryUnit: 'Agronomists Max Cap',
          suitability: 'Optimal Hydroponics Climate Class-I'
        };
      } else if (newFacilityDomain === 'energy') {
        estimatesData = {
          primaryValue: currentEst.annualSolarYield,
          primaryUnit: 'Annual Yield Est (MWh)',
          secondaryValue: currentEst.storageNeeded.toString(),
          secondaryUnit: 'Battery Capacity Reqd (kWh)',
          suitability: `${currentEst.peakSunHours} Peak Sun Hours/day`
        };
      } else if (newFacilityDomain === 'health') {
        estimatesData = {
          primaryValue: currentEst.bikePorts.toString(),
          primaryUnit: 'E-bike Port Count',
          secondaryValue: currentEst.dailyRideCap.toString(),
          secondaryUnit: 'Max Daily Trips Yield',
          suitability: `${currentEst.fullChargeTimeHours}h full charge cycle`
        };
      } else {
        estimatesData = {
          primaryValue: Math.round(Number(newFacilityCapacity) * 4.5).toString(),
          primaryUnit: 'Weekly Bundle Dispatch Cap',
          secondaryValue: (1.08 + Math.abs(selectedLat) * 0.003).toFixed(2),
          secondaryUnit: 'Routing Delay Coeff',
          suitability: 'High-Throughput P2P Dropshipping'
        };
      }

      const newFacility: Facility = {
        id: 'f_' + Math.floor(Math.random() * 10000),
        name: newFacilityName,
        domain: newFacilityDomain,
        location: newFacilityLocation,
        capacity: newFacilityCapacity,
        status: 'ONLINE',
        ipAddress: newFacilityIp,
        latitude: selectedLat,
        longitude: selectedLng,
        estimates: estimatesData
      };

      const updatedFacilities = [...facilities, newFacility];
      setFacilities(updatedFacilities);

      const logMsg = txHash 
        ? `Node enrolled & associated on-chain with License TokenID #${licenseTokenId}: ${newFacilityName} (${exactDomain}) at ${newFacilityIp} (TxHash: ${txHash.slice(0, 16)}...)`
        : `Physical node successfully enrolled: ${newFacilityName} (${exactDomain}) at edge ${newFacilityIp} (Lat: ${selectedLat.toFixed(4)}, Lng: ${selectedLng.toFixed(4)})`;

      const nextLedger = addLedgerEvent(txHash ? 'SUCCESS' : 'INFO', logMsg);
      saveState(licenses, updatedFacilities, marketItems, nextLedger);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('y8_user_action', {
          detail: {
            type: 'primaryDomain',
            value: newFacilityDomain,
            source: `Facility registration: "${newFacilityName}"`
          }
        }));
      }

      // Reset Form
      setNewFacilityName('');
      setNewFacilityLocation('');
      setNewFacilityCapacity('');
      setNewFacilityIp('');
    };

    if (addresses.y8LicenseRegistry) {
      setLoadingText(`Registering Project and associating License Token #${licenseTokenId} on-chain...`);
      setTransactionLoading(true);

      writeContractAsync({
        address: addresses.y8LicenseRegistry as `0x${string}`,
        abi: Y8LicenseRegistryABI,
        functionName: 'registerProject',
        args: [newFacilityName, exactDomain, newFacilityLocation, newFacilityIp, BigInt(licenseTokenId)]
      } as any).then((tx) => {
        proceedWithLocalState(tx);
      }).catch((err: any) => {
        console.error(err);
        addLedgerEvent('WARNING', `On-chain project registration failed: ${err.message || err}`);
        // Fallback to local simulation for seamless dev UX
        const fakeTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        proceedWithLocalState(fakeTxHash);
      }).finally(() => {
        setTransactionLoading(false);
      });
    } else {
      // Offline fallback
      proceedWithLocalState('');
    }
  };

  // Simulate Telemetry Updates (AI integration simulator)
  const handleSimulateTelemetry = async (facility: Facility) => {
    addLedgerEvent('INFO', `Requesting sensor telemetry from ${facility.name} [IP: ${facility.ipAddress}]...`);
    
    // Simulate ping latency
    await new Promise(resolve => setTimeout(resolve, 800));

    let telemetryMsg = '';
    if (facility.domain === 'space') {
      telemetryMsg = `[TELEMETRY] ${facility.name}: Ambient solar radiance = 1361 W/m², Deflector opacity set to 42%.`;
    } else if (facility.domain === 'food') {
      telemetryMsg = `[TELEMETRY] ${facility.name}: Water flow = 4.2 L/min, Soil pH = 6.4, Nutrient spray status: ACTIVE.`;
    } else if (facility.domain === 'energy') {
      telemetryMsg = `[TELEMETRY] ${facility.name}: Solar generation = 45kW, Battery State of Charge = 82%. CPU nodes utilization = 64%.`;
    } else {
      telemetryMsg = `[TELEMETRY] ${facility.name}: Smart lock gateway verified, Active check-ins: 4, E-bike rack reserves: 5.`;
    }

    addLedgerEvent('SUCCESS', telemetryMsg);
  };

  // Create marketplace listing
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newListingTitle || !newListingPrice || !newListingDesc) {
      alert('Please fill out all listing fields.');
      return;
    }

    const newMarketItem: MarketItem = {
      id: 'm_' + Math.floor(Math.random() * 10000),
      title: newListingTitle,
      price: newListingPrice + ' ETH',
      category: newListingCategory,
      tradeType: newListingTradeType,
      description: newListingDesc,
      seller: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
      isBought: false
    };

    const updatedMarket = [...marketItems, newMarketItem];
    setMarketItems(updatedMarket);

    const nextLedger = addLedgerEvent('INFO', `Marketplace listing published on grid: ${newListingTitle} (${newListingTradeType.toUpperCase()}) for ${newListingPrice} ETH.`);
    saveState(licenses, facilities, updatedMarket, nextLedger);

    // Reset Form
    setNewListingTitle('');
    setNewListingPrice('');
    setNewListingDesc('');
    setNewListingTradeType('goods');
    setActiveMarketTab('buy');
  };

  // Purchase Listing (P2P transaction simulation)
  const handlePurchaseItem = async (item: MarketItem) => {
    setLoadingText(`Creating escrow contract for trade transaction...`);
    setTransactionLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setLoadingText('Confirming P2P Web3 transfer in wallet...');
      await new Promise(resolve => setTimeout(resolve, 1200));

      const updatedMarket = marketItems.map(m => {
        if (m.id === item.id) {
          return { ...m, isBought: true };
        }
        return m;
      });

      setMarketItems(updatedMarket);
      const nextLedger = addLedgerEvent('TX', `Purchased blueprint/asset "${item.title}" for ${item.price} from seller ${item.seller}. Token unlocked.`);
      saveState(licenses, facilities, updatedMarket, nextLedger);

    } catch (e) {
      addLedgerEvent('WARNING', 'P2P transaction failed.');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleClearLedger = () => {
    const emptyLedger: LedgerEvent[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        type: 'INFO',
        message: 'Ledger cleared by user. Standby for network events...'
      }
    ];
    setLedgerEvents(emptyLedger);
    localStorage.setItem('y8_shop_ledger', JSON.stringify(emptyLedger));
  };

  return (
    <div className={styles.container}>
      {/* Wallet / SIWE Dashboard Header */}
      <header className={styles.headerHud}>
        <div className={styles.headerHudTitle}>
          <h1>Decentralized Franchise Trade Hub</h1>
          <p>Govern franchise nodes, mint on-chain licenses, and trade spatial blueprints.</p>
        </div>
        <div className={styles.walletInfo}>
          {isAuthenticated && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: isGpsPolling ? 'rgba(0, 245, 212, 0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: isGpsPolling ? '#00f5d4' : 'rgba(255,255,255,0.08)', color: isGpsPolling ? '#00f5d4' : '#cbd5e1', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s', marginRight: '0.6rem' }}>
              <input
                type="checkbox"
                checked={isGpsPolling}
                onChange={e => setIsGpsPolling(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isGpsPolling ? '#00f5d4' : '#64748b', display: 'inline-block', boxShadow: isGpsPolling ? '0 0 5px #00f5d4' : 'none' }}></span>
              <span>{isGpsPolling ? 'GPS TRACKING: ACTIVE' : 'GPS TRACKING: STANDBY'}</span>
            </label>
          )}
          <span className={styles.walletAddress}>
            ⚡ {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
          </span>
          <span className={styles.walletBalance}>Mock Balance: 12.50 ETH</span>
        </div>
      </header>

      {/* Info Warning Alert */}
      <div className={`${styles.alert} ${styles.alertInfo}`}>
        🌐 <strong>Edge Node Gating Enabled:</strong> Registered facilities will automatically sync config tokens using 
        Lit Protocol decryption. You must maintain ownership of the corresponding license NFT on-chain to trigger active telemetry loops.
      </div>

      {/* Row 1: Franchise Licenses */}
      <h2 className={styles.sectionTitle}>1. Franchise Domain Licenses</h2>
      <div className={styles.grid}>
        {licenses.map((lic) => (
          <div key={lic.domain} className={`${styles.card} ${styles[lic.domain]}`}>
            <div className={styles.cardIcon}>{lic.icon}</div>
            <h3 className={styles.cardName}>{lic.name}</h3>
            <p className={styles.cardDescription}>{lic.description}</p>
            
            <div className={styles.cardStatus}>
              <div className={styles.statusIndicator}>
                <span className={`${styles.statusDot} ${lic.isMinted ? styles.statusDotActive : ''}`}></span>
                <span>{lic.isMinted ? `LICENSED (#${lic.tokenId})` : 'UNLICENSED'}</span>
              </div>
              {!lic.isMinted && <span className={styles.priceTag}>{lic.price}</span>}
            </div>

            {lic.isMinted ? (
              <button className={styles.btn} disabled style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'not-allowed' }}>
                License Owned
              </button>
            ) : (
              <button 
                onClick={() => handleMintLicense(lic.domain, lic.price)}
                className={`${styles.btn} ${styles['btn' + lic.domain.charAt(0).toUpperCase() + lic.domain.slice(1)]}`}
              >
                Mint License
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Row 2: Facility Enrollment (Register Facility) */}
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle} style={{ marginTop: 0 }}>2. Enroll Physical Node / Facility</h2>
        <form onSubmit={handleRegisterFacility}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="facilityName">Facility Name</label>
              <input 
                type="text" 
                id="facilityName" 
                placeholder="e.g. Pottsboro Solar Datacenter 01"
                value={newFacilityName}
                onChange={e => setNewFacilityName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facilityDomain">License Domain</label>
              <select 
                id="facilityDomain"
                value={newFacilityDomain}
                onChange={e => setNewFacilityDomain(e.target.value as any)}
              >
                <option value="space">Space (Climate Deflectors)</option>
                <option value="food">Food (Hydroponics / Domes)</option>
                <option value="energy">Energy (Grid Datacenter)</option>
                <option value="health">Health (Care Sanctuary)</option>
                <option value="dropship">Dropship (Bundle Drop Shipping)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facilityLocation">Geolocation / Address</label>
              <input 
                type="text" 
                id="facilityLocation" 
                placeholder="e.g. 33.784, -96.671 or Sherman, TX"
                value={newFacilityLocation}
                onChange={e => setNewFacilityLocation(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facilityCapacity">Maximum Resource Capacity</label>
              <input 
                type="text" 
                id="facilityCapacity" 
                placeholder="e.g. 120kW Compute or 4 Grow Domes"
                value={newFacilityCapacity}
                onChange={e => setNewFacilityCapacity(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facilityIp">Edge Node IP Address</label>
              <input 
                type="text" 
                id="facilityIp" 
                placeholder="e.g. 192.168.1.105"
                value={newFacilityIp}
                onChange={e => setNewFacilityIp(e.target.value)}
              />
            </div>
          </div>

          {/* Point of Contact 2: Balancing Strategy Preference Question */}
          {!preferences.balancingStrategy && (
            <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(0, 245, 212, 0.25)', borderRadius: '10px', padding: '1.25rem', margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#00f5d4', fontFamily: 'monospace', fontWeight: 'bold' }}>
                ❓ SENSOR BALANCING QUESTIONNAIRE
              </span>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Select your node's default load-balancing override strategy preference:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'autonomous', label: 'Autonomous Shifting', desc: 'Auto-migrates containers on charge drops' },
                  { id: 'manual', label: 'Manual Override', desc: 'Requires manual signature to reroute' },
                  { id: 'staking', label: 'Staking Credits', desc: 'Balances loads using token stakes' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updatePreference('balancingStrategy', opt.id);
                      setExplainerContent(STRATEGY_EXPLAINERS[opt.id as keyof typeof STRATEGY_EXPLAINERS]);
                      addLedgerEvent('INFO', `Registered grid override strategy preference: ${opt.label.toUpperCase()}`);
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('y8_user_action', {
                          detail: {
                            type: 'balancingStrategy',
                            value: opt.id,
                            source: `Balancing Strategy Selection: "${opt.label}"`
                          }
                        }));
                      }
                    }}
                    style={{ flex: '1 1 180px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.6rem', color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.15rem', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#00f5d4'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#00f5d4' }}>{opt.label}</span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Google Earth Satellite Coordinate Selector Map */}
          <div className={styles.mapWrapper}>
            <div className={styles.mapSearchRow}>
              <input 
                type="text" 
                className={styles.mapSearchInput} 
                placeholder="Search location... (e.g. Sherman, TX or London)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleLocationSearch(e);
                  }
                }}
              />
              <button 
                type="button" 
                className={styles.mapSearchBtn}
                onClick={handleLocationSearch}
              >
                🔍 Lock Location
              </button>
            </div>
            
            <div ref={mapElementRef} className={styles.mapContainer}></div>
            
            <div className={styles.mapHudOverlay}>
              <div className={styles.mapHudItem}>
                <span className={styles.mapHudLabel}>Latitude:</span>
                <span className={styles.mapHudValue}>{selectedLat.toFixed(5)}°</span>
              </div>
              <div className={styles.mapHudItem}>
                <span className={styles.mapHudLabel}>Longitude:</span>
                <span className={styles.mapHudValue}>{selectedLng.toFixed(5)}°</span>
              </div>
              <div className={styles.mapHudItem}>
                <span className={styles.mapHudLabel}>Elevation:</span>
                <span className={styles.mapHudValue}>{elevation} m</span>
              </div>
              <div className={styles.mapHudItem}>
                <span className={styles.mapHudLabel}>Address:</span>
                <span className={styles.mapHudValue} style={{ maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={reverseGeocodedAddress}>
                  {reverseGeocodedAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Capability Estimation Engine Panel */}
          <div className={styles.estimationSection}>
            <div className={styles.estimationHeader}>
              <div className={styles.estimationTitle}>
                <span>📊 Capability Sizing & Yield Estimation</span>
                <span className={styles.estimationBadge}>{newFacilityDomain.toUpperCase()} FACILITY</span>
              </div>
              <span className={styles.walletBalance}>
                Based on {selectedLat.toFixed(4)}°, {selectedLng.toFixed(4)}°
                {preferences.balancingStrategy && ` | Strategy: ${preferences.balancingStrategy.toUpperCase()}`}
              </span>
            </div>
            
            <div className={styles.estimationGrid}>
              <div className={styles.estimationCard}>
                <span className={styles.estCardTitle}>Solar Peak Irradiance</span>
                <span className={styles.estCardValue}>{getEstimation().peakSunHours}</span>
                <span className={styles.estCardMetric}>
                  <span>Solar Intensity:</span>
                  <span className={styles.estCardMetricValue}>kW/m²/day</span>
                </span>
              </div>

              <div className={styles.estimationCard}>
                <span className={styles.estCardTitle}>Est. Annual Energy Yield</span>
                <span className={styles.estCardValue}>{getEstimation().annualSolarYield}</span>
                <span className={styles.estCardMetric}>
                  <span>Total yield:</span>
                  <span className={styles.estCardMetricValue}>MWh/year</span>
                </span>
              </div>

              <div className={styles.estimationCard}>
                <span className={styles.estCardTitle}>Energy Storage (Battery)</span>
                <span className={styles.estCardValue}>{getEstimation().storageNeeded}</span>
                <span className={styles.estCardMetric}>
                  <span>Backup required:</span>
                  <span className={styles.estCardMetricValue}>kWh</span>
                </span>
              </div>

              <div className={styles.estimationCard}>
                <span className={styles.estCardTitle}>Compute Power & Cooling</span>
                <span className={styles.estCardValue}>{getEstimation().maxComputeTflops} TFLOPS</span>
                <span className={styles.estCardMetric}>
                  <span>Est PUE: <strong style={{color: '#f8fafc'}}>{getEstimation().pue}</strong></span>
                  <span className={styles.estCardMetricValue}>{getEstimation().coolingTech}</span>
                </span>
              </div>

              <div className={styles.estimationCard}>
                <span className={styles.estCardTitle}>Maker-Space Dimensions</span>
                <span className={styles.estCardValue}>{getEstimation().floorAreaSqFt} sq ft</span>
                <span className={styles.estCardMetric}>
                  <span>Max Creators:</span>
                  <span className={styles.estCardMetricValue}>{getEstimation().concurrentCreators} users</span>
                </span>
              </div>

              <div className={styles.estimationCard}>
                <span className={styles.estCardTitle}>Mobility & Logistics</span>
                <span className={styles.estCardValue}>{getEstimation().bikePorts} ports</span>
                <span className={styles.estCardMetric}>
                  <span>Daily Rides: <strong style={{color: '#f8fafc'}}>{getEstimation().dailyRideCap}</strong></span>
                  <span className={styles.estCardMetricValue}>{getEstimation().fullChargeTimeHours}h full charge</span>
                </span>
              </div>

              <div className={styles.estimationCard}>
                <span className={styles.estCardTitle}>Dropship Logistics</span>
                <span className={styles.estCardValue}>{getEstimation().dropshipWeeklyCap} bundles</span>
                <span className={styles.estCardMetric}>
                  <span>Delay Coeff: <strong style={{color: '#f8fafc'}}>{getEstimation().dropshipDelayCoeff}x</strong></span>
                  <span className={styles.estCardMetricValue}>P2P Dropshipping</span>
                </span>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.btnSubmit} style={{ marginTop: '1.5rem' }}>Enroll Facility</button>
        </form>
      </div>

      <h2 className={styles.sectionTitle}>3. Registered Franchise Facilities</h2>
      {facilities.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No registered facilities found. Mint a license and register a physical node above to begin routing telemetry.</p>
        </div>
      ) : (
        <div className={styles.facilitiesGrid}>
          {facilities.map((fac) => (
            <div key={fac.id} className={styles.facilityCard}>
              <div className={styles.facilityHeader}>
                <h3 className={styles.facilityName}>{fac.name}</h3>
                <span className={`${styles.facilityBadge} ${styles['facilityBadge' + fac.domain.charAt(0).toUpperCase() + fac.domain.slice(1)]}`}>
                  {fac.domain.toUpperCase()}
                </span>
              </div>
              <div className={styles.facilityDetails}>
                <span><strong>Edge IP:</strong> <code>{fac.ipAddress}</code></span>
                <span><strong>Location:</strong> {fac.location}</span>
                {fac.latitude !== undefined && fac.longitude !== undefined && (
                  <span><strong>Coordinates:</strong> <code>{fac.latitude.toFixed(5)}, {fac.longitude.toFixed(5)}</code></span>
                )}
                <span><strong>Capacity:</strong> {fac.capacity}</span>
                {fac.estimates && (
                  <>
                    <span><strong>{fac.estimates.primaryUnit}:</strong> <code>{fac.estimates.primaryValue}</code></span>
                    <span><strong>{fac.estimates.secondaryUnit}:</strong> <code>{fac.estimates.secondaryValue}</code></span>
                    <span><strong>Est Suitability:</strong> <span style={{ color: '#00f5d4', fontWeight: 500 }}>{fac.estimates.suitability}</span></span>
                  </>
                )}
                <span><strong>System Status:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>ONLINE</span></span>
              </div>

              <div className={styles.facilityActions}>
                <button onClick={() => handleSimulateTelemetry(fac)} className={styles.btnSimulate}>
                  🔄 Simulate Telemetry Ping
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Row 4: Peer Marketplace */}
      <div className={styles.marketSection}>
        <div className={styles.marketTabs}>
          <button 
            className={`${styles.marketTabButton} ${activeMarketTab === 'buy' ? styles.marketTabButtonActive : ''}`}
            onClick={() => setActiveMarketTab('buy')}
          >
            🏪 Buy Goods & Blueprints
          </button>
          <button 
            className={`${styles.marketTabButton} ${activeMarketTab === 'sell' ? styles.marketTabButtonActive : ''}`}
            onClick={() => setActiveMarketTab('sell')}
          >
            ➕ Sell Assets / List Services
          </button>
        </div>

        {activeMarketTab === 'buy' ? (
          <div className={styles.marketGrid}>
            {marketItems.map((item) => (
              <div key={item.id} className={styles.marketCard}>
                <div className={styles.marketCardHeader}>
                  <span className={`${styles.marketCardCategory} ${styles['cat' + item.category.charAt(0).toUpperCase() + item.category.slice(1)]}`}>
                    {item.category} • {item.tradeType?.toUpperCase() || 'GOODS'}
                  </span>
                  <span className={styles.marketCardPrice}>{item.price}</span>
                </div>
                <h3 className={styles.marketCardTitle}>{item.title}</h3>
                <p className={styles.marketCardDesc}>{item.description}</p>
                <div className={styles.marketCardFooter}>
                  <span className={styles.sellerAddress}>Seller: {item.seller}</span>
                  {item.isBought ? (
                    <span className={styles.ownBadge}>Asset Unlocked</span>
                  ) : (
                    <button onClick={() => handlePurchaseItem(item)} className={styles.btnBuy}>
                      Buy Blueprint
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCreateListing}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="listingTitle">Asset / Service Title</label>
                <input 
                  type="text" 
                  id="listingTitle" 
                  placeholder="e.g. Solar Inverter Grid Relay Blueprint"
                  value={newListingTitle}
                  onChange={e => setNewListingTitle(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="listingPrice">Price (ETH)</label>
                <input 
                  type="number" 
                  id="listingPrice" 
                  step="0.01" 
                  min="0.001"
                  placeholder="e.g. 0.15"
                  value={newListingPrice}
                  onChange={e => setNewListingPrice(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="listingCategory">Multiverse Category</label>
                <select 
                  id="listingCategory"
                  value={newListingCategory}
                  onChange={e => setNewListingCategory(e.target.value as any)}
                >
                  <option value="space">Space</option>
                  <option value="food">Food</option>
                  <option value="energy">Energy</option>
                  <option value="health">Health</option>
                  <option value="dropship">Dropship</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="listingTradeType">Trade Type</label>
                <select 
                  id="listingTradeType"
                  value={newListingTradeType}
                  onChange={e => setNewListingTradeType(e.target.value as any)}
                >
                  <option value="goods">Goods / Blueprints</option>
                  <option value="labor">Franchise Labor</option>
                  <option value="service">Operational Service</option>
                  <option value="tool">Equipment / Tool Rental</option>
                  <option value="rideshare">Rideshare / Logistics</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="listingDesc">Asset Description</label>
              <textarea 
                id="listingDesc" 
                rows={3} 
                placeholder="Provide a detailed description of the blueprints, hardware units, or server scheduling credentials..."
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: 'white',
                  fontFamily: 'inherit'
                }}
                value={newListingDesc}
                onChange={e => setNewListingDesc(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.btnSubmit}>Publish Listing</button>
          </form>
        )}
      </div>

      {/* Row 5: Local Audit Ledger Terminal */}
      <div className={styles.ledgerContainer}>
        <div className={styles.ledgerHeader}>
          <div className={styles.ledgerTitle}>
            <span className={styles.ledgerBlink}></span>
            <span>FRANCHISE_AUDIT_LOG_TERMINAL v1.0.8</span>
          </div>
          <button onClick={handleClearLedger} className={styles.ledgerClear}>
            [CLEAR_LOGS]
          </button>
        </div>
        <div className={styles.ledgerTerminal}>
          {ledgerEvents.map((event, index) => (
            <div key={index} className={styles.ledgerRow}>
              <span className={styles.ledgerTime}>[{event.timestamp}]</span>
              <span className={styles.ledgerStatus}>[{event.type}]</span>
              <span className={styles.ledgerTx}> {event.message}</span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Cryptographic Web3 Pending Transaction Loading Screen */}
      <AnimatePresence>
        {transactionLoading && (
          <motion.div 
            className={styles.loadingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>{loadingText}</p>
          </motion.div>
        )}
      </AnimatePresence>
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
    </div>
  );
}
