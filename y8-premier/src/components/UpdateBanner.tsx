import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface UpdateBannerProps {
  appName?: string;
}

/**
 * Detects when a new service worker is waiting and shows a banner
 * prompting the user to update. Sends SKIP_WAITING to activate the
 * new SW, then reloads the page to load fresh assets.
 */
export function UpdateBanner({ appName = 'Y8 Premier' }: UpdateBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowBanner(true);
        return;
      }
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(installing);
            setShowBanner(true);
          }
        });
      });
    };

    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) handleUpdate(reg);
    });

    // Listen for controller change (new SW activated) → reload
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;
    setIsUpdating(true);
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    // Reload will happen via controllerchange listener above
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, #003087 0%, #0057b8 100%)',
        color: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,48,135,0.4)',
        fontSize: '0.875rem',
        fontWeight: 500,
        maxWidth: '90vw',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <span>🚀 A new version of {appName} is ready.</span>

      <button
        onClick={handleUpdate}
        disabled={isUpdating}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#f5c518',
          color: '#003087',
          border: 'none',
          borderRadius: '8px',
          padding: '0.4rem 0.875rem',
          fontWeight: 700,
          fontSize: '0.8rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <RefreshCw
          size={13}
          style={{ animation: isUpdating ? 'spin 1s linear infinite' : 'none' }}
        />
        {isUpdating ? 'Updating…' : 'Update now'}
      </button>

      <button
        onClick={() => setShowBanner(false)}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Dismiss update"
      >
        <X size={15} />
      </button>
    </div>
  );
}
