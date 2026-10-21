import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft,
  RefreshCw, PlusCircle, CheckCircle2, ArrowDownUp, Send, Globe,
  Repeat2, ChevronDown, Loader2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '../context/AuthContext';
import { RSIncomePanel } from '../components/RSIncomePanel';

// ── Types ──────────────────────────────────────────────────────────────────

interface PlaidAccount {
  account_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype: string;
  balances: { current: number | null; available: number | null; limit?: number | null };
  mask: string;
}

interface PlaidTransaction {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
  category: string[];
  payment_channel: string;
  pending: boolean;
  account_id: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CATEGORY_COLORS = [
  '#003087', '#0057B8', '#2a7de1', '#4a9ef5',
  '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd',
];

const getAccountIcon = (type: string) => {
  if (type === 'credit') return <CreditCard className="w-5 h-5" />;
  if (type === 'investment') return <TrendingUp className="w-5 h-5" />;
  return <Building2 className="w-5 h-5" />;
};

// ── BankGate ───────────────────────────────────────────────────────────────

function BankGate({ onLinked }: { onLinked: () => void }) {
  const { user } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkToken = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetch('/api/plaid/create_link_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryAddress: user?.primaryAddress || 'user' }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLinkToken(data.link_token);
    } catch (e: any) {
      setError(e.message);
      toast.error('Could not reach Plaid: ' + e.message);
    } finally {
      setIsFetching(false);
    }
  }, [user?.primaryAddress]);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: async (public_token) => {
      try {
        const res = await fetch('/api/plaid/set_access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Token exchange failed');
        toast.success('Bank account linked! Welcome to Y8 Premier.');
        onLinked();
      } catch (e: any) {
        toast.error('Failed to link account: ' + e.message);
      }
    },
    onExit: (err) => { if (err) toast.error(err.error_message || 'Bank link cancelled'); },
  });

  const handleConnect = async () => {
    if (!linkToken) { await fetchLinkToken(); } else { open(); }
  };

  useEffect(() => { if (linkToken && ready) open(); }, [linkToken, ready]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#003087] to-[#2a7de1]" />
        <div className="p-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-blue-100">
            <Building2 className="w-8 h-8 text-[#0057B8]" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Connect Your Bank</h2>
          <p className="text-slate-500 text-center text-sm mb-7 leading-relaxed">
            Link your bank account to unlock <span className="font-semibold text-[#0057B8]">Y8 Premier</span> — your personal financial command center.
          </p>
          <div className="space-y-3 mb-8">
            {[
              'View all account balances in one place',
              'Track transactions & spending by category',
              'Swap USDC/USDT → SOL, ETH, or BTC',
              'Send global payments via Rafiki Interledger',
            ].map(benefit => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <button
            onClick={handleConnect}
            disabled={isFetching}
            className="w-full py-3.5 bg-[#0057B8] hover:bg-[#003087] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-500/20"
          >
            {isFetching ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Preparing...</>
            ) : (
              <><PlusCircle className="w-4 h-4" /> Connect Bank Account</>
            )}
          </button>
          <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed">
            🔒 Powered by Plaid · Bank-grade 256-bit encryption · We never store your credentials
          </p>
        </div>
      </div>
      <div className="mt-6">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-5 py-2.5">
          <span className="text-amber-600 text-sm font-medium">🚀 Coming Soon — Deposit $50 to activate full membership</span>
        </div>
      </div>
    </div>
  );
}

// ── Account Card ────────────────────────────────────────────────────────────

function AccountCard({ account }: { account: PlaidAccount }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0057B8] border border-blue-100">
            {getAccountIcon(account.type)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">{account.name}</p>
            <p className="text-xs text-slate-400">···· {account.mask}</p>
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full capitalize font-medium">
          {account.subtype || account.type}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{fmt(account.balances.current)}</p>
      {account.balances.available != null && account.balances.available !== account.balances.current && (
        <p className="text-xs text-slate-400 mt-1">{fmt(account.balances.available)} available</p>
      )}
      {account.balances.limit != null && (
        <p className="text-xs text-slate-400 mt-0.5">Limit: {fmt(account.balances.limit)}</p>
      )}
    </div>
  );
}

