"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Battery, Cpu, Activity, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function EnergyGridPage() {
  const { isAuthenticated, isLoading, preferences, updatePreference } = useAuth();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const [soc, setSoc] = useState(72); // State of charge
  const [activeContainers, setActiveContainers] = useState(4);
  const [loadBalancing, setLoadBalancing] = useState('autonomous');
  const [logs, setLogs] = useState<string[]>([
    "[BOOT] Decentralized Grid & Datacenter optimizer online.",
    "[INFO] Initializing energy node monitoring...",
    "[INFO] Connected to VPP (Virtual Power Plant) solar battery arrays.",
    "[AI SWARM] Load balancer monitoring battery State of Charge (SOC)..."
  ]);

  // Sync balancing style from preferences
  useEffect(() => {
    if (preferences.balancingStrategy) {
      setLoadBalancing(preferences.balancingStrategy);
    }
  }, [preferences.balancingStrategy]);

  const triggerMigration = () => {
    toast.success("AI Swarm: Compute container migration triggered!");
    setLogs(prev => [
      ...prev,
      `[USER ACTION] Workload migration manually requested.`,
      `[INFO] Querying grid batteries... Sherman Node SOC: 82% (High), Pottsboro Node SOC: 29% (Low).`,
      `[ACTION] Migrated 4 active GPU heavy container workloads to Sherman Node.`,
      `[SUCCESS] Workload migration completed. Computational grid balanced.`
    ]);
    setActiveContainers(6);
    setSoc(prev => Math.min(prev + 8, 95));
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
        onMouseEnter={e => e.currentTarget.style.color = '#00f5d4'}
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
          style={{ background: 'linear-gradient(135deg, rgba(37, 162, 68, 0.15) 0%, rgba(30, 134, 79, 0.05) 100%)', border: '1px solid rgba(52, 168, 83, 0.3)', borderRadius: '16px', padding: '2.5rem', backdropFilter: 'blur(12px)', boxShadow: '0 0 30px rgba(52,168,83,0.08)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>⚡</span>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#34A853', fontFamily: 'var(--font-poppins)', margin: 0 }}>
                Decentralized Grid & Datacenter
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Operational Sector: Virtual Power Plants, Solar Grid Balances, and High-Performance Compute Scheduling.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '800px' }}>
            Decentralized Grid systems coordinate Virtual Power Plant (VPP) energy assets (batteries, solar arrays) with edge datacenter compute loads. Heavy AI modeling container tasks migrate dynamically to regions with excess solar power to balance grid capacity.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                updatePreference('primaryDomain', 'energy');
                toast.success("Decentralized Grid & Datacenter set as your primary operations domain.");
              }}
              style={{ background: preferences.primaryDomain === 'energy' ? '#34A853' : 'rgba(52, 168, 83, 0.1)', border: '1px solid #34A853', color: preferences.primaryDomain === 'energy' ? '#090d16' : '#34A853', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s' }}
            >
              {preferences.primaryDomain === 'energy' ? '★ Primary Operations Domain Set' : 'Set as Primary Sector'}
            </button>
          </div>
        </motion.div>

        {/* Stats and Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Grid Stat 1 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(52, 168, 83, 0.1)', color: '#34A853' }}>
              <Battery size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>BATTERY RESERVE STATE (SOC)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{soc}%</div>
            </div>
          </div>

          {/* Grid Stat 2 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(52, 168, 83, 0.1)', color: '#34A853' }}>
              <Cpu size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>ACTIVE COMPUTE CONTAINERS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{activeContainers} / 8</div>
            </div>
          </div>

          {/* Grid Stat 3 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(52, 168, 83, 0.1)', color: '#34A853' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>GRID STRATEGY</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem', textTransform: 'uppercase', fontFamily: 'monospace' }}>{loadBalancing}</div>
            </div>
          </div>
        </div>

        {/* Live Controller Console and Simulated Terminal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Controller Card */}
          <div style={{ background: 'rgba(9, 13, 22, 0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#34A853', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', margin: 0, fontFamily: 'var(--font-poppins)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} /> Grid Control HUD
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Manually shift computational workloads across regions, or configure autonomous balancing parameters to let swarms migrate heavy modeling tasks automatically.
            </p>

            <button
              onClick={triggerMigration}
              style={{ background: 'rgba(52, 168, 83, 0.15)', border: '1px solid #34A853', color: '#34A853', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(52, 168, 83, 0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(52, 168, 83, 0.15)'}
            >
              <Sparkles size={16} /> Balance Compute Workload
            </button>
          </div>

          {/* Terminal Console */}
          <div style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: 0, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💻</span> Swarm Execution Console
            </h2>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ borderLeft: '2px solid #34A853', paddingLeft: '0.6rem', lineHeight: '1.4' }}>
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
