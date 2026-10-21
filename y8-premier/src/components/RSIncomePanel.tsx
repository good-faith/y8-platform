/**
 * RSIncomePanel.tsx
 *
 * Live Relative Strength Income Dashboard for BTC · ETH · SOL
 *
 * - Fetches live prices + 24h/7d/30d change from CoinGecko (no API key needed)
 * - Calculates RS Score = 0.2×(1d) + 0.5×(7d) + 0.3×(30d) — momentum-weighted
 * - Ranks assets strongest → weakest against USD
 * - Shows yield opportunities per asset (staking, lending, options)
 * - User inputs position sizes → live daily income estimate
 * - Allocation recommendation based on RS rank
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw,
  DollarSign, Zap, Award, ChevronUp, ChevronDown,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface AssetData {
  id:        string;
  symbol:    string;
  name:      string;
  icon:      string;
  color:     string;
  price:     number;
  change1d:  number;
  change7d:  number;
  change30d: number;
  rsScore:   number;
  rsRank:    number;
}

interface YieldStrategy {
  protocol:  string;
  type:      string;
  apyMin:    number;
  apyMax:    number;
  frequency: string;
  link:      string;
  tag:       'best' | 'safe' | 'aggressive';
}

// ── Yield Data (static, research-based) ──────────────────────────────────

const YIELD_STRATEGIES: Record<string, YieldStrategy[]> = {
  bitcoin: [
    { protocol: 'Babylon',       type: 'Staking',       apyMin: 3.0, apyMax: 5.0,  frequency: 'Epoch',   link: 'https://babylonchain.io',         tag: 'best'       },
    { protocol: 'Aave (WBTC)',   type: 'Lending',        apyMin: 0.5, apyMax: 2.0,  frequency: 'Daily',   link: 'https://app.aave.com',            tag: 'safe'       },
    { protocol: 'Ribbon/Aevo',   type: 'Covered Calls',  apyMin: 4.0, apyMax: 12.0, frequency: 'Weekly',  link: 'https://app.ribbon.finance',      tag: 'aggressive' },
    { protocol: 'Compound (WBTC)',type: 'Lending',       apyMin: 0.3, apyMax: 1.5,  frequency: 'Daily',   link: 'https://compound.finance',        tag: 'safe'       },
  ],
  ethereum: [
    { protocol: 'Lido (stETH)',  type: 'Liquid Staking', apyMin: 3.0, apyMax: 4.5,  frequency: 'Daily',   link: 'https://stake.lido.fi',           tag: 'best'       },
    { protocol: 'EigenLayer',    type: 'Restaking',      apyMin: 4.5, apyMax: 8.0,  frequency: 'Variable',link: 'https://eigenlayer.xyz',          tag: 'aggressive' },
    { protocol: 'Aave',         type: 'Lending',         apyMin: 1.5, apyMax: 4.0,  frequency: 'Daily',   link: 'https://app.aave.com',            tag: 'safe'       },
    { protocol: 'Pendle',       type: 'Yield Trading',   apyMin: 5.0, apyMax: 15.0, frequency: 'Maturity',link: 'https://app.pendle.finance',      tag: 'aggressive' },
  ],
  solana: [
    { protocol: 'Jito (jitoSOL)',type: 'Liquid Staking', apyMin: 7.0, apyMax: 9.5,  frequency: 'Continuous',link:'https://www.jito.network',        tag: 'best'       },
    { protocol: 'Marginfi',     type: 'Lending',          apyMin: 3.0, apyMax: 7.0,  frequency: 'Daily',   link: 'https://app.marginfi.com',        tag: 'safe'       },
    { protocol: 'Kamino',       type: 'Lending + LP',     apyMin: 5.0, apyMax: 14.0, frequency: 'Daily',   link: 'https://app.kamino.finance',      tag: 'aggressive' },
    { protocol: 'Zeta / Friktion',type:'Covered Calls',  apyMin: 15.0,apyMax: 35.0, frequency: 'Weekly',  link: 'https://zeta.markets',            tag: 'aggressive' },
  ],
};

const ASSET_META = {
  bitcoin:  { symbol: 'BTC', icon: '₿', color: '#f59e0b', colorDark: '#b45309' },
  ethereum: { symbol: 'ETH', icon: 'Ξ', color: '#6366f1', colorDark: '#4338ca' },
  solana:   { symbol: 'SOL', icon: '◎', color: '#10b981', colorDark: '#047857' },
};

// ── RS Score ──────────────────────────────────────────────────────────────

function calcRS(c1d: number, c7d: number, c30d: number): number {
  // Momentum-weighted: 7d carries most weight (medium trend)
  return 0.2 * c1d + 0.5 * c7d + 0.3 * c30d;
}

// ── Daily income from APY ──────────────────────────────────────────────────

function dailyIncome(valueUSD: number, apyMid: number): number {
  return (valueUSD * apyMid) / 100 / 365;
}

// ── Tag badge ─────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: YieldStrategy['tag'] }) {
  const map = {
    best:       { label: '⭐ Best',       className: 'bg-indigo-500/20 border-indigo-500 text-indigo-300' },
    safe:       { label: '🛡 Safe',        className: 'bg-emerald-500/15 border-emerald-500 text-emerald-300' },
    aggressive: { label: '⚡ Aggressive',  className: 'bg-amber-500/15 border-amber-500 text-amber-300' },
  };
  const s = map[tag];
  return (
    <span className={`text-[10px] font-bold tracking-wider px-[7px] py-[2px] rounded border ${s.className}`}>
      {s.label}
    </span>
  );
}

// ── Change pill ───────────────────────────────────────────────────────────

function ChangePill({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(value).toFixed(2)}{suffix}
    </span>
  );
}

// ── Style Helpers for Tailwind ───────────────────────────────────────────

const getAssetBgClass = (id: string, isRank1: boolean) => {
  if (!isRank1) return 'bg-slate-950/60';
  if (id === 'bitcoin') return 'bg-gradient-to-br from-amber-500/10 to-slate-950/80';
  if (id === 'ethereum') return 'bg-gradient-to-br from-indigo-500/10 to-slate-950/80';
  return 'bg-gradient-to-br from-emerald-500/10 to-slate-950/80';
};

const getAssetBorderClass = (id: string, isRank1: boolean) => {
  if (!isRank1) return 'border-white/5';
  if (id === 'bitcoin') return 'border-amber-500/35';
  if (id === 'ethereum') return 'border-indigo-500/35';
  return 'border-emerald-500/35';
};

const getAssetColorTextClass = (id: string) => {
  if (id === 'bitcoin') return 'text-amber-500';
  if (id === 'ethereum') return 'text-indigo-500';
  return 'text-emerald-500';
};

const getStrongestBadgeClass = (id: string) => {
  if (id === 'bitcoin') return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
  if (id === 'ethereum') return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40';
  return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
};

const getRankBadgeClass = (id: string) => {
  if (id === 'bitcoin') return 'bg-amber-500/15 border border-amber-500/35 text-amber-500';
  if (id === 'ethereum') return 'bg-indigo-500/15 border border-indigo-500/35 text-indigo-500';
  return 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-500';
};

const getBarBgClass = (id: string, isPositive: boolean) => {
  if (!isPositive) return 'bg-red-400';
  if (id === 'bitcoin') return 'bg-amber-500';
  if (id === 'ethereum') return 'bg-indigo-500';
  return 'bg-emerald-500';
};

const getInputClass = (id: string) => {
  const base = "w-full box-border bg-white/5 rounded-lg py-2 px-3 text-slate-100 text-sm outline-none transition-colors duration-200 border";
  if (id === 'bitcoin') return `${base} border-amber-500/25 focus:border-amber-500`;
  if (id === 'ethereum') return `${base} border-indigo-500/25 focus:border-indigo-500`;
  return `${base} border-emerald-500/25 focus:border-emerald-500`;
};

const getStrategyCardClass = (id: string) => {
  const base = "block bg-slate-900/70 border border-white/5 rounded-lg p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5";
  if (id === 'bitcoin') return `${base} hover:border-amber-500/40`;
  if (id === 'ethereum') return `${base} hover:border-indigo-500/40`;
  return `${base} hover:border-emerald-500/40`;
};

// ── Main Component ────────────────────────────────────────────────────────

export function RSIncomePanel() {
  const [assets, setAssets]     = useState<AssetData[]>([]);
  const [loading, setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [error, setError]       = useState<string | null>(null);

  // User position sizes in USD
  const [positions, setPositions] = useState<Record<string, string>>({
    bitcoin: '', ethereum: '', solana: '',
  });

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = 'https://api.coingecko.com/api/v3/coins/markets' +
        '?vs_currency=usd&ids=bitcoin,ethereum,solana' +
        '&price_change_percentage=1h%2C24h%2C7d%2C30d' +
        '&order=market_cap_desc&per_page=3&page=1';

      const res  = await fetch(url);
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      const data = await res.json();

      const raw: Omit<AssetData, 'rsScore' | 'rsRank'>[] = data.map((c: any) => ({
        id:       c.id,
        symbol:   ASSET_META[c.id as keyof typeof ASSET_META]?.symbol ?? c.symbol.toUpperCase(),
        name:     c.name,
        icon:     ASSET_META[c.id as keyof typeof ASSET_META]?.icon ?? '◈',
        color:    ASSET_META[c.id as keyof typeof ASSET_META]?.color ?? '#6366f1',
        price:    c.current_price,
        change1d: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0,
        change7d: c.price_change_percentage_7d_in_currency  ?? 0,
        change30d:c.price_change_percentage_30d_in_currency ?? 0,
      }));

      // Calculate RS scores + ranks
      const scored = raw.map(a => ({ ...a, rsScore: calcRS(a.change1d, a.change7d, a.change30d), rsRank: 0 }));
      scored.sort((a, b) => b.rsScore - a.rsScore);
      scored.forEach((a, i) => { a.rsRank = i + 1; });

      setAssets(scored);
      setLastFetch(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(fetchPrices, 60_000);
    return () => clearInterval(t);
  }, [fetchPrices]);

  // ── Derived ────────────────────────────────────────────────────────────

  const totalDailyIncome = assets.reduce((sum, a) => {
    const posUSD = parseFloat(positions[a.id] || '0');
    if (!posUSD) return sum;
    const strategies = YIELD_STRATEGIES[a.id] ?? [];
    const best = strategies[0];
    if (!best) return sum;
    const midAPY = (best.apyMin + best.apyMax) / 2;
    return sum + dailyIncome(posUSD, midAPY);
  }, 0);

  const totalPortfolio = Object.values(positions).reduce((s, v) => s + parseFloat(v || '0'), 0);

  const allocationForRank = (rank: number) => [50, 30, 20][rank - 1] ?? 0;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-100 tracking-tight">
            ⚡ Relative Strength Income
          </h2>
          <p className="mt-1 mb-0 text-[13px] text-slate-500">
            BTC · ETH · SOL momentum vs USD → daily yield strategy
          </p>
        </div>
        <button
          onClick={fetchPrices}
          className="flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 rounded-lg py-[7px] px-3.5 text-xs cursor-pointer font-semibold"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg py-2.5 px-3.5 text-red-300 text-[13px] mb-4">
          ⚠ {error} — using CoinGecko free tier (rate limited after ~30 req/min)
        </div>
      )}

      {/* ── RS Leaderboard ── */}
      <div className="grid gap-3 mb-6">
        {(loading ? Array(3).fill(null) : assets).map((asset, i) => {
          if (!asset) {
            return (
              <div key={i} className="h-[88px] rounded-xl bg-white/5 animate-pulse" />
            );
          }

          const posUSD   = parseFloat(positions[asset.id] || '0');
          const strategies = YIELD_STRATEGIES[asset.id] ?? [];
          const bestStrat  = strategies[0];
          const midAPY     = bestStrat ? (bestStrat.apyMin + bestStrat.apyMax) / 2 : 0;
          const estDaily   = posUSD ? dailyIncome(posUSD, midAPY) : null;
          const rsBarWidth = Math.min(100, Math.max(0, 50 + asset.rsScore * 2));
          const isPositiveRS = asset.rsScore >= 0;

          return (
            <div key={asset.id} className={`border rounded-[14px] p-4 md:p-5 grid grid-cols-[48px_1fr_auto] items-center gap-4 ${getAssetBgClass(asset.id, asset.rsRank === 1)} ${getAssetBorderClass(asset.id, asset.rsRank === 1)}`}>

              {/* Rank + icon */}
              <div className="text-center">
                <div className="text-2xl">{asset.icon}</div>
                <div className="text-[10px] text-slate-500 font-bold tracking-wider">
                  #{asset.rsRank}
                </div>
              </div>

              {/* Details */}
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-[15px] font-bold text-slate-100">{asset.symbol}</span>
                  <span className="text-xs text-slate-500">${asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  {asset.rsRank === 1 && (
                    <span className={`text-[10px] py-px px-1.5 rounded font-bold tracking-wider ${getStrongestBadgeClass(asset.id)}`}>
                      STRONGEST
                    </span>
                  )}
                </div>

                {/* Momentum bars */}
                <div className="flex gap-3 mb-2">
                  {[['1d', asset.change1d], ['7d', asset.change7d], ['30d', asset.change30d]].map(([label, val]) => (
                    <span key={label as string} className="text-[11px] text-slate-500">
                      <span className="text-slate-600">{label} </span>
                      <ChangePill value={val as number} />
                    </span>
                  ))}
                  <span className="text-[11px] text-slate-500">
                    <span className="text-slate-600">RS </span>
                    <span className={`font-bold ${isPositiveRS ? 'text-emerald-400' : 'text-red-400'}`}>
                      {asset.rsScore.toFixed(2)}
                    </span>
                  </span>
                </div>

                {/* RS strength bar */}
                <div className="h-0.5 bg-white/5 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-[width] duration-500 ease ${getBarBgClass(asset.id, isPositiveRS)}`}
                    style={{ width: `${rsBarWidth}%` }}
                  />
                </div>
              </div>

              {/* Daily income + allocation */}
              <div className="text-right min-w-[120px]">
                {estDaily !== null ? (
                  <>
                    <div className="text-lg font-extrabold text-emerald-400 tracking-tight">
                      +${estDaily.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">est. daily</div>
                  </>
                ) : (
                  <div className="text-xs text-slate-600">enter position →</div>
                )}
                <div className={`text-[10px] mt-1 font-semibold ${getAssetColorTextClass(asset.id)}`}>
                  Alloc: {allocationForRank(asset.rsRank)}%
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Position Input + Daily Income Estimator ── */}
      <div className="bg-slate-900/70 border border-white/5 rounded-xl p-5 mb-6">
        <h3 className="m-0 mb-4 text-xs font-bold text-slate-400 tracking-widest uppercase">
          💰 My Positions (USD Value)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {assets.map(asset => (
            <div key={asset.id}>
              <label className="block text-[11px] text-slate-500 mb-1 font-semibold tracking-wider">
                {asset.icon} {asset.symbol} (USD)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 10000"
                value={positions[asset.id]}
                onChange={e => setPositions(p => ({ ...p, [asset.id]: e.target.value }))}
                className={getInputClass(asset.id)}
              />
            </div>
          ))}
        </div>

        {/* Summary bar */}
        {totalPortfolio > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3.5 flex justify-between items-center flex-wrap gap-3">
            <div>
              <div className="text-xs text-slate-500">Portfolio value</div>
              <div className="text-xl font-extrabold text-slate-100">
                ${totalPortfolio.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Est. daily income</div>
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                +${totalDailyIncome.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Est. annual</div>
              <div className="text-xl font-bold text-emerald-200">
                +${(totalDailyIncome * 365).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Yield Strategy Cards ── */}
      {assets.map(asset => (
        <div key={asset.id} className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-lg">{asset.icon}</span>
            <span className="text-sm font-bold text-slate-100">{asset.name} Yield Strategies</span>
            <span className={`text-[10px] font-bold tracking-wider py-0.5 px-2 rounded ${getRankBadgeClass(asset.id)}`}>
              RANK #{asset.rsRank}
            </span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
            {(YIELD_STRATEGIES[asset.id] ?? []).map(s => {
              const posUSD  = parseFloat(positions[asset.id] || '0');
              const midAPY  = (s.apyMin + s.apyMax) / 2;
              const daily   = posUSD ? dailyIncome(posUSD, midAPY) : null;

              return (
                <a
                  key={s.protocol}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  <div className={getStrategyCardClass(asset.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[13px] font-bold text-slate-200">{s.protocol}</span>
                      <TagBadge tag={s.tag} />
                    </div>

                    <div className="text-[11px] text-slate-500 mb-1.5">{s.type} · {s.frequency}</div>

                    <div className={`text-xl font-extrabold tracking-tight ${getAssetColorTextClass(asset.id)}`}>
                      {s.apyMin}–{s.apyMax}%
                      <span className="text-[11px] font-medium text-slate-500 ml-1">APY</span>
                    </div>

                    {daily !== null && (
                      <div className="mt-1.5 text-xs text-emerald-400 font-bold">
                        ≈ +${daily.toFixed(2)}/day
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Allocation Guide ── */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
        <div className="text-xs font-bold text-indigo-500 tracking-widest mb-2">
          📐 RS ALLOCATION SIGNAL
        </div>
        <div className="text-xs text-slate-500 leading-relaxed">
          Rank #1 (strongest momentum) → <span className="text-indigo-300 font-bold">50% of portfolio</span><br />
          Rank #2 → <span className="text-purple-300 font-bold">30%</span> · 
          Rank #3 → <span className="text-purple-200 font-bold">20%</span><br />
          RS Score = <span className="text-slate-400">0.2×(24h) + 0.5×(7d) + 0.3×(30d)</span> — rebalance weekly or when rank changes.
        </div>
      </div>

    </div>
  );
}
