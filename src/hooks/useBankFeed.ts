// src/hooks/useBankFeed.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { bankFeedService } from '../services/bankFeedService';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage } from '../utils/billiard';
import { BANK_FEED_PAGE_SIZE } from '../models/interfaces/BankFeed';
import type { BankTransaction, BankTxStatus } from '../models/interfaces/BankFeed';

export function useBankFeed(status: BankTxStatus, enabled = true) {
  const { setAlert } = useAlert();
  const [items, setItems] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // A page shorter than the page size means there is nothing more to load.
  const [hasMore, setHasMore] = useState(false);
  const inflight = useRef(false);
  // Ignore a slow response for a tab the manager has already left.
  const latest = useRef(status);
  latest.current = status;

  // Reloading always restarts at the first page, so a row never repeats.
  const fetchItems = useCallback(async () => {
    try {
      const rows = await bankFeedService.list(status, BANK_FEED_PAGE_SIZE, 0);
      if (latest.current === status) {
        setItems(rows);
        setHasMore(rows.length >= BANK_FEED_PAGE_SIZE);
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
    setItems([]);
    setHasMore(false);
    fetchItems();
  }, [fetchItems, enabled]);

  // "Load more": raise offset by the page size (= rows already loaded).
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const rows = await bankFeedService.list(status, BANK_FEED_PAGE_SIZE, items.length);
      if (latest.current === status) {
        // Guard against a row that moved between pages while the list was open.
        setItems((prev) => {
          const seen = new Set(prev.map((r) => r.id));
          return [...prev, ...rows.filter((r) => !seen.has(r.id))];
        });
        setHasMore(rows.length >= BANK_FEED_PAGE_SIZE);
      }
    } catch (err) {
      setAlert({ type: 'error', message: billiardErrorMessage(err, 'Failed to load more transactions') });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, status, items.length, setAlert]);

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

  return { items, loading, loadingMore, hasMore, error, busy, actions: { fetchItems, loadMore, assign, ignore } };
}
