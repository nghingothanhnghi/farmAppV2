import { useCallback, useEffect, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { billiardErrorMessage } from '../utils/billiard';
import type { BilliardController } from '../models/interfaces/Billiard';

/** Polls controller health so staff can spot an offline or stalled controller. */
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
    const timer = setInterval(refetch, pollMs);
    return () => clearInterval(timer);
  }, [pollMs, refetch]);

  return { controllers, loading, error, refetch };
}
