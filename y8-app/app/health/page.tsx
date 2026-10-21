"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Key, Shield, Bike, Star, Sparkles, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function HealthSanctuaryPage() {
  const { isAuthenticated, isLoading, preferences, updatePreference } = useAuth();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bikeBattery, setBikeBattery] = useState(88);
  const [rating, setRating] = useState(98);
  const [logs, setLogs] = useState<string[]>([
    "[BOOT] Sanctuary Care & Micro-Mobility coordinator online.",
    "[INFO] Initializing biometric smart lock telemetry...",
    "[INFO] Connecting to regional DID sovereign identity vaults.",
    "[AI SWARM] Transit coordinator standing by for booking schedules..."
  ]);

  const triggerBooking = () => {
    toast.success("AI Swarm: Cabin booked and biometric access code generated!");
    setLogs(prev => [
      ...prev,
      `[USER ACTION] Cabin cabin slot booking requested.`,
      `[INFO] Validating sovereign DID access signatures...`,
      `[SUCCESS] Slot 3 booked at Austin Sanctuary Pod.`,
      `[INFO] Biometric gate unlock code sent: 482-991-A.`,
      `[BIKE LOG] E-Bike #42 locked/reserved (est. range: 45 miles).`
    ]);
    setBookingConfirmed(true);
    setBikeBattery(prev => Math.max(prev - 5, 80));
    setRating(prev => Math.min(prev + 1, 100));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#94a3b8' }}>
        <p>Loading Sector Data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', color: '#f8fafc', minHeight: '80vh', fontFamily: 'var(--font-inter)' }}>
      {/* Back to Command Deck */}
      <button 
        onClick={() => router.push('/')}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.88rem', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#e91e63'}
        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
      >
        <ArrowLeft size={16} /> BACK TO COMMAND CENTER
      </button>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.15) 0%, rgba(194, 24, 91, 0.05) 100%)', border: '1px solid rgba(233, 30, 99, 0.3)', borderRadius: '16px', padding: '2.5rem', backdropFilter: 'blur(12px)', boxShadow: '0 0 30px rgba(233,30,99,0.08)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🏥</span>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#e91e63', fontFamily: 'var(--font-poppins)', margin: 0 }}>
                Sanctuary Care & Micro-Mobility
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Operational Sector: Biometric Smart Lock Booking, Micro-Mobility Logistics, and P2P Reputation Stakes.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '800px' }}>
            Sanctuary Care coordinates physical cabin slot bookings with biometric smart locks and micro-mobility e-bike logistics. Smart contracts manage access validation based on decentralized identities (DIDs) and local P2P ratings.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                updatePreference('primaryDomain', 'health');
                toast.success("Sanctuary Care & Micro-Mobility set as your primary operations domain.");
              }}
              style={{ background: preferences.primaryDomain === 'health' ? '#e91e63' : 'rgba(233, 30, 99, 0.1)', border: '1px solid #e91e63', color: preferences.primaryDomain === 'health' ? '#090d16' : '#e91e63', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s' }}
            >
              {preferences.primaryDomain === 'health' ? '★ Primary Operations Domain Set' : 'Set as Primary Sector'}
            </button>
          </div>
        </motion.div>

        {/* Stats and Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Health Stat 1 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(233, 30, 99, 0.1)', color: '#e91e63' }}>
              <Key size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>BIOMETRIC CABIN ACCESS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                {bookingConfirmed ? 'ACTIVE (CODE: 482-991-A)' : 'STANDBY (NO BOOKINGS)'}
              </div>
            </div>
          </div>

          {/* Health Stat 2 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(233, 30, 99, 0.1)', color: '#e91e63' }}>
              <Bike size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>RESERVED E-BIKE BATTERY</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{bikeBattery}%</div>
            </div>
          </div>

          {/* Health Stat 3 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(233, 30, 99, 0.1)', color: '#e91e63' }}>
              <Star size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>OPERATOR REP WEIGHT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{rating}% <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>(EXCELLENT)</span></div>
            </div>
          </div>
        </div>

        {/* Live Controller Console and Simulated Terminal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Controller Card */}
          <div style={{ background: 'rgba(9, 13, 22, 0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e91e63', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', margin: 0, fontFamily: 'var(--font-poppins)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} /> Cabin Logistics HUD
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Book an Austin sanctuary care slot manually and coordinate micro-mobility e-bike fleet access parameters.
            </p>

            <button
              onClick={triggerBooking}
              style={{ background: 'rgba(233, 30, 99, 0.15)', border: '1px solid #e91e63', color: '#e91e63', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(233, 30, 99, 0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(233, 30, 99, 0.15)'}
            >
              <Sparkles size={16} /> Book Cabin & E-Bike
            </button>
          </div>

          {/* Terminal Console */}
          <div style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: 0, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💻</span> Swarm Execution Console
            </h2>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ borderLeft: '2px solid #e91e63', paddingLeft: '0.6rem', lineHeight: '1.4' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