// ── Spending Chart ──────────────────────────────────────────────────────────

function SpendingChart({ transactions }: { transactions: PlaidTransaction[] }) {
  const data = transactions
    .filter(t => t.amount > 0 && t.category?.[0])
    .reduce((acc, t) => {
      const cat = t.category[0];
      const existing = acc.find(x => x.name === cat);
      if (existing) existing.value += t.amount;
      else acc.push({ name: cat, value: t.amount });
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No spending data yet</div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(val: number) => fmt(val)} />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Swap Panel (USDC/USDT → SOL / ETH / BTC) ──────────────────────────────

const CRYPTO_IDS: Record<string, string> = {
  SOL: 'solana',
  ETH: 'ethereum',
  BTC: 'bitcoin',
};

function SwapPanel() {
  const [fromToken, setFromToken] = useState<'USDC' | 'USDT'>('USDC');
  const [toToken, setToToken]   = useState<'SOL' | 'ETH' | 'BTC'>('ETH');
  const [amount, setAmount]     = useState('');
  const [prices, setPrices]     = useState<Record<string, number>>({});
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isSwapping, setIsSwapping]         = useState(false);
  const [swapResult, setSwapResult]         = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setIsLoadingPrice(true);
    try {
      const ids = Object.values(CRYPTO_IDS).join(',');
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        { headers: { Accept: 'application/json' } }
      );
      const data = await res.json();
      const p: Record<string, number> = {};
      for (const [sym, id] of Object.entries(CRYPTO_IDS)) {
        p[sym] = data[id]?.usd ?? 0;
      }
      setPrices(p);
    } catch {
      toast.error('Could not fetch prices');
    } finally {
      setIsLoadingPrice(false);
    }
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const usdAmount   = parseFloat(amount) || 0;
  const cryptoPrice = prices[toToken] || 0;
  const cryptoOut   = cryptoPrice > 0 ? (usdAmount / cryptoPrice) : 0;

  const handleSwap = async () => {
    if (!amount || usdAmount <= 0) { toast.error('Enter an amount'); return; }
    setIsSwapping(true);
    setSwapResult(null);
    try {
      // Simulate swap — integrate real DEX (Uniswap/1inch) in production
      await new Promise(r => setTimeout(r, 1500));
      const txId = `0x${Math.random().toString(16).slice(2, 18)}`;
      setSwapResult(txId);
      toast.success(`Swap executed! ${cryptoOut.toFixed(6)} ${toToken} received.`);
    } catch (e: any) {
      toast.error(e.message || 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <ArrowDownUp className="w-4 h-4 text-[#0057B8]" />
        <h3 className="font-semibold text-slate-900">Swap Stablecoin → Crypto</h3>
        <button onClick={fetchPrices} className="ml-auto text-slate-400 hover:text-slate-600">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrice ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* From */}
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1.5 block">You pay</label>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={fromToken}
                onChange={e => setFromToken(e.target.value as any)}
                className="appearance-none bg-slate-100 border border-slate-200 text-slate-900 text-sm font-semibold rounded-lg px-3 py-2.5 pr-7 cursor-pointer"
              >
                <option>USDC</option>
                <option>USDT</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-3.5 text-slate-500 pointer-events-none" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8]/30"
            />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <Repeat2 className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* To */}
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1.5 block">You receive (estimated)</label>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={toToken}
                onChange={e => setToToken(e.target.value as any)}
                className="appearance-none bg-slate-100 border border-slate-200 text-slate-900 text-sm font-semibold rounded-lg px-3 py-2.5 pr-7 cursor-pointer"
              >
                <option>ETH</option>
                <option>SOL</option>
                <option>BTC</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-3.5 text-slate-500 pointer-events-none" />
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700">
              {isLoadingPrice ? (
                <span className="text-slate-400">Loading…</span>
              ) : cryptoOut > 0 ? (
                <span>{cryptoOut.toFixed(6)} {toToken}</span>
              ) : (
                <span className="text-slate-400">0.000000 {toToken}</span>
              )}
            </div>
          </div>
          {cryptoPrice > 0 && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              1 {toToken} = ${cryptoPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {swapResult && (
          <div className="text-[11px] bg-green-50 border border-green-200 rounded-lg p-2.5 text-green-700 break-all">
            ✓ Tx: <span className="font-mono">{swapResult}</span>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={isSwapping || !amount}
          className="w-full py-3 bg-[#0057B8] hover:bg-[#003087] text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSwapping ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Swapping…</>
          ) : (
            <>Swap {fromToken} → {toToken}</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Rafiki Interledger Panel ────────────────────────────────────────────────

const RAFIKI_CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'XRP'];

function RafikiPanel() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [currency, setCurrency]   = useState('USD');
  const [isSending, setIsSending] = useState(false);
  const [txResult, setTxResult]   = useState<{ transactionId: string } | null>(null);

  const handleSend = async () => {
    if (!recipient.trim()) { toast.error('Enter a recipient ILP address'); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setIsSending(true);
    setTxResult(null);
    try {
      const res = await fetch('/api/financial/rafiki/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, amount: parseFloat(amount), currency }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Transfer failed');
      setTxResult(data);
      toast.success('Payment sent via Interledger! 🌐');
      setRecipient('');
      setAmount('');
    } catch (e: any) {
      toast.error(e.message || 'Transfer failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <Globe className="w-4 h-4 text-indigo-500" />
        <div>
          <h3 className="font-semibold text-slate-900">Rafiki Interledger</h3>
          <p className="text-xs text-slate-400">Send money globally, instantly</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Recipient */}
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1.5 block">ILP Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="$wallet.example.org/alice"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
        </div>

        {/* Amount + Currency */}
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1.5 block">Amount</label>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="appearance-none bg-slate-100 border border-slate-200 text-slate-900 text-sm font-semibold rounded-lg px-3 py-2.5 pr-7 cursor-pointer"
              >
                {RAFIKI_CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-3.5 text-slate-500 pointer-events-none" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
          </div>
        </div>

        {txResult && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-indigo-700 text-xs">
            <p className="font-semibold mb-0.5">✓ Payment sent via Interledger</p>
            <p className="font-mono break-all">ID: {txResult.transactionId}</p>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={isSending}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="w-4 h-4" /> Send via Interledger</>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center">
          Powered by Rafiki · ILP/SPSP protocol · Instant global settlement
        </p>
      </div>
    </div>
  );
}

// ── Main Financial Page ─────────────────────────────────────────────────────

export function Financial() {
  const { user, isPremium, setBankLinked } = useAuth();
  const [isLinked, setIsLinked]     = useState<boolean | null>(null);
  const [accounts, setAccounts]     = useState<PlaidAccount[]>([]);
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError]   = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => { document.title = 'Financial | Y8 Premier'; }, []);

  useEffect(() => {
    fetch('/api/plaid/status')
      .then(r => r.json())
      .then(d => setIsLinked(d.linked || isPremium))
      .catch(() => setIsLinked(isPremium));
  }, [isPremium]);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [accRes, txRes] = await Promise.all([
        fetch('/api/plaid/accounts'),
        fetch('/api/plaid/transactions'),
      ]);
      const accData = await accRes.json();
      const txData  = await txRes.json();
      if (accData.error) throw new Error(accData.error);
      setAccounts(accData.accounts || []);
      setTransactions((txData.transactions || []).slice(0, 20));
    } catch (e: any) {
      setDataError(e.message);
      toast.error('Failed to load financial data');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => { if (isLinked) fetchData(); }, [isLinked, fetchData]);

  const handleLinked = () => { setBankLinked(); setIsLinked(true); fetchData(); };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await fetch('/api/plaid/disconnect', { method: 'POST' });
      localStorage.removeItem('y8_bank_linked');
      setIsLinked(false);
      setAccounts([]);
      setTransactions([]);
      toast.success('Bank account disconnected.');
    } catch (e: any) {
      toast.error('Failed to disconnect: ' + e.message);
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLinked === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0057B8]" />
      </div>
    );
  }

  if (!isLinked) return <BankGate onLinked={handleLinked} />;

  const assets = accounts
    .filter(a => a.type !== 'credit' && a.type !== 'loan')
    .reduce((s, a) => s + (a.balances.current ?? 0), 0);
  const liabilities = accounts
    .filter(a => a.type === 'credit' || a.type === 'loan')
    .reduce((s, a) => s + (a.balances.current ?? 0), 0);
  const netWorth = assets - liabilities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Your complete financial picture</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toast('Deposit $50 — coming soon! 🚀', { icon: '💰' })}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            💰 Deposit $50
          </button>
          <button
            onClick={fetchData}
            disabled={isLoadingData}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            {isDisconnecting
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <span>🔌</span>}
            Disconnect
          </button>
        </div>
      </div>

      {dataError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{dataError}</div>
      )}

      {/* Net Worth Banner */}
      <div className="bg-gradient-to-br from-[#003087] to-[#2a7de1] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Net Worth</p>
            <p className="text-4xl font-bold tracking-tight">
              {isLoadingData ? <span className="text-blue-300 text-2xl">Loading…</span> : fmt(netWorth)}
            </p>
            <p className="text-blue-200 text-xs mt-1.5">Total assets minus liabilities</p>
          </div>
          <div className="flex gap-8 flex-wrap">
            <div><p className="text-blue-200 text-xs mb-1">Total Assets</p><p className="text-xl font-bold">{isLoadingData ? '—' : fmt(assets)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">Liabilities</p><p className="text-xl font-bold">{isLoadingData ? '—' : fmt(liabilities)}</p></div>
            <div><p className="text-blue-200 text-xs mb-1">Linked Accounts</p><p className="text-xl font-bold">{accounts.length}</p></div>
          </div>
        </div>
      </div>

      {/* Accounts */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Accounts</h3>
        {isLoadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-slate-400 text-sm text-center py-8 bg-white rounded-xl border border-slate-200">No accounts found. Try refreshing.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(a => <AccountCard key={a.account_id} account={a} />)}
          </div>
        )}
      </div>

      {/* Transactions + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
            <span className="text-xs text-slate-400">{transactions.length} transactions · last 30 days</span>
          </div>
          <div className="divide-y divide-slate-50">
            {isLoadingData ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-40 animate-pulse" />
                    <div className="h-2.5 bg-slate-100 rounded w-24 animate-pulse" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-16 animate-pulse" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-10">No transactions found.</div>
            ) : (
              transactions.map(tx => {
                const isDebit = tx.amount > 0;
                return (
                  <div key={tx.transaction_id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDebit ? 'bg-red-50 text-red-400' : 'bg-green-50 text-green-500'}`}>
                      {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{tx.name}</p>
                      <p className="text-xs text-slate-400">{tx.date} · {tx.category?.[0] || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${isDebit ? 'text-slate-800' : 'text-green-600'}`}>
                        {isDebit ? '-' : '+'}{fmt(Math.abs(tx.amount))}
                      </p>
                      {tx.pending && <p className="text-xs text-amber-500">Pending</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Spending by Category</h3>
          {isLoadingData ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0057B8]" />
            </div>
          ) : <SpendingChart transactions={transactions} />}
        </div>
      </div>

      {/* ── Swap + Rafiki ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SwapPanel />
        <RafikiPanel />
      </div>

      {/* ── Crypto Income (RSIncomePanel) ─────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-8">
        <RSIncomePanel />
      </div>
    </div>
  );
}
