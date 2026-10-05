// src/components/billiard/hooks/useSession.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage, getStatus } from '../utils/billiard';
import type { AddItemPayload, BillResponse, PayResponse, PaymentMethod } from '../models/interfaces/Billiard';

export function useSession(sessionId: number) {
  const { setAlert } = useAlert();
  const [bill, setBill] = useState<BillResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inflight = useRef(false);

  const fetchBill = useCallback(async () => {
    if (!Number.isFinite(sessionId)) {
      setError('Invalid session.');
      setLoading(false);
      return;
    }
    try {
      setBill(await billiardService.getSession(sessionId));
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load session'));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    setLoading(true);
    fetchBill();
  }, [fetchBill]);

  // One in-flight mutation at a time: prevents double start/stop/pay.
  async function run<T>(fn: () => Promise<T>, okMessage?: string): Promise<T | null> {
    if (inflight.current) return null;
    inflight.current = true;
    setBusy(true);
    try {
      const result = await fn();
      if (okMessage) setAlert({ type: 'success', message: okMessage });
      return result;
    } catch (err) {
      setAlert({ type: 'error', message: billiardErrorMessage(err) });
      // 409 = state changed (already stopped / paid / payment in progress) -> resync
      if (getStatus(err) === 409) fetchBill();
      return null;
    } finally {
      inflight.current = false;
      setBusy(false);
    }
  }

  const addItem = async (payload: AddItemPayload): Promise<boolean> =>
    (await run(async () => {
      await billiardService.addItem(sessionId, payload);
      await fetchBill();
      return true;
    }, 'Item added.')) === true;

  const stop = async (): Promise<boolean> =>
    (await run(async () => {
      setBill(await billiardService.stopSession(sessionId));
      return true;
    }, 'Session stopped.')) === true;

  const pay = (method: PaymentMethod): Promise<PayResponse | null> =>
    run(async () => {
      const res = await billiardService.paySession(sessionId, method);
      setBill(res);
      return res;
    });

  const confirmPay = (): Promise<BillResponse | null> =>
    run(async () => {
      const res = await billiardService.confirmPayment(sessionId);
      setBill(res);
      return res;
    });

  return { bill, loading, error, busy, actions: { fetchBill, addItem, stop, pay, confirmPay } };
}
