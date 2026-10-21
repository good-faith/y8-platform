"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';
import styles from '../styles/Page.module.css';
import toast, { Toaster } from 'react-hot-toast';

const notify = (pageName: string) => toast(`You're visiting the ${pageName} page`);

const DOMAIN_EXPLAINERS = {
  space: {
    title: 'Space Climate Construction',
    icon: '🛡️',
    text: 'Space Climate Construction coordinates albedo modulation models and Lagrangian L1 orbital shield simulations. Operators manage parameters to deflect solar radiation, aiming to mitigate greenhouse heating cycles globally. The minted telemetry logs directly calculate carbon credit allocations.'
  },
  food: {
    title: 'Controlled Environment Food Domes',
    icon: '🌾',
    text: 'CEA Food Domes manage target resource flows (moisture, pH, NPK balance) in urban vertical farming installations. Hydroponics microclimates are controlled by AI scheduling loops. Logs are synchronized to trace food supply origin audits.'
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

export default function Home() {
  const { isAuthenticated, isLoading, user, preferences, updatePreference } = useAuth();
  const router = useRouter();
  const [explainerContent, setExplainerContent] = useState<{ title: string; text: string; icon: string } | null>(null);

  useEffect(() => { document.title = 'Home | Y8'; }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show main content if authenticated
  if (!isAuthenticated) {
    return null; // RouteGuard will handle redirect
  }

  return (
    <div className="page-content">
      {/* Use Dashboard component for user info */}
      {user && (
        <Dashboard />
      )}

      {/* Point of Contact 1: Initial Domain Selector Question */}
      {!preferences.primaryDomain && (
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 245, 212, 0.25)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#00f5d4', fontFamily: 'var(--font-poppins)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            🛰️ Operator Profile Initialization
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.2rem', lineHeight: '1.5' }}>
            Select your primary operations domain to learn about its technical implications and set your preference:
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'space', name: 'Space Climate', icon: '🛡️' },
              { id: 'food', name: 'CEA Food Domes', icon: '🌾' },
              { id: 'energy', name: 'Decentralized Grid', icon: '⚡' },
              { id: 'health', name: 'Sanctuary Care', icon: '🏥' }
            ].map(dom => (
              <button
                key={dom.id}
                onClick={() => {
                  updatePreference('primaryDomain', dom.id);
                  setExplainerContent(DOMAIN_EXPLAINERS[dom.id as keyof typeof DOMAIN_EXPLAINERS]);
                  toast.success(`Primary domain set to: ${dom.name}`);
                }}
                style={{ background: 'rgba(0, 245, 212, 0.03)', border: '1px solid rgba(0, 245, 212, 0.2)', color: '#00f5d4', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.03)'}
              >
                <span>{dom.icon}</span> {dom.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main navigation cards */}
      <div className={styles.grid}>
        <Link href="/space" onClick={() => notify('Space')} className={styles.linkWrapper}>
          <div 
            className={`${styles.card} ${styles.space}`}
            style={preferences.primaryDomain === 'space' ? { borderColor: '#00f5d4', boxShadow: '0 0 15px rgba(0,245,212,0.15)', position: 'relative' } : { position: 'relative' }}
          >
            Space
            {preferences.primaryDomain === 'space' && <span style={{ fontSize: '0.58rem', background: '#00f5d4', color: '#090d16', padding: '0.1rem 0.4rem', borderRadius: '4px', position: 'absolute', top: '10px', right: '10px', fontWeight: 'bold' }}>PRIMARY</span>}
          </div>
        </Link>
        
        <Link href="/food" onClick={() => notify('Food')} className={styles.linkWrapper}>
          <div 
            className={`${styles.card} ${styles.food}`}
            style={preferences.primaryDomain === 'food' ? { borderColor: '#00f5d4', boxShadow: '0 0 15px rgba(0,245,212,0.15)', position: 'relative' } : { position: 'relative' }}
          >
            Food
            {preferences.primaryDomain === 'food' && <span style={{ fontSize: '0.58rem', background: '#00f5d4', color: '#090d16', padding: '0.1rem 0.4rem', borderRadius: '4px', position: 'absolute', top: '10px', right: '10px', fontWeight: 'bold' }}>PRIMARY</span>}
          </div>
        </Link>
        
        <Link href="/energy" onClick={() => notify('Energy')} className={styles.linkWrapper}>
          <div 
            className={`${styles.card} ${styles.energy}`}
            style={preferences.primaryDomain === 'energy' ? { borderColor: '#00f5d4', boxShadow: '0 0 15px rgba(0,245,212,0.15)', position: 'relative' } : { position: 'relative' }}
          >
            Energy
            {preferences.primaryDomain === 'energy' && <span style={{ fontSize: '0.58rem', background: '#00f5d4', color: '#090d16', padding: '0.1rem 0.4rem', borderRadius: '4px', position: 'absolute', top: '10px', right: '10px', fontWeight: 'bold' }}>PRIMARY</span>}
          </div>
        </Link>
        
        <Link href="/health" onClick={() => notify('Health')} className={styles.linkWrapper}>
          <div 
            className={`${styles.card} ${styles.health}`}
            style={preferences.primaryDomain === 'health' ? { borderColor: '#00f5d4', boxShadow: '0 0 15px rgba(0,245,212,0.15)', position: 'relative' } : { position: 'relative' }}
          >
            Health
            {preferences.primaryDomain === 'health' && <span style={{ fontSize: '0.58rem', background: '#00f5d4', color: '#090d16', padding: '0.1rem 0.4rem', borderRadius: '4px', position: 'absolute', top: '10px', right: '10px', fontWeight: 'bold' }}>PRIMARY</span>}
          </div>
        </Link>
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
      
      <Toaster />
    </div>
  );
}
