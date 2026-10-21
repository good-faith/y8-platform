"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Wrench, Briefcase, Cpu, Car, MessageSquare, Compass, RefreshCw } from 'lucide-react';

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

interface PurchaseZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

interface UserProfile {
  address: string;
  digitalID: string;
  reputationStake: number;
  totalWeightedScore: number;
  totalStakeWeight: number;
  ratingCount: number;
}

interface GlobeVisualizerProps {
  pins: MapPinItem[];
  zones: PurchaseZone[];
  selectedPin: MapPinItem | null;
  onSelectPin: (pin: MapPinItem | null) => void;
  userCoords: { latitude: number; longitude: number } | null;
  profiles?: Record<string, UserProfile>;
}

export default function GlobeVisualizer({
  pins,
  zones,
  selectedPin,
  onSelectPin,
  userCoords,
  profiles
}: GlobeVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Set camera default angles to center on Texas (approx lat 31.5, lon -97.5)
  const angleXRef = useRef<number>(0.55); // Latitude rotation
  const angleYRef = useRef<number>(1.7);   // Longitude rotation
  const zoomRef = useRef<number>(1.6);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef({ x: 0, y: 0, angleX: 0, angleY: 0 });
  const [hoveredItem, setHoveredItem] = useState<{ type: 'pin' | 'zone'; item: any; sx: number; sy: number } | null>(null);

  // Auto-rotation toggle
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const autoRotateRef = useRef<boolean>(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Project spherical lat/lon to 3D, then project to 2D screen space
  const project = (lat: number, lon: number, radius: number, width: number, height: number) => {
    // Convert to radians
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    // Spherical coordinates
    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lonRad);

    // Apply rotation around Y-axis (longitude)
    let x1 = x * Math.cos(angleYRef.current) - z * Math.sin(angleYRef.current);
    let z1 = x * Math.sin(angleYRef.current) + z * Math.cos(angleYRef.current);

    // Apply rotation around X-axis (latitude)
    let y2 = y * Math.cos(angleXRef.current) - z1 * Math.sin(angleXRef.current);
    let z2 = y * Math.sin(angleXRef.current) + z1 * Math.cos(angleXRef.current);

    // Screen projection (Orthographic)
    const centerX = width / 2;
    const centerY = height / 2;
    const screenX = centerX + x1 * zoomRef.current;
    const screenY = centerY - y2 * zoomRef.current;

    return {
      x: screenX,
      y: screenY,
      visible: z2 > 0, // Visible on the front-facing hemisphere
      depth: z2
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const radius = 110;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Draw background space glow
      const bgGlow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 2);
      bgGlow.addColorStop(0, 'rgba(13, 17, 23, 0.9)');
      bgGlow.addColorStop(0.6, 'rgba(10, 13, 20, 0.4)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw active atmosphere/glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * zoomRef.current, 0, Math.PI * 2);
      const atmosGlow = ctx.createRadialGradient(cx, cy, radius * zoomRef.current * 0.95, cx, cy, radius * zoomRef.current * 1.05);
      atmosGlow.addColorStop(0, 'rgba(0, 245, 212, 0.05)');
      atmosGlow.addColorStop(0.5, 'rgba(0, 245, 212, 0.25)');
      atmosGlow.addColorStop(1, 'rgba(0, 245, 212, 0)');
      ctx.strokeStyle = atmosGlow;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw Globe Base (backside shading)
      ctx.beginPath();
      ctx.arc(cx, cy, radius * zoomRef.current, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fill();

      // Draw wireframe grid lines
      ctx.lineWidth = 0.5;
      
      // Draw Latitude Rings
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath();
        let prevPt = null;
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lat, lon, radius, width, height);
          if (pt.visible) {
            if (!prevPt || !prevPt.visible) {
              ctx.moveTo(pt.x, pt.y);
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
          prevPt = pt;
        }
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.08)';
        ctx.stroke();
      }

      // Draw Longitude Rings (Meridians)
      for (let lon = -180; lon < 180; lon += 15) {
        ctx.beginPath();
        let prevPt = null;
        for (let lat = -90; lat <= 90; lat += 5) {
          const pt = project(lat, lon, radius, width, height);
          if (pt.visible) {
            if (!prevPt || !prevPt.visible) {
              ctx.moveTo(pt.x, pt.y);
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
          prevPt = pt;
        }
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.08)';
        ctx.stroke();
      }

      // Project and draw Safe Purchase Zone Node circles
      zones.forEach(zone => {
        const pt = project(zone.latitude, zone.longitude, radius, width, height);
        if (pt.visible) {
          // Inner dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#00f5d4';
          ctx.fill();

          // Pulse ring (animation based on timestamp)
          const pulseSize = 4 + (Date.now() % 2000) / 160;
          const alpha = 1 - (Date.now() % 2000) / 2000;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pulseSize, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 245, 212, ${alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '700 8px monospace';
          ctx.fillText(zone.name.split(' (')[0], pt.x + 8, pt.y + 3);
        }
      });

      // Draw P2P connection vectors (connecting pins to nearest zones)
      pins.forEach(pin => {
        const pt = project(pin.latitude, pin.longitude, radius, width, height);
        // Find nearest zone to connect to
        const nearestZone = zones.find(z => z.name.toLowerCase().includes(pin.zoneName.split(' ')[0].toLowerCase())) || zones[0];
        const zonePt = project(nearestZone.latitude, nearestZone.longitude, radius, width, height);

        if (pt.visible && zonePt.visible) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(zonePt.x, zonePt.y);
          ctx.strokeStyle = pin.type.includes('ride') ? 'rgba(236, 72, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Project and draw User Location GPS Beacon
      if (userCoords) {
        const userPt = project(userCoords.latitude, userCoords.longitude, radius, width, height);
        if (userPt.visible) {
          ctx.beginPath();
          ctx.arc(userPt.x, userPt.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();

          // Blinking dot
          const pulse = 6 + (Date.now() % 1500) / 100;
          const userAlpha = 1 - (Date.now() % 1500) / 1500;
          ctx.beginPath();
          ctx.arc(userPt.x, userPt.y, pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${userAlpha * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('YOU (GPS)', userPt.x + 10, userPt.y - 4);
        }
      }

      // Project and draw Job Pins
      pins.forEach(pin => {
        const pt = project(pin.latitude, pin.longitude, radius, width, height);
        const isSelected = selectedPin && selectedPin.id === pin.id;

        if (pt.visible) {
          // Color based on type
          let color = '#ec4899'; // rideshare = pink
          if (pin.type === 'craigslist') color = '#f97316'; // Craigslist = orange
          else if (pin.type.includes('labor')) color = '#f59e0b'; // labor = orange
          else if (pin.type.includes('tool')) color = '#10b981'; // tool = green
          else if (pin.type.includes('service')) color = '#3b82f6'; // service = blue
          else if (pin.type.includes('general')) color = '#cbd5e1'; // general = gray

          // Draw Pin Shape (Triangle)
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - 7);
          ctx.lineTo(pt.x + 5, pt.y + 3);
          ctx.lineTo(pt.x - 5, pt.y + 3);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();

          // Selection highlight circle
          if (isSelected) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y - 2, 10, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Pulsing select ring
            const innerPulse = 10 + (Date.now() % 1000) / 80;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y - 2, innerPulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${pin.type.includes('ride') ? '236,72,153' : '245,158,11'}, 0.25)`;
            ctx.stroke();
          }

          // Blinking triangle tip dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y - 7, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      });

      // Render custom HUD text overlays
      ctx.fillStyle = 'rgba(0, 245, 212, 0.4)';
      ctx.font = '8px monospace';
      ctx.fillText(`ROTATION X: ${angleXRef.current.toFixed(2)} RAD | Y: ${angleYRef.current.toFixed(2)} RAD`, 10, height - 10);
      ctx.fillText(`ZOOM: ${zoomRef.current.toFixed(1)}X | PIN COUNT: ${pins.length}`, width - 130, height - 10);

      // Auto rotation increment
      if (autoRotateRef.current && !isDragging) {
        angleYRef.current = (angleYRef.current + 0.002) % (Math.PI * 2);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [pins, zones, selectedPin, isDragging, userCoords]);

  // Handle Dragging / Orbiting
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      angleX: angleXRef.current,
      angleY: angleYRef.current
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      // Update camera angles
      angleYRef.current = dragStartRef.current.angleY + dx * 0.008;
      angleXRef.current = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, dragStartRef.current.angleX - dy * 0.008));
      return;
    }

    // Hover detection hit testing (radius = 110)
    const radius = 110;
    const width = canvas.width;
    const height = canvas.height;
    
    let hitFound = false;

    // Test Pins
    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i];
      const pt = project(pin.latitude, pin.longitude, radius, width, height);
      if (pt.visible) {
        const dist = Math.hypot(mx - pt.x, my - (pt.y - 2));
        if (dist < 10) {
          setHoveredItem({ type: 'pin', item: pin, sx: pt.x, sy: pt.y });
          hitFound = true;
          break;
        }
      }
    }

    // Test Zones if no pin hovered
    if (!hitFound) {
      for (let i = 0; i < zones.length; i++) {
        const zone = zones[i];
        const pt = project(zone.latitude, zone.longitude, radius, width, height);
        if (pt.visible) {
          const dist = Math.hypot(mx - pt.x, my - pt.y);
          if (dist < 8) {
            setHoveredItem({ type: 'zone', item: zone, sx: pt.x, sy: pt.y });
            hitFound = true;
            break;
          }
        }
      }
    }

    if (!hitFound) {
      setHoveredItem(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredItem) {
      if (hoveredItem.type === 'pin') {
        onSelectPin(hoveredItem.item as MapPinItem);
      }
    } else {
      // Clear selection
      onSelectPin(null);
    }
  };

  const getSenderDisplay = (sender: string) => {
    if (!profiles) return sender;
    const key = sender.toLowerCase();
    const profile = profiles[key] || Object.values(profiles).find(p => p.digitalID.toLowerCase() === key || p.address.toLowerCase() === key);
    return profile && profile.digitalID ? profile.digitalID : sender;
  };

  const getPinIcon = (type: string) => {
    switch (type) {
      case 'craigslist': return <Compass className="h-4 w-4 text-orange-400" />;
      case 'offer_ride': return <Car className="h-4 w-4 text-pink-400" />;
      case 'find_ride': return <Compass className="h-4 w-4 text-pink-500" />;
      case 'offer_labor': return <Wrench className="h-4 w-4 text-amber-400" />;
      case 'request_labor': return <Briefcase className="h-4 w-4 text-amber-500" />;
      case 'tool_rental': return <Cpu className="h-4 w-4 text-emerald-400" />;
      default: return <MessageSquare className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPinLabel = (type: string) => {
    switch (type) {
      case 'craigslist': return 'Craigslist';
      case 'offer_ride': return 'Offer Ride';
      case 'find_ride': return 'Find Ride';
      case 'offer_labor': return 'Offer Labor';
      case 'request_labor': return 'Request Labor';
      case 'tool_rental': return 'Tool Rental';
      default: return 'P2P Listing';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      
      {/* Visual Globe Container */}
      <div style={{ position: 'relative', background: 'rgba(10, 13, 20, 0.4)', border: '1px solid rgba(0, 245, 212, 0.15)', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
        
        {/* Radar Overlay Controls */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
          <button 
            onClick={() => {
              angleXRef.current = 0.55;
              angleYRef.current = 1.7;
              zoomRef.current = 1.6;
            }}
            title="Reset to Texas SPZs"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', cursor: 'pointer' }}
          >
            🎯 CENTER
          </button>
          <button 
            onClick={() => setAutoRotate(prev => !prev)}
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0, 245, 212, 0.3)', color: autoRotate ? '#00f5d4' : '#64748b', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', cursor: 'pointer' }}
          >
            {autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}
          </button>
        </div>

        {/* Zoom Controls */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '0.3rem', zIndex: 10 }}>
          <button 
            onClick={() => { zoomRef.current = Math.min(3, zoomRef.current + 0.2); }}
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', width: '22px', height: '22px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            +
          </button>
          <button 
            onClick={() => { zoomRef.current = Math.max(0.8, zoomRef.current - 0.2); }}
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', width: '22px', height: '22px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            -
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={350}
          height={320}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          style={{ cursor: isDragging ? 'grabbing' : hoveredItem ? 'pointer' : 'grab', maxWidth: '100%' }}
        />

        {/* Hover Popup Overlay */}
        {hoveredItem && (
          <div style={{
            position: 'absolute',
            left: `${hoveredItem.sx + 15}px`,
            top: `${hoveredItem.sy - 20}px`,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #00f5d4',
            borderRadius: '6px',
            padding: '0.4rem 0.6rem',
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: '0 0 10px rgba(0, 245, 212, 0.3)',
            maxWidth: '240px'
          }}>
            {hoveredItem.type === 'pin' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 700, color: hoveredItem.item.type === 'craigslist' ? '#ff7a00' : '#00f5d4', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  {getPinIcon(hoveredItem.item.type)}
                  <span>{getPinLabel(hoveredItem.item.type)}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', marginBottom: '0.15rem' }}>
                  {hoveredItem.item.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  <span style={{ color: '#64748b', fontFamily: 'monospace' }}>BY:</span> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{getSenderDisplay(hoveredItem.item.sender)}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1', wordBreak: 'break-word' }}>
                  <span style={{ color: '#64748b', fontFamily: 'monospace' }}>OFFER:</span> {hoveredItem.item.offering.length > 50 ? hoveredItem.item.offering.slice(0, 47) + '...' : hoveredItem.item.offering}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#00f5d4', fontWeight: 'bold' }}>
                  <span style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: 'normal' }}>WANT:</span> {hoveredItem.item.lookingFor}
                </div>
                <div style={{ fontSize: '0.58rem', color: '#64748b', fontFamily: 'monospace', marginTop: '0.1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.15rem' }}>
                  🖰 Click to lock selection
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  <ShieldCheck className="h-3.5 w-3.5 inline text-purple-400" /> Safe Zone
                </div>
                <div style={{ fontSize: '0.8rem', color: '#e9d5ff', fontWeight: 600, marginTop: '0.15rem' }}>{hoveredItem.item.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.15rem', lineHeight: '1.2' }}>{hoveredItem.item.description}</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected Job HUD Details Overlay */}
      {selectedPin ? (
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(0, 245, 212, 0.25)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <button 
            onClick={() => onSelectPin(null)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}
          >
            ×
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getPinIcon(selectedPin.type)}
            <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: selectedPin.type.includes('ride') ? '#ec4899' : '#f59e0b', textTransform: 'uppercase' }}>
              {getPinLabel(selectedPin.type)}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', marginLeft: 'auto' }}>
              {selectedPin.timestamp}
            </span>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{selectedPin.title}</h4>
          
          <div style={{ margin: '0.25rem 0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>
              <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>OFFERING: </span>
              <span style={{ color: '#cbd5e1' }}>{selectedPin.offering}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>LOOKING FOR: </span>
              <span style={{ color: '#00f5d4', fontWeight: 600 }}>{selectedPin.lookingFor}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>POSTED VIA: </span>
              <span style={{ color: '#a78bfa', fontFamily: 'monospace', fontSize: '0.75rem' }}>{selectedPin.zoneName}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>OPERATOR: </span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {(() => {
                  const profile = profiles ? (profiles[selectedPin.sender.toLowerCase()] || profiles[selectedPin.sender] || Object.values(profiles).find(p => p.digitalID === selectedPin.sender) || {
                    address: selectedPin.sender,
                    digitalID: '',
                    reputationStake: 0,
                    totalWeightedScore: 0,
                    totalStakeWeight: 0,
                    ratingCount: 0
                  }) : null;
                  const repScore = profile && profile.ratingCount > 0 && profile.totalStakeWeight > 0
                    ? (profile.totalWeightedScore / profile.totalStakeWeight).toFixed(1) + '%'
                    : '100.0%';
                  return profile && profile.digitalID 
                    ? `${profile.digitalID} (${repScore} Rep | ${profile.reputationStake} REP)` 
                    : selectedPin.sender;
                })()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(15, 23, 42, 0.2)',
          border: '1px dashed rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <Compass className="h-6 w-6 text-teal-400 opacity-60" />
          <span>Google Earth Hologram HUD Standby</span>
          <span style={{ fontSize: '0.7rem', color: '#475569' }}>Click pins on the 3D grid sphere to view live ride & labor proposals.</span>
        </div>
      )}
    </div>
  );
}
