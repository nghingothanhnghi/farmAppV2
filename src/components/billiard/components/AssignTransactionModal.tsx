// src/components/billiard/components/AssignTransactionModal.tsx
// Links a bank transaction to a waiting transfer line. The picker comes from
// GET /payments/bank-feed/pending-lines?amount=<transaction amount> (managers only), so only
// waiting lines of exactly the same amount are offered.
import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import Spinner from '../../common/Spinner';
import { bankFeedService } from '../../../services/bankFeedService';
import { billiardErrorMessage, formatMoneyString, toAmount } from '../../../utils/billiard';
import { formatDateTime } from '../../../utils/formatters';
import { BANK_FEED_PAGE_SIZE } from '../../../models/interfaces/BankFeed';
import type { BankTransaction, PendingTransferLine } from '../../../models/interfaces/BankFeed';

interface Props {
  tx: BankTransaction | null;
  busy: boolean;
  onClose: () => void;
  onAssign: (txId: number, lineId: number) => Promise<boolean>;
}

const AssignTransactionModal: React.FC<Props> = ({ tx, busy, onClose, onAssign }) => {
  const [lines, setLines] = useState<PendingTransferLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineId, setLineId] = useState<number | null>(null);

  const txId = tx?.id ?? null;
  const txAmount = tx?.amount ?? null;

  // Load the first page of matching waiting lines each time a transaction is opened.
  useEffect(() => {
    if (txId === null || txAmount === null) return;
    let cancelled = false;
    setLines([]);
    setLineId(null);
    setError(null);
    setHasMore(false);
    setLoading(true);
    bankFeedService
      .pendingLines(txAmount, BANK_FEED_PAGE_SIZE, 0)
      .then((rows) => {
        if (cancelled) return;
        setLines(rows);
        setHasMore(rows.length >= BANK_FEED_PAGE_SIZE);
      })
      .catch((err) => {
        if (!cancelled) setError(billiardErrorMessage(err, 'Could not load waiting payments'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [txId, txAmount]);

  const loadMore = useCallback(async () => {
    if (txAmount === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const rows = await bankFeedService.pendingLines(txAmount, BANK_FEED_PAGE_SIZE, lines.length);
      setLines((prev) => {
        const seen = new Set(prev.map((l) => l.line_id));
        return [...prev, ...rows.filter((l) => !seen.has(l.line_id))];
      });
      setHasMore(rows.length >= BANK_FEED_PAGE_SIZE);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Could not load more waiting payments'));
    } finally {
      setLoadingMore(false);
    }
  }, [txAmount, loadingMore, lines.length]);

  const selected = lines.find((l) => l.line_id === lineId) ?? null;
  // VND has no decimals: compare as numbers, not strings ("110000.00" vs "110000").
  // The server already filters by amount; this guards the button if the list is ever mixed.
  const mismatch = !!tx && !!selected && toAmount(selected.amount) !== toAmount(tx.amount);

  const submit = async () => {
    if (!tx || !selected || mismatch) return;
    if (await onAssign(tx.id, selected.line_id)) onClose();
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

            {loading && <Spinner className="mx-auto my-4" />}
            {error && <p className="text-xs text-red-600">{error}</p>}

            {!loading && !error && lines.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No waiting bank-transfer line has this amount. If the customer has not paid again yet,
                pay the bill with a new transfer line first, then assign this transaction to it.
              </p>
            )}

            {lines.length > 0 && (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {lines.map((l) => (
                  <li key={l.line_id}>
                    <label className="flex items-center justify-between gap-3 cursor-pointer rounded-md border border-slate-200 dark:border-gray-700 p-2 text-sm">
                      <span className="flex items-start gap-2 min-w-0">
                        <input
                          type="radio"
                          name="assign-line"
                          className="mt-1"
                          checked={lineId === l.line_id}
                          onChange={() => setLineId(l.line_id)}
                          disabled={busy}
                        />
                        <span className="min-w-0">
                          <span className="block text-gray-800 dark:text-gray-100">
                            Session #{l.source_id} · Line #{l.line_id}
                            {l.transfer_memo ? ` · ${l.transfer_memo}` : ''}
                          </span>
                          <span className="flex items-center gap-2 text-[0.6875rem] text-gray-500 dark:text-gray-400">
                            {formatDateTime(l.created_at)}
                            {l.expired && <Badge label="QR expired" variant="warning" size="xsmall" />}
                          </span>
                        </span>
                      </span>
                      <span className="font-medium shrink-0">{formatMoneyString(l.amount)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {hasMore && (
              <div className="flex justify-center">
                <Button
                  label={loadingMore ? 'Loading...' : 'Load more'}
                  variant="secondary"
                  size="xs"
                  rounded="lg"
                  disabled={loadingMore || busy}
                  onClick={loadMore}
                />
              </div>
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
