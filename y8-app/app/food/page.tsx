"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, Droplets, Thermometer, ShieldAlert, Cpu, Sparkles, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function FoodDomePage() {
  const { isAuthenticated, isLoading, preferences, updatePreference } = useAuth();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const [waterLevel, setWaterLevel] = useState(82);
  const [humidity, setHumidity] = useState(58);
  const [temperature, setTemperature] = useState(24.5);
  const [ph, setPh] = useState(6.2);
  const [logs, setLogs] = useState<string[]>([
    "[BOOT] Controlled Agriculture Environment (CEA) interface online.",
    "[INFO] Initializing sensor arrays for Food Dome Node B...",
    "[INFO] Syncing target pH balance: 6.2 (NPK Index active).",
    "[AI SWARM] Crop controller agent listening on telemetry port 8081."
  ]);

  const triggerMistCycle = () => {
    toast.success("AI Swarm: Hydration mist cycle triggered!");
    setLogs(prev => [
      ...prev,
      `[USER ACTION] Mist hydration sequence manually requested.`,
      `[AI SWARM] Distributed 4.2 Liters of mist across crops.`,
      `[SUCCESS] Soil moisture normalized at 62.8%.`
    ]);
    setWaterLevel(prev => Math.max(prev - 2, 70));
    setHumidity(prev => Math.min(prev + 5, 80));
    setTemperature(prev => Math.max(prev - 0.5, 22));
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
          style={{ background: 'linear-gradient(135deg, rgba(153, 102, 51, 0.15) 0%, rgba(126, 84, 37, 0.05) 100%)', border: '1px solid rgba(153, 102, 51, 0.3)', borderRadius: '16px', padding: '2.5rem', backdropFilter: 'blur(12px)', boxShadow: '0 0 30px rgba(153,102,51,0.08)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🌾</span>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#996633', fontFamily: 'var(--font-poppins)', margin: 0 }}>
                Controlled Environment Food Domes
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Operational Sector: Urban Hydroponics, Aquaponics, and Microclimate Automation Loops.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '800px' }}>
            CEA Food Domes manage target nutrient flows (moisture, pH, NPK balance) in urban vertical farming installations. Hydroponics microclimates are controlled by AI scheduling loops to maximize yield and trace food supply origin audits.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                updatePreference('primaryDomain', 'food');
                toast.success("Controlled Agriculture Dome set as your primary operations domain.");
              }}
              style={{ background: preferences.primaryDomain === 'food' ? '#996633' : 'rgba(153, 102, 51, 0.1)', border: '1px solid #996633', color: preferences.primaryDomain === 'food' ? '#090d16' : '#996633', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s' }}
            >
              {preferences.primaryDomain === 'food' ? '★ Primary Operations Domain Set' : 'Set as Primary Sector'}
            </button>
          </div>
        </motion.div>

        {/* Stats and Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Hydroponics Stat 1 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(153, 102, 51, 0.1)', color: '#996633' }}>
              <Droplets size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>SOIL MOISTURE / HUMIDITY</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{humidity}%</div>
            </div>
          </div>

          {/* Hydroponics Stat 2 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(153, 102, 51, 0.1)', color: '#996633' }}>
              <Thermometer size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>TEMPERATURE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{temperature}°C</div>
            </div>
          </div>

          {/* Hydroponics Stat 3 */}
          <div style={{ background: 'rgba(9, 13, 22, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(153, 102, 51, 0.1)', color: '#996633' }}>
              <Leaf size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>SOIL pH BALANCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{ph} <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>(OPTIMAL)</span></div>
            </div>
          </div>
        </div>

        {/* Live Controller Console and Simulated Terminal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Controller Card */}
          <div style={{ background: 'rgba(9, 13, 22, 0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#996633', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', margin: 0, fontFamily: 'var(--font-poppins)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} /> Dome Control HUD
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Control ambient soil parameters manually or synchronize optimization scripts to allow scheduled AI agents to handle irrigation cycles.
            </p>
            <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '0.5rem', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                <span style={{ color: '#94a3b8' }}>Reservoir Water Level</span>
                <span style={{ color: '#f8fafc', fontWeight: 'bold', float: 'right' }}>{waterLevel}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${waterLevel}%`, background: '#996633', height: '100%' }}></div>
              </div>
            </div>

            <button
              onClick={triggerMistCycle}
              style={{ background: 'rgba(153, 102, 51, 0.15)', border: '1px solid #996633', color: '#996633', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(153, 102, 51, 0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(153, 102, 51, 0.15)'}
            >
              <Sparkles size={16} /> Trigger Hydration Mist Spray
            </button>
          </div>

          {/* Terminal Console */}
          <div style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: 0, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💻</span> Swarm Execution Console
            </h2>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ borderLeft: '2px solid #996633', paddingLeft: '0.6rem', lineHeight: '1.4' }}>
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
