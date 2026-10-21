'use client';

import { useState, useEffect, useCallback } from 'react';
import { y8Chain, Y8BlockInfo, Y8BalanceInfo } from '../lib/y8-client';
import { useAuth } from '../context/AuthContext';

// ─── useBlockNumber ────────────────────────────────────────────────────────────

interface UseBlockResult {
  block: Y8BlockInfo | null;
  isLoading: boolean;
  error: string | null;
}

/** Fetches the current Base block on mount and whenever the token changes. */
export function useBaseBlock(): UseBlockResult {
  const { y8Token } = useAuth();
  const [block, setBlock] = useState<Y8BlockInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!y8Token) return;
    let cancelled = false;
    setIsLoading(true);
    y8Chain
      .block(y8Token)
      .then((data) => { if (!cancelled) setBlock(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [y8Token]);

  return { block, isLoading, error };
}

// ─── useBaseBalance ────────────────────────────────────────────────────────────

interface UseBalanceResult {
  balance: Y8BalanceInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Fetches the ETH balance of `address` on Base (via y8-server). */
export function useBaseBalance(address: string | null | undefined): UseBalanceResult {
  const { y8Token } = useAuth();
  const [balance, setBalance] = useState<Y8BalanceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!y8Token || !address) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await y8Chain.balance(address, y8Token);
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [y8Token, address]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { balance, isLoading, error, refresh: fetch };
}

// ─── useBasename ───────────────────────────────────────────────────────────────

interface UseBasenameResult {
  resolvedAddress: string | null;
  isLoading: boolean;
  error: string | null;
}

/** Resolves a Base ENS name (e.g. "jason.base.eth") to an address. */
export function useBasename(name: string | null | undefined): UseBasenameResult {
  const { y8Token } = useAuth();
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!y8Token || !name) return;
    let cancelled = false;
    setIsLoading(true);
    y8Chain
      .resolve(name, y8Token)
      .then((data) => { if (!cancelled) setResolvedAddress(data.address); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [y8Token, name]);

  return { resolvedAddress, isLoading, error };
}
