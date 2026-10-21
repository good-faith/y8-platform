"use client";

import React, { useEffect, useState } from 'react';

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('SW registered successfully:', reg.scope);
          })
          .catch((err) => console.error('SW registration failed:', err));
      }

      const handlePrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsVisible(true);
      };

      window.addEventListener('beforeinstallprompt', handlePrompt);
      return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-install-banner fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded shadow-lg z-50">
      <span>Install Y8 App</span>
      <button id="pwa-install-btn" onClick={handleInstall} className="ml-3 bg-blue-600 px-3 py-1 rounded">
        Install
      </button>
    </div>
  );
}
