import { useEffect, useState } from 'react';
import { BACKEND_BASE_URL } from '../config/backend';

export interface LatestTelemetry {
  device_id: string;
  timestamp: number;
  sensors: {
    light?: number;
    uv?: { raw: number; voltage: number; index: number };
    spectral?: number[];
    temp_present?: boolean;
    temp_c?: number;
    rssi?: number;
  };
}

export function useLatestTelemetry() {
  const [data, setData] = useState<LatestTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLatest() {
      setLoading(true);
      setError(null);
      try {
        // Expect backend to provide latest telemetry at /api/telemetry/latest
        const res = await fetch(`${BACKEND_BASE_URL}/api/telemetry/latest`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLatest();
    const id = setInterval(fetchLatest, 5000); // refresh every 5s
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { data, loading, error };
}
