"use client";

import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '../context/AuthContext';

// ─── Chain metadata ───────────────────────────────────────────────────────────

const BASE_MAINNET  = 8453;
const BASE_SEPOLIA  = 84532;
const BASE_CHAIN_IDS = new Set([BASE_MAINNET, BASE_SEPOLIA]);

const CHAIN_LABELS: Record<number, string> = {
  1:          'Mainnet',
  137:        'Polygon',
  10:         'Optimism',
  8453:       'Base',
  84532:      'Base Sepolia',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChainBadge({ chainId }: { chainId: number }) {
  const isBase = BASE_CHAIN_IDS.has(chainId);
  const label  = CHAIN_LABELS[chainId] ?? `Chain ${chainId}`;

  return (
    <span
      id="y8-chain-badge"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider ${
        isBase
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
          : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
      }`}
    >
      {isBase ? '⛓️' : '⚠️'} {label}
    </span>
  );
}

function Y8StatusDot({ active }: { active: boolean }) {
  return (
    <span
      id="y8-status-dot"
      title={active ? 'Signed in to Y8 Platform' : 'Y8 Platform: not signed in'}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-slate-500/10 text-slate-400 border-slate-500/25'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: 6, height: 6 }} />
      {active ? 'Y8 ✓' : 'Y8'}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * WalletConnect
 *
 * Renders the RainbowKit ConnectButton when disconnected, or a compact
 * status bar (address · chain · y8 status) when connected.
 *
 * Usage in Header:
 *   <WalletConnect />
 */
export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const chainId                  = useChainId();
  const { isY8Authenticated }    = useAuth();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        if (!ready) return <div aria-hidden="true" className="opacity-0" />;

        if (!account || !isConnected) {
          return (
            <button
              id="y8-connect-btn"
              onClick={openConnectModal}
              className="py-2 px-[18px] rounded-lg border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold text-sm cursor-pointer tracking-wider shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <div
            id="y8-wallet-status"
            className="flex items-center gap-2 py-1.5 px-3 rounded-[10px] bg-white/5 border border-white/10 backdrop-blur-md"
          >
            {/* Chain badge */}
            <button
              id="y8-chain-switch-btn"
              onClick={openChainModal}
              className="bg-none border-none cursor-pointer p-0"
              title="Switch chain"
            >
              <ChainBadge chainId={chain?.id ?? chainId} />
            </button>

            {/* Wallet address */}
            <button
              id="y8-account-btn"
              onClick={openAccountModal}
              className="bg-none border-none cursor-pointer p-0 font-mono text-[13px] font-medium text-inherit tracking-wider"
              title="Manage account"
            >
              {truncate(account.address)}
            </button>

            {/* Y8 platform status */}
            <Y8StatusDot active={isY8Authenticated} />
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
