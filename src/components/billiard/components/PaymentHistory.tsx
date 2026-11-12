// src/components/billiard/components/PaymentHistory.tsx
// "History" panel of the payments guide: every payment action on the bill, newest last.
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaymentEvents } from '../../../hooks/usePaymentEvents';
import { formatDateTime } from '../../../utils/formatters';
import { formatMoneyString } from '../../../utils/billiard';
import type { BillResponse } from '../../../models/interfaces/Billiard';
import Button from '../../common/Button';
import Spinner from '../../common/Spinner';
import { getPaymentEventLabel } from '../../../utils/status';

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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // Anything that changes a payment changes at least one of these, so the panel stays current.
  const refreshKey = `${bill.payment_state}|${bill.amount_paid ?? ''}|${bill.payments?.length ?? 0}|${bill.payments?.map((p) => p.status).join(',') ?? ''
    }`;
  const { events, loading, error, refetch } = usePaymentEvents(bill.session_id, open, refreshKey);

  // Nothing has happened to the bill's payment yet.
  if (bill.payment_state === 'unpaid' && !(bill.payments?.length)) return null;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 dark:bg-gray-900 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {t('cashier.payment_history')}
        </h3>
        <Button
          label={open ? t('btn.hide') : t('btn.show')}
          onClick={() => setOpen((o) => !o)}
          type="button"
          size="xs"
          rounded="lg"
          variant="secondary"
          className="min-w-[60px]"
        />
      </div>

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
            <Spinner className="mx-auto" />
          ) : events.length === 0 && !error ? (
            <p className="text-xs text-gray-500">No payment activity recorded.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-white/5">
              {events.map((ev) => {
                const extra = detail(ev.data, bill.currency);
                return (
                  <li key={ev.id} className="py-2 space-y-0.5">
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      {getPaymentEventLabel(ev.event_type)}
                    </p>
                    <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                      {formatDateTime(ev.created_at)}
                      {ev.line_id !== null && (
                        <> · {t('cashier.payment_line', { id: ev.line_id })}</>
                      )}
                      {ev.actor_id === null
                        ? <> · {t('cashier.system')}</>
                        : <> · {t('cashier.user', { id: ev.actor_id })}</>}
                      {extra && <> · {extra}</>}
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
