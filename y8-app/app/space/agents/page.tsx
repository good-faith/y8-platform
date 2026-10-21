'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useAgents } from '../../../hooks/useY8Agents';
import { useRouteAgent } from '../../../hooks/useY8Agents';
import { useAuth } from '../../../context/AuthContext';
import ServiceDock, { ServiceCategory, ServiceOption } from '../../../components/ServiceDock';

// Three.js — SSR disabled
const AgentScene = dynamic(() => import('../../../components/AgentScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#05050f', color: '#6366f1',
      fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.08em',
    }}>
      initializing scene…
    </div>
  ),
});

export default function AgentsSpacePage() {
  const { isAuthenticated, isY8Authenticated, user } = useAuth();
  const { agents, isLoading, error } = useAgents();
  const { route, isRouting }          = useRouteAgent();

  useEffect(() => { document.title = 'Agent Marketplace | Y8'; }, []);

  const [lastService, setLastService] = useState<string | null>(null);

  // ── Service dock → route an agent ─────────────────────────────────────────
  const handleServiceSelect = useCallback(
    async (category: ServiceCategory, option: ServiceOption) => {
      setLastService(`${category.icon} ${option.label}`);

      if (!isY8Authenticated) {
        toast.error('Sign in to Y8 Platform to dispatch an agent', { duration: 3000 });
        return;
      }

      const toastId = toast.loading(`Routing agent for: ${option.label}…`);
      const agent = await route({ service: option.action, priority: 'normal' });

      if (agent) {
        toast.success(
          `Agent ${agent.walletAddress.slice(0, 8)}… assigned to ${option.label}`,
          { id: toastId, duration: 4000 },
        );
      } else {
        toast.error('No agents available for this service right now', { id: toastId });
      }
    },
    [isY8Authenticated, route],
  );

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        'calc(100vh - 120px)',
      background:    '#05050f',
      color:         '#e2e8f0',
      fontFamily:    'monospace',
      position:      'relative',
    }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background:  '#0f172a',
            color:       '#e2e8f0',
            border:      '1px solid #1e293b',
            fontFamily:  'monospace',
            fontSize:    '13px',
          },
        }}
      />

      {/* ── Top bar ── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '10px 20px',
        borderBottom:   '1px solid #1e293b',
        flexShrink:     0,
        flexWrap:       'wrap',
        gap:            '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/space" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>
            ← Space
          </Link>
          <span style={{ color: '#1e293b' }}>|</span>
          <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
            AGENT SPACE
          </span>
          {isRouting && (
            <span style={{ color: '#f59e0b', fontSize: '11px', animation: 'pulse 1s infinite' }}>
              ⬡ routing…
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', flexWrap: 'wrap' }}>
          <span style={{ color: isAuthenticated ? '#22c55e' : '#ef4444' }}>
            {isAuthenticated ? '● Wallet' : '○ Wallet'}
          </span>
          <span style={{ color: isY8Authenticated ? '#6366f1' : '#475569' }}>
            {isY8Authenticated ? '● Y8' : '○ Y8'}
          </span>
          {user?.address && (
            <span style={{ color: '#475569' }}>
              {user.address.slice(0, 6)}…{user.address.slice(-4)}
            </span>
          )}
          <span style={{ color: '#1e293b' }}>|</span>
          {[
            { color: '#f5c518', label: 'alpha' },
            { color: '#7de8e8', label: 'beta' },
            { color: '#6366f1', label: 'standard' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span style={{ color: '#64748b' }}>{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Auth notice banners ── */}
      {!isAuthenticated && (
        <div style={{
          padding: '8px 20px', flexShrink: 0,
          background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)',
          color: '#fca5a5', fontSize: '12px',
        }}>
          ⚠ Connect your wallet to load live agent data
        </div>
      )}
      {!isY8Authenticated && isAuthenticated && (
        <div style={{
          padding: '8px 20px', flexShrink: 0,
          background: 'rgba(245,197,24,0.08)', borderBottom: '1px solid rgba(245,197,24,0.2)',
          color: '#fde68a', fontSize: '12px',
        }}>
          ⚠ Not signed in to Y8 Platform — service dispatch unavailable
        </div>
      )}
      {lastService && isY8Authenticated && (
        <div style={{
          padding: '6px 20px', flexShrink: 0,
          background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)',
          color: '#a5b4fc', fontSize: '11px',
        }}>
          Last dispatched: {lastService}
        </div>
      )}

      {/* ── 3D scene + service dock ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AgentScene agents={agents} isLoading={isLoading} error={error} />
        <ServiceDock onServiceSelect={handleServiceSelect} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
