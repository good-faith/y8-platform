import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  phantomWallet,
  injectedWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet, polygon, optimism, base } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'Y8 App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',

  wallets: [
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

  chains: [mainnet, polygon, optimism, base],
  ssr: true,

  transports: {
    [mainnet.id]:  http('https://cloudflare-eth.com'),
    [polygon.id]:  http('https://polygon-rpc.com'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [base.id]:     http('https://base-mainnet.public.blastapi.io'),
  },
});
