// src/components/billiard/hooks/useActiveTables.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { billiardErrorMessage } from '../utils/billiard';
import type { ActiveTable } from '../models/interfaces/Billiard';

/** Live (playing) tables, polled every `pollMs` (default 30s). */
export function useActiveTables(pollMs = 30000) {
  const [active, setActive] = useState<ActiveTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setActive(await billiardService.getActiveTables());
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load live tables'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const t = setInterval(refetch, pollMs);
    return () => clearInterval(t);
  }, [refetch, pollMs]);

  const byTableId = useMemo(() => new Map(active.map((a) => [a.table_id, a])), [active]);
  const bySessionId = useMemo(() => new Map(active.map((a) => [a.session_id, a])), [active]);

  return { active, byTableId, bySessionId, loading, error, refetch };
}
