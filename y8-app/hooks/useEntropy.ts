/**
 * useEntropy — collects device telemetry and computes a Proof-of-Entropy hash
 *
 * Sources of entropy:
 *  - GPS coordinates (if permitted)
 *  - Device motion: accelerometer + gyroscope
 *  - Network: connection type + RTT
 *  - Battery: level + charging state
 *  - Screen: resolution, pixel ratio, color depth
 *  - Timestamp with sub-millisecond precision
 *  - 32 random bytes from crypto.getRandomValues
 *  - User agent string
 */
import { useState, useCallback, useRef } from 'react';

export interface EntropyData {
  hash: `0x${string}`;      // bytes32 for contract
  score: number;            // 0-100
  deviceType: 'mobile' | 'desktop' | 'tablet';
  sensors: {
    gps: boolean;
    motion: boolean;
    network: boolean;
    battery: boolean;
  };
  raw: Record<string, unknown>; // full telemetry for display
}

function detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

async function sha256Hex(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function useEntropy() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [entropy, setEntropy] = useState<EntropyData | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const motionRef = useRef<{ x: number; y: number; z: number } | null>(null);

  // Listen to device motion briefly
  const listenMotion = (): Promise<{ x: number; y: number; z: number } | null> =>
    new Promise(resolve => {
      const handler = (e: DeviceMotionEvent) => {
        const acc = e.acceleration;
        window.removeEventListener('devicemotion', handler);
        resolve(acc ? { x: acc.x ?? 0, y: acc.y ?? 0, z: acc.z ?? 0 } : null);
      };
      window.addEventListener('devicemotion', handler);
      setTimeout(() => { window.removeEventListener('devicemotion', handler); resolve(null); }, 500);
    });

  const collect = useCallback(async (): Promise<EntropyData | null> => {
    setIsCollecting(true);
    setError(null);
    try {
      const raw: Record<string, unknown> = {};
      const sensors = { gps: false, motion: false, network: false, battery: false };

      // ── Random bytes ────────────────────────────────────────────────────
      const rnd = new Uint8Array(32);
      crypto.getRandomValues(rnd);
      raw.random = Array.from(rnd).map(b => b.toString(16).padStart(2, '0')).join('');

      // ── Timestamp ───────────────────────────────────────────────────────
      raw.timestamp = performance.timeOrigin + performance.now();
      raw.isoTime   = new Date().toISOString();

      // ── Screen ──────────────────────────────────────────────────────────
      raw.screen = {
        w: screen.width, h: screen.height,
        dpr: devicePixelRatio,
        depth: screen.colorDepth,
        orient: screen.orientation?.type,
      };

      // ── User agent ──────────────────────────────────────────────────────
      raw.ua = navigator.userAgent;
      raw.lang = navigator.language;
      raw.cores = navigator.hardwareConcurrency;

      // ── GPS ─────────────────────────────────────────────────────────────
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000, maximumAge: 0 })
        );
        raw.gps = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
        sensors.gps = true;
      } catch { raw.gps = null; }

      // ── Device Motion ───────────────────────────────────────────────────
      const motion = await listenMotion();
      if (motion) { raw.motion = motion; sensors.motion = true; }

      // ── Network ─────────────────────────────────────────────────────────
      const conn = (navigator as any).connection;
      if (conn) {
        raw.network = { type: conn.effectiveType, rtt: conn.rtt, downlink: conn.downlink };
        sensors.network = true;
      }

      // ── Battery ─────────────────────────────────────────────────────────
      try {
        const bat = await (navigator as any).getBattery?.();
        if (bat) { raw.battery = { level: bat.level, charging: bat.charging }; sensors.battery = true; }
      } catch { /**/ }

      // ── Score: how many entropy sources contributed ──────────────────────
      const sourceCount = Object.values(sensors).filter(Boolean).length + 2; // +2 for random+screen always present
      const score = Math.min(100, Math.round((sourceCount / 6) * 100));

      // ── Hash ────────────────────────────────────────────────────────────
      const hexHash = await sha256Hex(JSON.stringify(raw));
      const hash = `0x${hexHash}` as `0x${string}`;

      const result: EntropyData = {
        hash,
        score,
        deviceType: detectDeviceType(),
        sensors,
        raw,
      };

      setEntropy(result);
      return result;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  return { collect, isCollecting, entropy, error };
}
