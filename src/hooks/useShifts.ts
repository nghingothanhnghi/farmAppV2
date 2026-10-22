// src/hooks/useShifts.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { shiftService } from '../services/shiftService';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage, getStatus } from '../utils/billiard';
import type {
  CloseShiftPayload,
  MovementPayload,
  OpenShiftPayload,
  Shift,
  ShiftSummary,
} from '../models/interfaces/CashDrawer';

const PAGE = 30;

/** Just the open shift (or null). Used to warn a cashier before taking cash with no shift open. */
export function useCurrentShift(enabled = true) {
  const [current, setCurrent] = useState<ShiftSummary | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setChecked(false);
    shiftService
      .getCurrent()
      .then((s) => !cancelled && setCurrent(s))
      .catch(() => !cancelled && setCurrent(null))
      .finally(() => !cancelled && setChecked(true));
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { current, checked };
}

export function useShifts() {
  const { setAlert } = useAlert();
  const [current, setCurrent] = useState<ShiftSummary | null>(null);
  const [history, setHistory] = useState<Shift[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** The shift that was just closed, so its variance stays visible after `current` becomes null. */
  const [lastClosed, setLastClosed] = useState<ShiftSummary | null>(null);
  const inflight = useRef(false);

  const fetchCurrent = useCallback(async () => {
    try {
      setCurrent(await shiftService.getCurrent());
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load the cash drawer'));
    }
  }, []);

  const fetchHistory = useCallback(async (reset = true) => {
    try {
      const offset = reset ? 0 : history.length;
      const rows = await shiftService.list(PAGE, offset);
      setHistory((prev) => (reset ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load shift history'));
    }
  }, [history.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.all([fetchCurrent(), fetchHistory(true)]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run<T>(fn: () => Promise<T>, okMessage: string, errorOverride?: Record<number, string>): Promise<T | null> {
    if (inflight.current) return null;
    inflight.current = true;
    setBusy(true);
    try {
      const result = await fn();
      setAlert({ type: 'success', message: okMessage });
      return result;
    } catch (err) {
      const status = getStatus(err);
      setAlert({
        type: 'error',
        message: (status && errorOverride?.[status]) || billiardErrorMessage(err),
      });
      // 409 = state changed (e.g. a shift is already open) -> load the real one
      if (status === 409) fetchCurrent();
      return null;
    } finally {
      inflight.current = false;
      setBusy(false);
    }
  }

  const open = (payload: OpenShiftPayload) =>
    run(async () => {
      const s = await shiftService.open(payload);
      setCurrent(s);
      setLastClosed(null);
      fetchHistory(true);
      return s;
    }, 'Shift opened.');

  const moveCash = (payload: MovementPayload) =>
    run(async () => {
      if (!current) throw new Error('No open shift');
      const s = await shiftService.moveCash(current.id, payload);
      setCurrent(s);
      return s;
    }, payload.type === 'pay_in' ? 'Pay-in recorded.' : 'Pay-out recorded.');

  const close = (payload: CloseShiftPayload) =>
    run(
      async () => {
        if (!current) throw new Error('No open shift');
        const s = await shiftService.close(current.id, payload);
        setCurrent(null);
        setLastClosed(s);
        fetchHistory(true);
        return s;
      },
      'Shift closed.',
      { 403: 'Only the user who opened the shift, or a manager, can close it.' }
    );

  return {
    current,
    lastClosed,
    history,
    hasMore,
    loading,
    error,
    busy,
    actions: { fetchCurrent, fetchHistory, open, moveCash, close, dismissClosed: () => setLastClosed(null) },
  };
}
