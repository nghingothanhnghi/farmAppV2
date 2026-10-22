// src/components/billiard/components/AssignTransactionModal.tsx
// Links a bank transaction to a waiting transfer line. There is no endpoint that lists every
// waiting line, so the manager opens the bill (by session number) and picks the line from it.
import React, { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FormInput } from '../../common/Form';
import { billiardService } from '../../../services/billiard_service';
import { billiardErrorMessage, formatMoneyString, parseWholeAmount, toAmount } from '../../../utils/billiard';
import type { BankTransaction } from '../../../models/interfaces/BankFeed';
import type { BillResponse, PaymentLine } from '../../../models/interfaces/Billiard';

interface Props {
  tx: BankTransaction | null;
  busy: boolean;
  onClose: () => void;
  onAssign: (txId: number, lineId: number) => Promise<boolean>;
}

const AssignTransactionModal: React.FC<Props> = ({ tx, busy, onClose, onAssign }) => {
  const [sessionId, setSessionId] = useState('');
  const [bill, setBill] = useState<BillResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineId, setLineId] = useState<number | null>(null);

  useEffect(() => {
    if (tx) {
      setSessionId('');
      setBill(null);
      setError(null);
      setLineId(null);
    }
  }, [tx]);

  const waiting: PaymentLine[] =
    bill?.payments?.filter((p) => p.method === 'bank_transfer' && p.status === 'pending') ?? [];
  const selected = waiting.find((l) => l.id === lineId) ?? null;
  // VND has no decimals: compare as numbers, not strings ("110000.00" vs "110000").
  const mismatch = !!tx && !!selected && toAmount(selected.amount) !== toAmount(tx.amount);

  const loadBill = async () => {
    const id = parseWholeAmount(sessionId);
    if (id === null || id <= 0) return;
    setLoading(true);
    setError(null);
    setBill(null);
    setLineId(null);
    try {
      setBill(await billiardService.getSession(id));
    } catch (err) {
      setError(billiardErrorMessage(err, 'Could not load this bill'));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!tx || !selected || mismatch) return;
    if (await onAssign(tx.id, selected.id)) onClose();
  };

  return (
    <Modal
      isOpen={tx !== null}
      onClose={busy ? () => {} : onClose}
      title="Assign to a payment"
      size="small"
      content={
        tx && (
          <div className="px-10 pb-4 space-y-3">
            <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3 text-sm space-y-0.5">
              <p className="font-semibold text-gray-900 dark:text-white">{formatMoneyString(tx.amount)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 break-words">{tx.content ?? '—'}</p>
            </div>

            <div className="flex items-center gap-2">
              <FormInput
                id="assign-session"
                type="text"
                inputMode="numeric"
                value={sessionId}
                placeholder="Session number"
                onChange={(e) => setSessionId(e.target.value)}
                disabled={busy || loading}
                className="flex-1"
              />
              <Button
                label={loading ? 'Loading...' : 'Find bill'}
                variant="secondary"
                rounded="lg"
                disabled={busy || loading || parseWholeAmount(sessionId) === null}
                onClick={loadBill}
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}

            {bill && waiting.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This bill has no waiting bank-transfer line.
              </p>
            )}

            {waiting.length > 0 && (
              <ul className="space-y-2">
                {waiting.map((l) => (
                  <li key={l.id}>
                    <label className="flex items-center justify-between gap-3 cursor-pointer rounded-md border border-slate-200 dark:border-gray-700 p-2 text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="assign-line"
                          checked={lineId === l.id}
                          onChange={() => setLineId(l.id)}
                          disabled={busy}
                        />
                        <span className="text-gray-800 dark:text-gray-100">
                          Line #{l.id}
                          {l.transfer?.memo ? ` · ${l.transfer.memo}` : ''}
                        </span>
                      </span>
                      <span className="font-medium">{formatMoneyString(l.amount, bill?.currency)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {mismatch && selected && (
              <p className="text-xs text-red-600">
                The line is {formatMoneyString(selected.amount)} but the transaction is{' '}
                {formatMoneyString(tx.amount)}. The amounts must be equal.
              </p>
            )}
          </div>
        )
      }
      actions={
        <div className="flex gap-4">
          <Button
            label={busy ? 'Assigning...' : 'Assign'}
            onClick={submit}
            disabled={busy || !selected || mismatch}
            className="min-w-[150px]"
            rounded="lg"
          />
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={busy} className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default AssignTransactionModal;
