// src/hooks/usePaymentEvents.ts
// Audit trail of a bill (GET /sessions/{id}/pay/events). Reloads whenever `refreshKey` changes,
// so it follows the bill without polling on its own.
import { useCallback, useEffect, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { billiardErrorMessage } from '../utils/billiard';
import type { PaymentEvent } from '../models/interfaces/Billiard';

export function usePaymentEvents(sessionId: number, enabled: boolean, refreshKey: string) {
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!Number.isFinite(sessionId)) return;
    setLoading(true);
    try {
      setEvents(await billiardService.getPaymentEvents(sessionId));
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load payment history'));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (enabled) fetchEvents();
  }, [enabled, refreshKey, fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
