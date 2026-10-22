// src/hooks/useBankFeed.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { bankFeedService } from '../services/bankFeedService';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage } from '../utils/billiard';
import type { BankTransaction, BankTxStatus } from '../models/interfaces/BankFeed';

export function useBankFeed(status: BankTxStatus, enabled = true) {
  const { setAlert } = useAlert();
  const [items, setItems] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inflight = useRef(false);
  // Ignore a slow response for a tab the manager has already left.
  const latest = useRef(status);
  latest.current = status;

  const fetchItems = useCallback(async () => {
    try {
      const rows = await bankFeedService.list(status);
      if (latest.current === status) {
        setItems(rows);
        setError(null);
      }
    } catch (err) {
      if (latest.current === status) setError(billiardErrorMessage(err, 'Failed to load bank transactions'));
    } finally {
      if (latest.current === status) setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchItems();
  }, [fetchItems, enabled]);

  async function run(fn: () => Promise<unknown>, okMessage: string): Promise<boolean> {
    if (inflight.current) return false;
    inflight.current = true;
    setBusy(true);
    try {
      await fn();
      setAlert({ type: 'success', message: okMessage });
      await fetchItems();
      return true;
    } catch (err) {
      // 422 (amount differs), 409 (line already settled) and 403 all carry a readable message.
      setAlert({ type: 'error', message: billiardErrorMessage(err) });
      return false;
    } finally {
      inflight.current = false;
      setBusy(false);
    }
  }

  const assign = (txId: number, lineId: number) =>
    run(() => bankFeedService.assign(txId, lineId), 'Transaction assigned to the payment line.');

  const ignore = (txId: number, note?: string) =>
    run(() => bankFeedService.ignore(txId, note), 'Transaction ignored.');

  return { items, loading, error, busy, actions: { fetchItems, assign, ignore } };
}
