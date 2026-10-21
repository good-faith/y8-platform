"use client";

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { wagmiConfig } from '../config/wagmi';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { SessionProvider } from 'next-auth/react';
import PWAInstall from './PWAInstall';
import '@rainbow-me/rainbowkit/styles.css';

const Y8_LIGHT_THEME = lightTheme({
  accentColor: '#f5c518',
  accentColorForeground: '#1a1a1a',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <SessionProvider refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider>
            <RainbowKitProvider modalSize="compact" theme={Y8_LIGHT_THEME}>
              <AuthProvider>
                <PWAInstall />
                {children}
              </AuthProvider>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}
