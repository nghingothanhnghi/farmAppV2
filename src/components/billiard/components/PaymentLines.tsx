// src/components/billiard/components/PaymentLines.tsx
// Screen 4 of the payments guide: the receipt (paid bill) and the payment-line history.
// Drawn from the bill alone. A bill can go from paid back to pending/unpaid when a manager
// voids a line, so this never assumes "paid" is final.
import React, { useState } from 'react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { formatDateTime, formatMoneyString, getBillState, toAmount } from '../../../utils/billiard';
import type { BillResponse, LineStatus, PaymentLine } from '../../../models/interfaces/Billiard';

interface Props {
  bill: BillResponse;
  /** Managers and admins only; the server enforces it too (403). */
  canVoid: boolean;
  busy: boolean;
  onVoid: (lineId: number, reason: string) => Promise<unknown>;
}

const METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  stripe: 'Card',
  split: 'Split',
};

const STATUS_BADGE: Record<LineStatus, { label: string; variant: 'warning' | 'success' | 'gray' | 'danger' }> = {
  pending: { label: 'Waiting', variant: 'warning' },
  completed: { label: 'Paid', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'gray' },
  voided: { label: 'Voided', variant: 'gray' },
  failed: { label: 'Failed', variant: 'danger' },
};

const MIN_REASON = 3;
const MAX_REASON = 255;

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <span className="text-gray-800 dark:text-gray-100 text-right">{value}</span>
  </div>
);

const LineItem: React.FC<{
  line: PaymentLine;
  currency: string;
  canVoid: boolean;
  busy: boolean;
  onVoid: (line: PaymentLine) => void;
}> = ({ line, currency, canVoid, busy, onVoid }) => {
  const badge = STATUS_BADGE[line.status] ?? { label: line.status, variant: 'gray' as const };
  // cancelled / voided lines stay visible but greyed out
  const dimmed = line.status === 'cancelled' || line.status === 'voided';

  return (
    <li className={`py-2 space-y-1 ${dimmed ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-sm text-gray-800 dark:text-gray-100 ${dimmed ? 'line-through' : ''}`}>
            {METHOD_LABEL[line.method] ?? line.method}
          </span>
          <Badge label={badge.label} variant={badge.variant} size="xsmall" />
        </div>
        <span className={`text-sm font-medium text-gray-900 dark:text-white ${dimmed ? 'line-through' : ''}`}>
          {formatMoneyString(line.amount, currency)}
        </span>
      </div>

      {line.method === 'cash' && line.status === 'completed' && line.cash_tendered !== null && (
        <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
          Handed over {formatMoneyString(line.cash_tendered, currency)}
          {line.change_given !== null && <> · Change {formatMoneyString(line.change_given, currency)}</>}
        </p>
      )}
      {line.status === 'completed' && line.confirmed_at && (
        <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">{formatDateTime(line.confirmed_at)}</p>
      )}
      {line.status === 'voided' && (
        <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
          Voided {formatDateTime(line.voided_at)}
          {line.void_reason ? ` · ${line.void_reason}` : ''}
        </p>
      )}
      {line.status === 'failed' && (
        <p className="text-[0.6875rem] text-red-600">
          This payment could not be recorded. Pay the balance again.
        </p>
      )}

      {line.status === 'completed' && canVoid && (
        <div className="flex justify-end">
          <Button
            label="Void"
            size="xs"
            variant="danger"
            rounded="lg"
            disabled={busy}
            onClick={() => onVoid(line)}
          />
        </div>
      )}
    </li>
  );
};

const PaymentLines: React.FC<Props> = ({ bill, canVoid, busy, onVoid }) => {
  const c = bill.currency;
  const state = getBillState(bill);
  const paid = state === 'paid';
  const lines = bill.payments ?? [];

  const [voiding, setVoiding] = useState<PaymentLine | null>(null);
  const [reason, setReason] = useState('');

  // Nothing to show: no lines, and not a settled bill.
  if (!paid && lines.length === 0) return null;

  const trimmed = reason.trim();
  const reasonOk = trimmed.length >= MIN_REASON && trimmed.length <= MAX_REASON;
  const balance = toAmount(bill.balance_due);

  const closeVoid = () => {
    if (busy) return;
    setVoiding(null);
    setReason('');
  };

  const submitVoid = async () => {
    if (!voiding || !reasonOk) return;
    const res = await onVoid(voiding.id, trimmed);
    if (res) {
      setVoiding(null);
      setReason('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 dark:bg-gray-900 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {paid ? 'Receipt' : 'Payments'}
        </h3>
        {bill.payment_method && paid && (
          <Badge label={METHOD_LABEL[bill.payment_method] ?? bill.payment_method} variant="info" size="xsmall" />
        )}
      </div>

      {lines.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-white/5">
          {lines.map((l) => (
            <LineItem
              key={l.id}
              line={l}
              currency={c}
              canVoid={canVoid}
              busy={busy}
              onVoid={(line) => setVoiding(line)}
            />
          ))}
        </ul>
      ) : (
        // Paid before the payment module existed: settled, but there is no line detail.
        <p className="text-sm text-gray-600 dark:text-gray-300">Settled. No payment line detail is available for this bill.</p>
      )}

      <div className="space-y-1.5 border-t border-gray-200 dark:border-white/5 pt-3">
        {lines.length > 0 && <Row label="Paid so far" value={formatMoneyString(bill.amount_paid ?? 0, c)} />}
        {!paid && balance > 0 && <Row label="Balance due" value={<b>{formatMoneyString(balance, c)}</b>} />}
        {paid && <Row label="Paid at" value={formatDateTime(bill.paid_at)} />}
        {paid && (
          <Row
            label="Received by"
            value={bill.paid_by ?? 'Confirmed automatically by the bank'}
          />
        )}
      </div>

      <Modal
        isOpen={voiding !== null}
        onClose={closeVoid}
        title={voiding ? `Void ${formatMoneyString(voiding.amount, c)}` : 'Void payment'}
        size="small"
        content={
          <div className="px-10 pb-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The bill will reopen and can be paid again. Give a reason for the record.
            </p>
            <textarea
              aria-label="Void reason"
              rows={3}
              maxLength={MAX_REASON}
              value={reason}
              disabled={busy}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. gave too much change"
              className="w-full text-sm bg-transparent dark:bg-gray-800 dark:text-gray-100 border border-slate-200 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400"
            />
            {reason.length > 0 && !reasonOk && (
              <p className="text-xs text-red-600">Reason must be at least {MIN_REASON} characters.</p>
            )}
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button
              label={busy ? 'Voiding...' : 'Void payment'}
              variant="danger"
              onClick={submitVoid}
              disabled={busy || !reasonOk}
              className="min-w-[150px]"
              rounded="lg"
            />
            <Button label="Cancel" variant="secondary" onClick={closeVoid} disabled={busy} className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />
    </div>
  );
};

export default PaymentLines;
