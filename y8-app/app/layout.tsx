import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Poppins, Inter } from 'next/font/google';
import Providers from '../components/Providers';
import TopBar from '../components/ui/TopBar';
import NotificationBar from '../components/ui/NotificationBar';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import RouteGuard from '../components/RouteGuard';
import '../styles/globals.css';

// Configure fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5c518',
};


export const metadata: Metadata = {
  title: {
    default: 'Home | Y8',
    template: '%s | Y8',
  },
  description: 'Premier lifestyle services for everyone.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Y8',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <NotificationBar />
          <TopBar />
          <Header />

          <main className="main-content">
            <RouteGuard>
              {children}
            </RouteGuard>
          </main>
          
          <Footer />
        </Providers>
        {/* PWA service worker registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            });
          }
        `}} />
      </body>
    </html>
  );
}