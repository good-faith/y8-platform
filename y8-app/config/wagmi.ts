import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  phantomWallet,
  injectedWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet, polygon, optimism, base, sepolia, baseSepolia } from 'wagmi/chains';
import { createConfig, http, type CreateConnectorFn } from 'wagmi';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  'b56e18d47c72ab683b10814fe9495694';

/**
 * Only initialize the WalletConnect relay on page load if the user already has
 * a persisted WalletConnect v2 session in localStorage. Otherwise, defer
 * EthereumProvider.init() until the user actively selects a WalletConnect wallet.
 */
function hasPersistedWcSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('wc@2:') && key.includes('session')) {
        const val = window.localStorage.getItem(key);
        if (val && val !== '[]' && val !== '{}') return true;
      }
    }
  } catch {
    // Ignore localStorage access errors in restricted contexts
  }
  return false;
}

const rawConnectors = connectorsForWallets(
  [
    {
      // WalletConnect first — works on Quest, desktop, and mobile
      groupName: 'Recommended',
      wallets: [
        walletConnectWallet,  // ← Quest: scan QR with phone wallet
        coinbaseWallet,        // ← Base-native, smart wallet support
        metaMaskWallet,        // ← most popular desktop
        rainbowWallet,         // ← best UX on mobile
        phantomWallet,         // ← SOL + ETH + Base users
      ],
    },
    {
      // Extension wallets — desktop only, invisible on Quest
      groupName: 'Other',
      wallets: [
        injectedWallet,        // ← any window.ethereum provider
        trustWallet,           // ← Binance ecosystem
      ],
    },
  ],
  {
    appName: 'Y8 App',
    projectId,
  },
);

const connectors: CreateConnectorFn[] = rawConnectors.map((connectorFn) => {
  return (config) => {
    const connector = connectorFn(config) as ReturnType<CreateConnectorFn> & {
      rkDetails?: { isWalletConnectModalConnector?: boolean };
    };

    if (connector.type === 'walletConnect') {
      const origSetup = connector.setup?.bind(connector);
      const origIsAuthorized = connector.isAuthorized?.bind(connector);

      // Never auto-initialize the secondary Reown AppKit modal connector on mount
      if (connector.rkDetails?.isWalletConnectModalConnector) {
        connector.setup = async () => {};
        connector.isAuthorized = async () => false;
      } else {
        connector.setup = async () => {
          if (!hasPersistedWcSession()) return;
          if (origSetup) await origSetup();
        };
        connector.isAuthorized = async () => {
          if (!hasPersistedWcSession()) return false;
          return origIsAuthorized ? origIsAuthorized() : false;
        };
      }
    }

    return connector;
  };
});

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, polygon, optimism, base, sepolia, baseSepolia],
  ssr: true,
  transports: {
    [mainnet.id]:     http('https://cloudflare-eth.com'),
    [polygon.id]:     http('https://polygon-rpc.com'),
    [optimism.id]:    http('https://mainnet.optimism.io'),
    [base.id]:        http('https://base-mainnet.public.blastapi.io'),
    [sepolia.id]:     http('https://ethereum-sepolia-rpc.publicnode.com'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
});
