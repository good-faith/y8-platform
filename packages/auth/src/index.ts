import { createSiweMessage } from 'viem/siwe';
import { y8 } from '@y8/api-client';
import type { Y8User } from '@y8/types';

// ─── SIWE helpers ─────────────────────────────────────────────────────────

/**
 * Build a SIWE message, get a nonce from y8-server, sign it with the
 * user's wallet, and verify it to receive a JWT.
 *
 * Usage (with wagmi):
 *   const { signMessageAsync } = useSignMessage();
 *   const { accessToken, user } = await signInWithEthereum(address, chainId, signMessageAsync);
 */
export async function signInWithEthereum(
  address: `0x${string}`,
  chainId: number,
  signMessage: (args: { message: string }) => Promise<`0x${string}`>,
): Promise<{ accessToken: string; user: Y8User }> {
  // 1. Fetch nonce from y8-server
  const { nonce } = await y8.auth.nonce();

  // 2. Build EIP-4361 message
  const message = createSiweMessage({
    domain: typeof window !== 'undefined' ? window.location.host : 'y8.app',
    address,
    statement: 'Sign in to Y8 Platform',
    uri: typeof window !== 'undefined' ? window.location.origin : 'https://y8.app',
    version: '1',
    chainId,
    nonce,
  });

  // 3. Sign with wallet
  const signature = await signMessage({ message });

  // 4. Verify on y8-server → get JWT
  return y8.auth.verify(message, signature);
}

// ─── Token storage ────────────────────────────────────────────────────────

const TOKEN_KEY = 'y8_access_token';

export const tokenStore = {
  get: (): string | null =>
    typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,

  set: (token: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      y8.setToken(token);
    }
  },

  clear: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      y8.setToken(null);
    }
  },

  init: () => {
    const token = tokenStore.get();
    if (token) y8.setToken(token);
    return token;
  },
};

// ─── Supported chains ─────────────────────────────────────────────────────

export const Y8_CHAINS = {
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
} as const;

export type SupportedChainId = (typeof Y8_CHAINS)[keyof typeof Y8_CHAINS];

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return Object.values(Y8_CHAINS).includes(chainId as SupportedChainId);
}
