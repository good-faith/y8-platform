'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Zap, Cpu, MapPin, Activity, Wifi, Battery, RefreshCw, ExternalLink, Award } from 'lucide-react';
import { useEntropy } from '../../../hooks/useEntropy';
import { Y8_ENTROPY_ABI } from '../../../hooks/useY8Settings';
import { Address } from 'viem';

const ENTROPY_CONTRACT_KEY = 'y8_entropy_contract';

function SensorBadge({ label, active, icon }: { label: string; active: boolean; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
      active
        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
        : 'bg-slate-50 border-slate-200 text-slate-400'
    }`}>
      {icon}
      <span>{label}</span>
      <span className={`w-2 h-2 rounded-full ml-auto ${
        active ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'
      }`} />
    </div>
  );
}

export default function EntropyPage() {
  useEffect(() => { document.title = 'Proof of Entropy | Y8'; }, []);

  const { address, isConnected } = useAccount();
  const { collect, isCollecting, entropy } = useEntropy();
  const [contractAddr, setContractAddr] = useState<Address | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintHash, setMintHash] = useState<`0x${string}` | undefined>();
  const [proofsMinted, setProofsMinted] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(ENTROPY_CONTRACT_KEY);
    if (saved) setContractAddr(saved as Address);
    const count = parseInt(localStorage.getItem('y8_proofs_minted') || '0');
    setProofsMinted(count);
  }, []);

  const { writeContractAsync } = useWriteContract();
  const { isSuccess: mintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });

  useEffect(() => {
    if (mintConfirmed) {
      const next = proofsMinted + 1;
      setProofsMinted(next);
      localStorage.setItem('y8_proofs_minted', String(next));
      toast.success('Proof of Entropy minted! 🎉', { duration: 5000 });
    }
  }, [mintConfirmed]);

  const handleCollect = async () => {
    toast.loading('Collecting device telemetry…', { id: 'collect' });
    const result = await collect();
    if (result) {
      toast.success(`Entropy score: ${result.score}/100`, { id: 'collect' });
    } else {
      toast.error('Failed to collect entropy', { id: 'collect' });
    }
  };

  const handleMint = async () => {
    if (!entropy || !contractAddr || !isConnected) return;
    setIsMinting(true);
    try {
      const hash = await writeContractAsync({
        address: contractAddr,
        abi: Y8_ENTROPY_ABI,
        functionName: 'mintProof',
        args: [
          entropy.hash as `0x${string}`,
          entropy.deviceType,
          BigInt(entropy.score),
          entropy.sensors.gps,
          entropy.sensors.motion,
          entropy.sensors.network,
        ],
        chainId: baseSepolia.id,
      } as any);
      setMintHash(hash);
      toast.loading('Minting on Base Sepolia…', { id: 'mint' });
    } catch (e: any) {
      toast.error(e.shortMessage || 'Mint failed');
    } finally {
      setIsMinting(false);
    }
  };

  const scoreColor = entropy
    ? entropy.score >= 70 ? '#22c55e'
    : entropy.score >= 40 ? '#f59e0b'
    : '#ef4444'
    : '#94a3b8';

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/space/settings" className="text-slate-400 hover:text-slate-600 text-sm">← Settings</Link>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-slate-900">Proof of Entropy</h1>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{proofsMinted}</p>
          <p className="text-xs text-slate-500 mt-1">Proofs Minted</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: scoreColor }}>
            {entropy ? entropy.score : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Entropy Score</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-slate-700 capitalize">{entropy?.deviceType ?? '—'}</p>
          <p className="text-xs text-slate-500 mt-1">Device Type</p>
        </div>
      </div>

      {/* Sensor status */}
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Active Sensors</p>
        <div className="grid grid-cols-2 gap-2">
          <SensorBadge label="GPS" active={entropy?.sensors.gps ?? false} icon={<MapPin className="w-4 h-4" />} />
          <SensorBadge label="Motion" active={entropy?.sensors.motion ?? false} icon={<Activity className="w-4 h-4" />} />
          <SensorBadge label="Network" active={entropy?.sensors.network ?? false} icon={<Wifi className="w-4 h-4" />} />
          <SensorBadge label="Battery" active={entropy?.sensors.battery ?? false} icon={<Battery className="w-4 h-4" />} />
        </div>
      </div>

      {/* Hash display */}
      {entropy && (
        <div className="bg-slate-900 rounded-2xl p-5">
          <p className="text-xs text-slate-400 mb-2 font-mono uppercase tracking-widest">Entropy Hash (bytes32)</p>
          <code className="text-indigo-300 font-mono text-xs break-all">{entropy.hash}</code>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleCollect}
          disabled={isCollecting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {isCollecting ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Collecting telemetry…</>
          ) : (
            <><Cpu className="w-4 h-4" /> Collect Device Entropy</>
          )}
        </button>

        {entropy && (
          <button
            onClick={handleMint}
            disabled={isMinting || !isConnected || !contractAddr}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/25"
          >
            {isMinting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Minting on Base Sepolia…</>
            ) : (
              <><Award className="w-4 h-4" /> Mint Proof of Entropy NFT</>
            )}
          </button>
        )}

        {!contractAddr && (
          <p className="text-center text-xs text-slate-500">
            Set the Y8ProofOfEntropy contract address in{' '}
            <Link href="/space/settings" className="text-indigo-500 underline">Settings</Link> first.
          </p>
        )}
      </div>

      {/* Mint tx link */}
      {mintHash && (
        <a
          href={`https://sepolia.basescan.org/tx/${mintHash}`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <ExternalLink className="w-4 h-4" /> View mint transaction on BaseScan
        </a>
      )}
    </div>
  );
}
