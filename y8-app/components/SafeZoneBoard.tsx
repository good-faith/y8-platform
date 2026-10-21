"use client";

import React, { useState } from 'react';
import { Car, Wrench, Cpu, Briefcase, MessageSquare, Eye, CheckCircle, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

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

interface UserProfile {
  address: string;
  digitalID: string;
  reputationStake: number;
  totalWeightedScore: number;
  totalStakeWeight: number;
  ratingCount: number;
}

interface SafeZoneBoardProps {
  pins: MapPinItem[];
  userCoords: { latitude: number; longitude: number } | null;
  onSelectPin: (pin: MapPinItem | null) => void;
  onAcceptPin: (pinId: string) => void;
  currentWallet: string;
  profiles?: Record<string, UserProfile>;
  onRatePeer?: (peerAddress: string, score: number) => void;
  onCompletePin?: (pinId: string) => void;
}

export default function SafeZoneBoard({
  pins,
  userCoords,
  onSelectPin,
  onAcceptPin,
  currentWallet,
  profiles,
  onRatePeer,
  onCompletePin
}: SafeZoneBoardProps) {
  const [boardFilter, setBoardFilter] = useState<'all' | 'rideshare' | 'labor' | 'tool' | 'service'>('all');

  // Helper: Haversine distance math
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getPinIcon = (type: string) => {
    switch (type) {
      case 'offer_ride': return <Car className="h-4 w-4 text-pink-400" />;
      case 'find_ride': return <Car className="h-4 w-4 text-pink-500" />;
      case 'offer_labor': return <Wrench className="h-4 w-4 text-amber-400" />;
      case 'request_labor': return <Briefcase className="h-4 w-4 text-amber-500" />;
      case 'tool_rental': return <Cpu className="h-4 w-4 text-emerald-400" />;
      default: return <MessageSquare className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPinBadgeStyle = (type: string) => {
    if (type.includes('ride')) return { background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', color: '#ec4899' };
    if (type.includes('labor')) return { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' };
    if (type.includes('tool')) return { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' };
    return { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6' };
  };

  const getCleanLabel = (type: string) => {
    switch (type) {
      case 'offer_ride': return 'Offer Ride';
      case 'find_ride': return 'Find Ride';
      case 'offer_labor': return 'Offer Labor';
      case 'request_labor': return 'Request Labor';
      case 'tool_rental': return 'Tool Rental';
      default: return 'Job Listing';
    }
  };

  // Filter listings based on board tab selection
  const filteredPins = pins.filter(pin => {
    if (boardFilter === 'all') return true;
    if (boardFilter === 'rideshare') return pin.type.includes('ride');
    if (boardFilter === 'labor') return pin.type.includes('labor');
    if (boardFilter === 'tool') return pin.type.includes('tool');
    if (boardFilter === 'service') return pin.type.includes('service');
    return true;
  });

  const formattedWallet = (address: string) => {
    if (address.length > 10) {
      return address.slice(0, 6) + '...' + address.slice(-4);
    }
    return address;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      
      {/* Board Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {(['all', 'rideshare', 'labor', 'tool', 'service'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setBoardFilter(tab)}
            style={{
              background: boardFilter === tab ? 'rgba(0, 245, 212, 0.1)' : 'transparent',
              border: '1px solid',
              borderColor: boardFilter === tab ? '#00f5d4' : 'transparent',
              color: boardFilter === tab ? '#00f5d4' : '#64748b',
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Board Body Scroll Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '280px', paddingRight: '0.25rem' }}>
        {filteredPins.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            No active listings found matching filter.
          </div>
        ) : (
          filteredPins.map(pin => {
            const distance = userCoords 
              ? calculateDistance(userCoords.latitude, userCoords.longitude, pin.latitude, pin.longitude)
              : null;
            
            const isCreator = currentWallet.toLowerCase().includes(pin.sender.replace('...', '').toLowerCase()) ||
                              (profiles && Object.keys(profiles).some(k => k.toLowerCase() === currentWallet.toLowerCase() && profiles[k].digitalID === pin.sender));
            const isAccepted = pin.status === 'Accepted';
            const isCompleted = pin.status === 'Completed';
            
            const profile = profiles ? (profiles[pin.sender.toLowerCase()] || profiles[pin.sender] || Object.values(profiles).find(p => p.digitalID === pin.sender) || {
              address: pin.sender,
              digitalID: '',
              reputationStake: 0,
              totalWeightedScore: 0,
              totalStakeWeight: 0,
              ratingCount: 0
            }) : null;

            const repScore = profile && profile.ratingCount > 0 && profile.totalStakeWeight > 0
              ? (profile.totalWeightedScore / profile.totalStakeWeight).toFixed(1) + '%'
              : '100.0%';

            // Determine if the current user can rate this peer
            const raterProfile = profiles ? (profiles[currentWallet.toLowerCase()] || Object.values(profiles).find(p => p.address.toLowerCase() === currentWallet.toLowerCase())) : null;
            const canRate = raterProfile && raterProfile.digitalID && profile && profile.digitalID && pin.sender.toLowerCase() !== currentWallet.toLowerCase() && !isCreator;

            return (
              <div 
                key={pin.id}
                style={{
                  background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : isAccepted ? 'rgba(255,255,255,0.01)' : 'rgba(15, 23, 42, 0.3)',
                  border: '1px solid',
                  borderColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : isAccepted ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  opacity: isCompleted ? 0.6 : isAccepted ? 0.75 : 1,
                  transition: 'border-color 0.2s'
                }}
              >
                
                {/* Header elements */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    ...getPinBadgeStyle(pin.type),
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}>
                    {getPinIcon(pin.type)}
                    {getCleanLabel(pin.type)}
                  </span>

                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                    @{pin.zoneName.split(' ')[0]} Node
                  </span>

                  {distance !== null && (
                    <span style={{ fontSize: '0.65rem', color: '#00f5d4', fontFamily: 'monospace', marginLeft: 'auto' }}>
                      📍 {distance.toFixed(1)} miles
                    </span>
                  )}
                </div>

                {/* Title and details */}
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
                  {pin.title}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <div>
                    <span style={{ color: '#475569', fontWeight: 'bold', fontSize: '0.7rem', fontFamily: 'monospace' }}>OFFER:</span> {pin.offering}
                  </div>
                  <div>
                    <span style={{ color: '#475569', fontWeight: 'bold', fontSize: '0.7rem', fontFamily: 'monospace' }}>NEED:</span> {pin.lookingFor}
                  </div>
                </div>

                {/* Actions & Creator Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '0.4rem', marginTop: '0.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <span>Operator:</span>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>
                      {profile && profile.digitalID ? profile.digitalID : formattedWallet(pin.sender)}
                    </span>
                    {profile && profile.digitalID && (
                      <span style={{ color: '#a78bfa' }}>
                        ({repScore} Rep | {profile.reputationStake} REP)
                      </span>
                    )}

                    {canRate && (
                      <span style={{ display: 'inline-flex', gap: '0.2rem', marginLeft: '0.4rem', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Rate:</span>
                        <button
                          onClick={() => onRatePeer && onRatePeer(pin.sender, 100)}
                          title="Trust peer (100% rating)"
                          style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '1px 4px', borderRadius: '3px', fontSize: '0.6rem', cursor: 'pointer', fontFamily: 'monospace' }}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => onRatePeer && onRatePeer(pin.sender, 0)}
                          title="Distrust peer (0% rating)"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '1px 4px', borderRadius: '3px', fontSize: '0.6rem', cursor: 'pointer', fontFamily: 'monospace' }}
                        >
                          👎
                        </button>
                      </span>
                    )}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button
                      onClick={() => onSelectPin(pin)}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#cbd5e1',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      <Eye className="h-3 w-3" /> MAP
                    </button>

                    {isCompleted ? (
                      <span style={{
                        color: '#10b981',
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        padding: '0.2rem 0.4rem',
                        fontWeight: 'bold'
                      }}>
                        ✅ COMPLETED
                      </span>
                    ) : isAccepted ? (
                      isCreator ? (
                        <button
                          onClick={() => onCompletePin && onCompletePin(pin.id)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid #10b981',
                            color: '#10b981',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                          }}
                        >
                          COMPLETE JOB
                        </button>
                      ) : (
                        <span style={{
                          color: '#a78bfa',
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: '0.2rem 0.4rem'
                        }}>
                          <CheckCircle className="h-3.5 w-3.5 text-purple-400" /> ACCEPTED
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => onAcceptPin(pin.id)}
                        disabled={isCreator}
                        style={{
                          background: isCreator ? 'rgba(255,255,255,0.01)' : 'rgba(0, 245, 212, 0.1)',
                          border: '1px solid',
                          borderColor: isCreator ? 'rgba(255,255,255,0.03)' : '#00f5d4',
                          color: isCreator ? '#475569' : '#00f5d4',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          cursor: isCreator ? 'not-allowed' : 'pointer',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isCreator ? 'OWN LISTING' : 'ACCEPT'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
