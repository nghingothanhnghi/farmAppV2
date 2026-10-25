// src/components/billiard/components/PayModal.tsx
// Screen 1 of the payments guide: choose how to pay (cash, bank transfer, split or card).
// Only the method (and the tendered / split amounts) are sent - never the bill total.
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FormInput, FormRadio, FloatingLabelInput } from '../../common/Form';
import {
  formatMoneyString,
  getBalanceDue,
  getBillState,
  getWaitingTransferLine,
} from '../../../utils/billiard';
import type {
  BillResponse,
  LineMethod,
  PayPayload,
  PayResponse,
  SplitLinePayload,
} from '../../../models/interfaces/Billiard';

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bill: BillResponse;
  busy: boolean;
  onPay: (payload: PayPayload) => Promise<PayResponse | null>;
  onConfirm: () => Promise<BillResponse | null>;
  onSettled: (bill: BillResponse) => void;
  /** True when no cash shift is open. Some clubs refuse payment (409) until a shift is opened. */
  noShiftOpen?: boolean;
  onOpenShift?: () => void;
  /** Card is offered only when Stripe is enabled for the club. */
  stripeEnabled?: boolean;
  /** Plug in the app's existing Stripe component here; it must call onSuccess once paid. */
  StripeCheckout?: React.ComponentType<StripeCheckoutProps>;
}

type Mode = 'cash' | 'bank_transfer' | 'split' | 'stripe';

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'cash', label: 'Cash', hint: 'Collected at the counter' },
  { value: 'bank_transfer', label: 'Bank transfer', hint: 'Customer scans a QR and transfers' },
  { value: 'split', label: 'Split', hint: 'Cash and bank transfer together' },
  { value: 'stripe', label: 'Card (Stripe)', hint: 'Pay online by card' },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];
const MAX_SPLIT_LINES = 6;

interface SplitRow {
  key: number;
  method: LineMethod;
  amount: string;
  tendered: string;
}

/** Digits only -> number; empty -> null. VND has no decimals. */
const parseAmount = (raw: string): number | null => {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
};

const fmtNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

