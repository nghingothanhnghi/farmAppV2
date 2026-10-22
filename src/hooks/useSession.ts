// src/components/billiard/hooks/useSession.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage, getStatus, getWaitingTransferLine } from '../utils/billiard';
import type { AddItemPayload, BillResponse, PayPayload, PayResponse } from '../models/interfaces/Billiard';

const POLL_MS = 4000;

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

  // A transfer can be confirmed by the bank feed at any moment: while a transfer line is
  // waiting, refresh the bill every few seconds (visible tab only, never during a mutation).
  const waiting = bill ? getWaitingTransferLine(bill) !== null : false;
  useEffect(() => {
    if (!waiting || !Number.isFinite(sessionId)) return;
    let stopped = false;
    const timer = setInterval(async () => {
      if (stopped || inflight.current || document.visibilityState !== 'visible') return;
      try {
        const fresh = await billiardService.getSession(sessionId);
        if (!stopped && !inflight.current) setBill(fresh);
      } catch (err) {
        if (getStatus(err) === 401 || getStatus(err) === 404) stopped = true; // stop on auth / gone
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [waiting, sessionId]);

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

  const pay = (payload: PayPayload): Promise<PayResponse | null> =>
    run(async () => {
      const res = await billiardService.paySession(sessionId, payload);
      setBill(res);
      return res;
    });

  const confirmPay = (): Promise<BillResponse | null> =>
    run(async () => {
      const res = await billiardService.confirmPayment(sessionId);
      setBill(res);
      return res;
    });

  // "Received" / "Cancel" on a waiting transfer line. The response is the whole bill: redraw from it.
  const confirmLine = (lineId: number): Promise<BillResponse | null> =>
    run(async () => {
      const res = await billiardService.confirmLine(sessionId, lineId);
      setBill(res);
      return res;
    });

  const cancelLine = (lineId: number, reason?: string): Promise<BillResponse | null> =>
    run(async () => {
      const res = await billiardService.cancelLine(sessionId, lineId, reason);
      setBill(res);
      return res;
    }, 'Transfer cancelled.');

  // Manager only: the server answers 403 for anyone else (shown as "Only a manager can do this.").
  const voidLine = (lineId: number, reason: string): Promise<BillResponse | null> =>
    run(async () => {
      const res = await billiardService.voidLine(sessionId, lineId, reason);
      setBill(res);
      return res;
    }, 'Payment voided.');

  return {
    bill,
    loading,
    error,
    busy,
    actions: { fetchBill, addItem, stop, pay, confirmPay, confirmLine, cancelLine, voidLine },
  };
}
