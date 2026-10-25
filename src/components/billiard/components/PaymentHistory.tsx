// src/components/billiard/components/PaymentHistory.tsx
// "History" panel of the payments guide: every payment action on the bill, newest last.
import React, { useState } from 'react';
import { usePaymentEvents } from '../../../hooks/usePaymentEvents';
import { formatDateTime, formatMoneyString } from '../../../utils/billiard';
import type { BillResponse } from '../../../models/interfaces/Billiard';

const EVENT_LABEL: Record<string, string> = {
  line_created: 'Payment line created',
  cash_received: 'Cash received',
  transfer_awaiting: 'Waiting for bank transfer',
  transfer_confirmed: 'Transfer confirmed by cashier',
  transfer_auto_confirmed: 'Transfer confirmed automatically by the bank',
  transfer_assigned_from_bank: 'Bank transaction assigned by a manager',
  line_cancelled: 'Payment line cancelled',
  line_failed: 'Payment line failed',
  line_voided: 'Payment line voided',
  order_paid: 'Bill fully paid',
};

const prettify = (type: string) => EVENT_LABEL[type] ?? type.replace(/_/g, ' ');

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null);

/** Pick the few readable details out of the free-form `data` object. */
const detail = (data: Record<string, unknown> | null, currency: string): string | null => {
  if (!data) return null;
  const parts: string[] = [];
  const amount = data.amount;
  if (typeof amount === 'string' || typeof amount === 'number') parts.push(formatMoneyString(amount, currency));
  const reason = str(data.reason) ?? str(data.note);
  if (reason) parts.push(reason);
  return parts.length ? parts.join(' · ') : null;
};

interface Props {
  bill: BillResponse;
}

const PaymentHistory: React.FC<Props> = ({ bill }) => {
  const [open, setOpen] = useState(false);
  // Anything that changes a payment changes at least one of these, so the panel stays current.
  const refreshKey = `${bill.payment_state}|${bill.amount_paid ?? ''}|${bill.payments?.length ?? 0}|${
    bill.payments?.map((p) => p.status).join(',') ?? ''
  }`;
  const { events, loading, error, refetch } = usePaymentEvents(bill.session_id, open, refreshKey);

  // Nothing has happened to the bill's payment yet.
  if (bill.payment_state === 'unpaid' && !(bill.payments?.length)) return null;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 dark:bg-gray-900 p-4 space-y-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-800 dark:text-gray-100"
      >
        <span>Payment history</span>
        <span className="text-xs text-gray-500">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <>
          {error && (
            <p className="text-xs text-red-600">
              {error}{' '}
              <button type="button" className="underline" onClick={refetch}>
                Retry
              </button>
            </p>
          )}
          {loading && events.length === 0 ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : events.length === 0 && !error ? (
            <p className="text-xs text-gray-500">No payment activity recorded.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-white/5">
              {events.map((ev) => {
                const extra = detail(ev.data, bill.currency);
                return (
                  <li key={ev.id} className="py-2 space-y-0.5">
                    <p className="text-sm text-gray-800 dark:text-gray-100">{prettify(ev.event_type)}</p>
                    <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                      {formatDateTime(ev.created_at)}
                      {ev.line_id !== null ? ` · line #${ev.line_id}` : ''}
                      {ev.actor_id === null ? ' · system' : ` · user #${ev.actor_id}`}
                      {extra ? ` · ${extra}` : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistory;
