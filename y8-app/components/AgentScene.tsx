'use client';

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { Html, OrbitControls, Stars, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Y8Agent } from '../lib/y8-client';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  alpha:    '#f5c518',   // gold
  beta:     '#7de8e8',   // cyan
  standard: '#6366f1',   // indigo
};

const STATUS_EMISSIVE: Record<string, string> = {
  active:         '#3b82f6',
  idle:           '#6366f1',
  paused:         '#475569',
  decommissioned: '#1e293b',
};

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// ─── Agent orb ────────────────────────────────────────────────────────────────

function AgentOrb({
  agent,
  position,
  isSelected,
  onClick,
}: {
  agent: Y8Agent;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const orbRef  = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  const color       = TIER_COLOR[agent.tier]    ?? '#6366f1';
  const emissive    = STATUS_EMISSIVE[agent.status] ?? '#1e293b';
  const alive       = agent.status === 'active';
  const score       = agent.performanceScore / 100; // 0-1
  const orbSize     = 0.28 + score * 0.14;          // bigger = better score
  const glowSize    = orbSize * 2.4;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!orbRef.current) return;

    // Breathing pulse for active agents
    const pulse = alive ? 1 + 0.06 * Math.sin(t * 2.4) : 1;
    orbRef.current.scale.setScalar(pulse * (isSelected ? 1.25 : 1));

    // Halo spin
    if (haloRef.current) {
      haloRef.current.rotation.x = t * 0.6;
      haloRef.current.rotation.y = t * 0.9;
    }

    // Glow pulse
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        alive ? 0.06 + 0.04 * Math.sin(t * 2.4) : 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[glowSize, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Main orb */}
      <mesh ref={orbRef} onClick={onClick} castShadow>
        <sphereGeometry args={[orbSize, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={alive ? 0.55 : 0.15}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={agent.status === 'decommissioned' ? 0.35 : 1}
        />
      </mesh>

      {/* Halo ring */}
      {agent.status !== 'decommissioned' && (
        <mesh ref={haloRef}>
          <torusGeometry args={[orbSize * 1.45, 0.022, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={alive ? 0.75 : 0.3} />
        </mesh>
      )}

      {/* Point light emanating from orb */}
      {alive && (
        <pointLight color={color} intensity={0.5} distance={3} decay={2} />
      )}

      {/* Floating nameplate */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Html
          center
          position={[0, orbSize + 0.42, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          distanceFactor={5}
        >
          <div
            className="rounded-lg p-2 px-2.5 text-center backdrop-blur-md min-w-[120px]"
            style={{
              background:   'rgba(10,10,30,0.82)',
              border:       `1px solid ${color}44`,
              boxShadow:    `0 0 12px ${color}33`,
            }}
          >
            <div className="font-bold text-[11px] tracking-widest" style={{ color }}>
              {agent.tier.toUpperCase()}
            </div>
            <div className="text-slate-200 text-xs font-mono mt-0.5">
              {truncate(agent.walletAddress)}
            </div>
            <div className="mt-1 flex gap-1 justify-center items-center">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  alive ? 'bg-emerald-500' : agent.status === 'paused' ? 'bg-amber-500' : 'bg-slate-500'
                }`}
              />
              <span className="text-slate-400 text-[9px]">
                {agent.status} · {agent.currentLoad}/{agent.maxLoad}
              </span>
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// ─── Agent detail panel (2D overlay) ─────────────────────────────────────────

function AgentDetailPanel({
  agent,
  onClose,
}: {
  agent: Y8Agent;
  onClose: () => void;
}) {
  const color = TIER_COLOR[agent.tier] ?? '#6366f1';
  const score = agent.performanceScore;

  return (
    <div
      className="absolute top-0 right-0 w-[280px] h-full bg-slate-950/90 backdrop-blur-xl p-6 flex flex-col gap-4 overflow-y-auto z-50 transition-all duration-200"
      style={{
        borderLeft: `1px solid ${color}33`,
      }}
    >
      <button
        onClick={onClose}
        className="self-end bg-none border-none text-slate-500 hover:text-slate-300 cursor-pointer text-lg p-0"
      >✕</button>

      {/* Tier badge */}
      <div className="flex items-center gap-2.5">
        <div
          className="rounded-full flex items-center justify-center text-base"
          style={{
            width: 40, height: 40,
            background: `${color}22`,
            border: `2px solid ${color}`,
          }}
        >⬡</div>
        <div>
          <div className="font-bold text-[13px] tracking-widest" style={{ color }}>
            {agent.tier.toUpperCase()} AGENT
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            {truncate(agent.walletAddress)}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full inline-block ${
            agent.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{
            boxShadow: agent.status === 'active' ? '0 0 6px #22c55e' : 'none',
          }}
        />
        <span className="text-slate-200 text-[13px] capitalize">{agent.status}</span>
      </div>

      {/* Stats */}
      {[
        { label: 'Purpose',     value: agent.purpose },
        { label: 'Role',        value: agent.role },
        { label: 'Sessions',    value: `${agent.sessionsCompleted} / ${agent.sessionsHandled}` },
        { label: 'Revenue',     value: `$${agent.totalRevenue.toFixed(2)}` },
      ].map(({ label, value }) => (
        <div key={label}>
          <div className="text-slate-500 text-[10px] tracking-wider mb-0.5">
            {label.toUpperCase()}
          </div>
          <div className="text-slate-200 text-[13px]">{value}</div>
        </div>
      ))}

      {/* Performance score bar */}
      <div>
        <div className="text-slate-500 text-[10px] tracking-wider mb-1.5">
          PERFORMANCE
        </div>
        <div className="bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${score}%`,
              background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
            }}
          />
        </div>
        <div className="text-xs font-bold mt-1" style={{ color }}>{score}</div>
      </div>

      {/* Load bar */}
      <div>
        <div className="text-slate-500 text-[10px] tracking-wider mb-1.5">
          LOAD {agent.currentLoad}/{agent.maxLoad}
        </div>
        <div className="bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            style={{
              width: `${(agent.currentLoad / agent.maxLoad) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <div className="text-slate-500 text-[10px] tracking-wider mb-1.5">
          CAPABILITIES
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.map((cap) => (
            <span
              key={cap}
              className="py-0.5 px-2 rounded text-[10px] font-semibold"
              style={{
                background: `${color}18`,
                border: `1px solid ${color}33`,
                color,
              }}
            >{cap}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scene camera ─────────────────────────────────────────────────────────────

function SceneCamera({ target }: { target: THREE.Vector3 | null }) {
  const { camera } = useThree();

  useFrame(() => {
    if (target) {
      camera.position.lerp(
        new THREE.Vector3(target.x + 0, target.y + 1, target.z + 3.5),
        0.04,
      );
      camera.lookAt(target);
    }
  });

  return null;
}

// ─── Placeholder agent for empty state ───────────────────────────────────────

const DEMO_AGENT: Y8Agent = {
  id:                 'demo-0',
  walletAddress:      '0x0000000000000000000000000000000000000001',
  purpose:            'awaiting-registration',
  role:               'Unassigned',
  capabilities:       ['*'],
  status:             'idle',
  currentLoad:        0,
  maxLoad:            10,
  performanceScore:   0,
  tier:               'standard',
  sessionsHandled:    0,
  sessionsCompleted:  0,
  totalRevenue:       0,
  lastActivity:       Date.now(),
};

// ─── Main scene ───────────────────────────────────────────────────────────────

interface AgentSceneProps {
  agents: Y8Agent[];
  isLoading: boolean;
  error: string | null;
}

export default function AgentScene({ agents, isLoading, error }: AgentSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const displayAgents = agents.length > 0 ? agents : [DEMO_AGENT];
  const selectedAgent = displayAgents.find((a) => a.id === selectedId) ?? null;

  // Arrange agents in a circle
  const positions = useMemo<[number, number, number][]>(() => {
    const count  = displayAgents.length;
    const radius = Math.max(2.0, count * 0.45);
    return displayAgents.map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
    });
  }, [displayAgents]);

  const selectedPos = selectedId
    ? positions[displayAgents.findIndex((a) => a.id === selectedId)] ?? null
    : null;

  const cameraTarget = selectedPos
    ? new THREE.Vector3(...selectedPos)
    : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* CSS animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <Canvas
        shadows
        camera={{ position: [0, 2.5, 7], fov: 55 }}
        style={{ background: '#05050f' }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Stars */}
        <Stars radius={80} depth={40} count={3500} factor={3} saturation={0} fade speed={0.4} />

        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} castShadow />
        <pointLight position={[0, 6, 0]} intensity={0.4} color="#6366f1" />

        {/* Fog for depth */}
        <fog attach="fog" args={['#05050f', 12, 30]} />

        {/* Grid floor */}
        <gridHelper
          args={[20, 20, '#1e293b', '#0f172a']}
          position={[0, -1.2, 0]}
        />

        {/* Camera */}
        {cameraTarget ? (
          <SceneCamera target={cameraTarget} />
        ) : (
          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={14}
            autoRotate
            autoRotateSpeed={0.35}
            maxPolarAngle={Math.PI / 2.1}
          />
        )}

        {/* Agents */}
        <Suspense fallback={null}>
          {displayAgents.map((agent, i) => (
            <AgentOrb
              key={agent.id}
              agent={agent}
              position={positions[i]}
              isSelected={selectedId === agent.id}
              onClick={() => setSelectedId(selectedId === agent.id ? null : agent.id)}
            />
          ))}
        </Suspense>

        {/* Loading/empty state in canvas */}
        {isLoading && (
          <Html center>
            <div className="text-indigo-500 text-sm font-semibold">
              Loading agents…
            </div>
          </Html>
        )}
      </Canvas>

      {/* HUD overlay — top left */}
      <div className="absolute top-5 left-5 text-slate-400 text-[11px] font-mono leading-relaxed pointer-events-none">
        <div className="text-indigo-500 font-bold text-[13px] tracking-widest">
          Y8 · AGENT SPACE
        </div>
        <div>{displayAgents.length} agent{displayAgents.length !== 1 ? 's' : ''} registered</div>
        <div className="text-emerald-500">
          {displayAgents.filter((a) => a.status === 'active').length} active
        </div>
        {error && <div className="text-red-400 mt-1">⚠ {error}</div>}
        {agents.length === 0 && !isLoading && (
          <div className="text-amber-500 mt-1">
            No agents registered yet
          </div>
        )}
      </div>

      {/* Click hint */}
      {!selectedId && agents.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-500 text-[11px] font-mono pointer-events-none">
          click an agent to inspect · drag to orbit
        </div>
      )}

      {/* Detail panel */}
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