const PayModal: React.FC<Props> = ({
  isOpen,
  onClose,
  bill,
  busy,
  onPay,
  onConfirm,
  onSettled,
  noShiftOpen = false,
  onOpenShift,
  stripeEnabled = true,
  StripeCheckout,
}) => {
  const {t} = useTranslation();
  const due = getBalanceDue(bill);
  const [mode, setMode] = useState<Mode>('cash');
  const [tendered, setTendered] = useState<string>(''); // empty = exact payment
  const [rows, setRows] = useState<SplitRow[]>([]);
  const [nextKey, setNextKey] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('cash');
      setTendered('');
      setRows([{ key: 0, method: 'cash', amount: '', tendered: '' }]);
      setNextKey(1);
      setClientSecret(null);
    }
  }, [isOpen]);

  // Card pays the whole bill at once: the server answers 409 once a cash or transfer line exists,
  // so hide it as soon as the bill has one (a waiting or completed line).
  const hasLine = (bill.payments ?? []).some((l) => l.status === 'pending' || l.status === 'completed');
  const modes = MODES.filter((m) => m.value !== 'stripe' || (stripeEnabled && !hasLine));

  // ---- cash ---------------------------------------------------------------
  const tenderedNum = parseAmount(tendered);
  const change = tenderedNum !== null ? tenderedNum - due : 0;
  const cashInvalid = tenderedNum !== null && tenderedNum < due;

  // ---- split --------------------------------------------------------------
  const splitSum = useMemo(
    () => rows.reduce((sum, r) => sum + (parseAmount(r.amount) ?? 0), 0),
    [rows]
  );
  const remaining = due - splitSum;
  const rowError = (r: SplitRow): string | null => {
    const amount = parseAmount(r.amount);
    if (amount === null || amount <= 0) return 'Enter an amount';
    const t = parseAmount(r.tendered);
    if (r.method === 'cash' && t !== null && t < amount) return 'Tendered is below the amount';
    return null;
  };
  const splitInvalid = rows.length === 0 || remaining !== 0 || rows.some((r) => rowError(r) !== null);

  const updateRow = (key: number, patch: Partial<SplitRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () => {
    if (rows.length >= MAX_SPLIT_LINES) return;
    setRows((rs) => [
      ...rs,
      { key: nextKey, method: 'bank_transfer', amount: remaining > 0 ? String(remaining) : '', tendered: '' },
    ]);
    setNextKey((k) => k + 1);
  };
  const removeRow = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));

  // ---- submit -------------------------------------------------------------
  const canPay =
    !busy && (mode === 'cash' ? !cashInvalid : mode === 'split' ? !splitInvalid : true);

  const buildPayload = (): PayPayload => {
    if (mode === 'split') {
      return {
        payments: rows.map<SplitLinePayload>((r) => {
          const line: SplitLinePayload = { method: r.method, amount: parseAmount(r.amount) ?? 0 };
          const t = parseAmount(r.tendered);
          if (r.method === 'cash' && t !== null) line.cash_tendered = t;
          return line;
        }),
      };
    }
    if (mode === 'cash') {
      return tenderedNum !== null
        ? { payment_method: 'cash', cash_tendered: tenderedNum }
        : { payment_method: 'cash' };
    }
    return { payment_method: mode };
  };

  const handlePay = async () => {
    if (!canPay) return;
    const res = await onPay(buildPayload());
    if (!res) return;
    const secret = res.gateway?.client_secret;
    if (mode === 'stripe' && secret && getBillState(res) !== 'paid') {
      setClientSecret(secret);
      return;
    }
    // A waiting transfer line is shown by the transfer-waiting panel on the session page.
    if (getBillState(res) === 'paid' || getWaitingTransferLine(res)) onSettled(res);
    onClose();
  };

  const handleConfirm = async () => {
    const res = await onConfirm();
    if (res) {
      onSettled(res);
      onClose();
    }
  };

  const inStripeStep = clientSecret !== null;
  const money = (n: number) => formatMoneyString(n, bill.currency);

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => { } : onClose}
      title={`Pay ${money(due)}`}
      size="small"
      content={
        <div className="px-10 pb-4 space-y-4">
          {inStripeStep ? (
            StripeCheckout ? (
              <StripeCheckout clientSecret={clientSecret} onSuccess={handleConfirm} />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete the card payment, then confirm to settle the bill.
              </p>
            )
          ) : (
            <>
              <div className="space-y-3">
                {modes.map((m) => (
                  <div key={m.value} className="space-y-0.5">
                    <FormRadio
                      id={`pay-${m.value}`}
                      name="payment_method"
                      label={m.label}
                      checked={mode === m.value}
                      onChange={() => setMode(m.value)}
                      disabled={busy}
                    />
                    <p className="pl-7 text-[0.625rem] text-gray-500 dark:text-gray-400">{m.hint}</p>
                  </div>
                ))}
              </div>

              {noShiftOpen && onOpenShift && (mode === 'cash' || mode === 'split') && (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-2 text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                  <p>No cash shift is open. If this club requires one, payment will be refused.</p>
                  <button type="button" className="underline font-medium" onClick={onOpenShift}>
                    Open a shift
                  </button>
                </div>
              )}

              {mode === 'cash' && (
                <div className="space-y-4 pt-3">
                  <FloatingLabelInput
                    id="cash-tendered"
                    name="cash-tendered"
                    type="text"
                    label={t('input.amount_handed_over.label')}
                    inputMode="numeric"
                    value={tenderedNum === null ? '' : fmtNumber(tenderedNum)}
                    placeholder={`${fmtNumber(due)} (exact)`}
                    alwaysFloat
                    onChange={(e) => setTendered(e.target.value)}
                    disabled={busy}
                  />
                  <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                    <Button
                      label="Exact"
                      size="xs"
                      variant={tenderedNum === null ? 'primary' : 'secondary'}
                      rounded="lg"
                      disabled={busy}
                      onClick={() => setTendered('')}
                    />
                    {QUICK_AMOUNTS.map((a) => (
                      <Button
                        key={a}
                        label={fmtNumber(a)}
                        size="xs"
                        variant="secondary"
                        rounded="lg"
                        disabled={busy}
                        onClick={() => setTendered(String(a))}
                      />
                    ))}
                  </div>
                  {cashInvalid ? (
                    <p className="text-xs text-red-600">
                      Short by {money(due - (tenderedNum ?? 0))}.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      {t('input.change_due.label')}: <span className="font-semibold">{money(Math.max(0, change))}</span>
                    </p>
                  )}
                </div>
              )}

              {mode === 'split' && (
                <div className="space-y-3 border-t border-gray-200 dark:border-white/5 pt-3">
                  {rows.map((r, i) => {
                    const err = rowError(r);
                    return (
                      <div key={r.key} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                          <select
                            aria-label={`Line ${i + 1} method`}
                            value={r.method}
                            disabled={busy}
                            onChange={(e) => updateRow(r.key, { method: e.target.value as LineMethod })}
                            className="text-sm rounded-md border border-slate-200 dark:border-gray-700 bg-transparent dark:bg-gray-800 dark:text-gray-100 px-2 py-2"
                          >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank transfer</option>
                          </select>
                          <FormInput
                            id={`split-amount-${r.key}`}
                            type="text"
                            inputMode="numeric"
                            value={parseAmount(r.amount) === null ? '' : fmtNumber(parseAmount(r.amount)!)}
                            placeholder="Amount"
                            onChange={(e) => updateRow(r.key, { amount: e.target.value })}
                            disabled={busy}
                            className="flex-1 min-w-0"
                          />
                          {rows.length > 1 && (
                            <button
                              type="button"
                              aria-label={`Remove line ${i + 1}`}
                              disabled={busy}
                              onClick={() => removeRow(r.key)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <IconTrash size={16} />
                            </button>
                          )}
                        </div>
                        {r.method === 'cash' && (
                          <FormInput
                            id={`split-tendered-${r.key}`}
                            type="text"
                            inputMode="numeric"
                            value={parseAmount(r.tendered) === null ? '' : fmtNumber(parseAmount(r.tendered)!)}
                            placeholder="Handed over (optional)"
                            onChange={(e) => updateRow(r.key, { tendered: e.target.value })}
                            disabled={busy}
                            className="w-full pl-6"
                          />
                        )}
                        {err && parseAmount(r.amount) !== null && (
                          <p className="pl-6 text-xs text-red-600">{err}</p>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between">
                    <Button
                      label="Add line"
                      size="xs"
                      variant="secondary"
                      rounded="lg"
                      icon={<IconPlus size={14} />}
                      iconPosition="left"
                      disabled={busy || rows.length >= MAX_SPLIT_LINES}
                      onClick={addRow}
                    />
                    <p
                      className={`text-sm font-medium ${remaining === 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      Remaining: {money(remaining)}
                    </p>
                  </div>
                  <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
                    {t('warning.split_method.split_total_warning', { amount: money(due) })}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      }
      actions={
        <div className="flex gap-4">
          {!inStripeStep ? (
            <Button
              label={busy ? 'Processing...' : 'Pay'}
              onClick={handlePay}
              disabled={!canPay}
              className="min-w-[150px]"
              rounded="lg"
            />
          ) : (
            !StripeCheckout && (
              <Button
                label={busy ? 'Confirming...' : 'Confirm payment'}
                onClick={handleConfirm}
                disabled={busy}
                className="min-w-[150px]"
                rounded="lg"
              />
            )
          )}
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={busy} className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default PayModal;
