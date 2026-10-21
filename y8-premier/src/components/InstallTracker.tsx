import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface InstallStats {
  total: number;
  byPlatform: Record<string, number>;
  recent: Array<{ ts: number; platform: string; app: string }>;
}

/**
 * Fires the install analytics beacon when the PWA is installed,
 * and optionally displays the install count in a badge.
 */
export function InstallTracker({ showBadge = false }: { showBadge?: boolean }) {
  const [stats, setStats] = useState<InstallStats | null>(null);

  // Track installs
  useEffect(() => {
    const handleInstalled = () => {
      const platform =
        (navigator as any).userAgentData?.platform ||
        (navigator.userAgent.includes('Android') ? 'Android' :
         navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? 'iOS' :
         navigator.userAgent.includes('Win') ? 'Windows' :
         navigator.userAgent.includes('Mac') ? 'macOS' : 'Unknown');

      fetch('/api/analytics/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: 'y8-premier',
          platform,
          ts: Date.now(),
        }),
      }).catch(() => {}); // fire-and-forget
    };

    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, []);

  // Fetch stats if badge is shown
  useEffect(() => {
    if (!showBadge) return;
    fetch('/api/analytics/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [showBadge]);

  if (!showBadge || !stats) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(245,197,24,0.12)',
        border: '1px solid rgba(245,197,24,0.3)',
        borderRadius: '999px',
        padding: '0.25rem 0.75rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: '#92741a',
      }}
    >
      <Download size={12} />
      {stats.total.toLocaleString()} installs
    </div>
  );
}
