import { useCallback, useEffect, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { billiardErrorMessage } from '../utils/billiard';
import type { BilliardController } from '../models/interfaces/Billiard';

/** Polls GET /billiard/controller/status (every 30s by default; keep it within 30-60s). */
export function useBilliardControllers(pollMs = 30000) {
  const [controllers, setControllers] = useState<BilliardController[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setControllers(await billiardService.getControllerStatus());
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load controller status'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    // Skip ticks while the tab is hidden; catch up as soon as it is visible again.
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refetch();
    }, pollMs);
    const onVisible = () => document.visibilityState === 'visible' && refetch();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pollMs, refetch]);

  return { controllers, loading, error, refetch };
}
