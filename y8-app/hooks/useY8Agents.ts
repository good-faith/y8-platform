'use client';

import { useState, useEffect, useCallback } from 'react';
import { y8Agents, Y8Agent, Y8DashboardStats } from '../lib/y8-client';
import { useAuth } from '../context/AuthContext';

// ─── useAgents ─────────────────────────────────────────────────────────────────

interface UseAgentsResult {
  agents: Y8Agent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAgents(): UseAgentsResult {
  const { y8Token } = useAuth();
  const [agents, setAgents] = useState<Y8Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!y8Token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await y8Agents.list(y8Token);
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  }, [y8Token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { agents, isLoading, error, refresh: fetch };
}

// ─── useAgentDashboard ─────────────────────────────────────────────────────────

interface UseDashboardResult {
  stats: Y8DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAgentDashboard(): UseDashboardResult {
  const { y8Token } = useAuth();
  const [stats, setStats] = useState<Y8DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!y8Token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await y8Agents.dashboard(y8Token);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [y8Token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, isLoading, error, refresh: fetch };
}

// ─── useLeaderboard ────────────────────────────────────────────────────────────

interface UseLeaderboardResult {
  leaders: Y8Agent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLeaderboard(): UseLeaderboardResult {
  const { y8Token } = useAuth();
  const [leaders, setLeaders] = useState<Y8Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!y8Token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await y8Agents.leaderboard(y8Token);
      setLeaders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [y8Token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { leaders, isLoading, error, refresh: fetch };
}

// ─── useRouteAgent ─────────────────────────────────────────────────────────────

interface RouteRequest {
  service: string;
  location?: { lat: number; lng: number };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface UseRouteAgentResult {
  agent: Y8Agent | null;
  isRouting: boolean;
  error: string | null;
  route: (request: RouteRequest) => Promise<Y8Agent | null>;
}

export function useRouteAgent(): UseRouteAgentResult {
  const { y8Token } = useAuth();
  const [agent, setAgent] = useState<Y8Agent | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const route = useCallback(
    async (request: RouteRequest): Promise<Y8Agent | null> => {
      if (!y8Token) return null;
      setIsRouting(true);
      setError(null);
      try {
        const routed = await y8Agents.route(request, y8Token);
        setAgent(routed);
        return routed;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Routing failed');
        return null;
      } finally {
        setIsRouting(false);
      }
    },
    [y8Token],
  );

  return { agent, isRouting, error, route };
}
