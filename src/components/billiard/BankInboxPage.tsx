// src/components/billiard/BankInboxPage.tsx
// Screen 6 of the payments guide: manager bank inbox (SePay transactions that need a human).
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { IconArrowLeft } from '@tabler/icons-react';
import InboxImg from '../../assets/icons/inbox.png';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import Spinner from '../common/Spinner';
import { FormInput } from '../common/Form';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { useBankFeed } from '../../hooks/useBankFeed';
import { formatDateTime } from '../../utils/formatters';
import { formatMoneyString } from '../../utils/billiard';
import AssignTransactionModal from './components/AssignTransactionModal';
import type { BankTransaction, BankTxStatus } from '../../models/interfaces/BankFeed';
import {
  BANK_TX_STATUS_TABS,
  getBankTxStatusLabel,
  getBankTxStatusVariant,
} from '../../utils/status';

const BankInboxPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canView = useHasAnyRole(['admin', 'super_admin', 'manager']);
  const [tab, setTab] = useState<BankTxStatus>('needs_review');
  const { items, loading, loadingMore, hasMore, error, busy, actions } = useBankFeed(tab, canView);

  const [assignTx, setAssignTx] = useState<BankTransaction | null>(null);
  const [ignoreTx, setIgnoreTx] = useState<BankTransaction | null>(null);
  const [note, setNote] = useState('');

  if (!canView) {
    return (
      <div className="text-red-500 font-semibold text-center mt-10">
        Unauthorized: You do not have access to view this page.
      </div>
    );
  }

  const closeIgnore = () => {
    if (busy) return;
    setIgnoreTx(null);
    setNote('');
  };
  const submitIgnore = async () => {
    if (!ignoreTx) return;
    if (await actions.ignore(ignoreTx.id, note.trim() || undefined)) {
      setIgnoreTx(null);
      setNote('');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-6">
      <PageTitle
        title={t('bank_inbox.page_header.title')}
        subtitle={t('bank_inbox.page_header.description')}
        actions={
          <Button
            label={t('btn.back_to_tables')}
            variant="secondary"
            icon={<IconArrowLeft size={16} />}
            iconPosition="left"
            rounded="lg"
            onClick={() => navigate('/billiard')}
          />
        }
      />
      <div className='mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col space-y-4'>
        <div role="tablist" className="flex flex-wrap gap-2">
          {BANK_TX_STATUS_TABS.map((tb) => (
            <Button
              key={tb.id}
              label={t(tb.label)}
              size="sm"
              rounded="full"
              variant={tab === tb.id ? 'primary' : 'secondary'}
              onClick={() => setTab(tb.id)}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <div className="flex flex-1 min-h-[300px] items-center justify-center">
          {loading ? (
            <Spinner className="mx-auto mt-10" />
          ) : items.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                imageSrc={InboxImg}
                width={100}
                height={100}
                message="Nothing here."
              />
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-white/5 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-white/5">
              {items.map((tx) => {
                const actionable = tx.status === 'needs_review' || tx.status === 'unmatched';
                return (
                  <li key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {formatMoneyString(tx.amount)}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-200 break-words">{tx.content ?? '—'}</p>
                      </div>
                      <Badge
                        label={getBankTxStatusLabel(tx.status)}
                        variant={getBankTxStatusVariant(tx.status)}
                        size="xsmall"
                      />
                    </div>

                    <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                      {formatDateTime(tx.transaction_date ?? tx.created_at)}
                      {tx.gateway ? ` · ${tx.gateway}` : ''}
                      {tx.transfer_type ? ` · ${tx.transfer_type}` : ''}
                    </p>
                    {tx.reason && <p className="text-xs text-amber-700 dark:text-amber-400">{tx.reason}</p>}
                    {tx.status === 'ignored' && tx.note && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Note: {tx.note}</p>
                    )}
                    {tx.status === 'matched' && tx.order_id !== null && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Settled order #{tx.order_id}, line #{tx.line_id}
                      </p>
                    )}

                    {actionable && (
                      <div className="flex justify-end gap-2">
                        <Button label="Ignore" size="xs" variant="secondary" rounded="lg" disabled={busy} onClick={() => setIgnoreTx(tx)} />
                        <Button label="Assign" size="xs" rounded="lg" disabled={busy} onClick={() => setAssignTx(tx)} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {hasMore && !loading && (
          <div className="flex justify-center">
            <Button
              label={loadingMore ? 'Loading...' : 'Load more'}
              variant="secondary"
              rounded="lg"
              disabled={loadingMore}
              onClick={actions.loadMore}
            />
          </div>
        )}
      </div>

      <AssignTransactionModal
        tx={assignTx}
        busy={busy}
        onClose={() => setAssignTx(null)}
        onAssign={actions.assign}
      />

      <Modal
        isOpen={ignoreTx !== null}
        onClose={closeIgnore}
        title="Ignore transaction"
        size="small"
        content={
          <div className="px-10 pb-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {ignoreTx ? `${formatMoneyString(ignoreTx.amount)} · ${ignoreTx.content ?? ''}` : ''}
            </p>
            <FormInput
              id="ignore-note"
              type="text"
              value={note}
              placeholder="Note (why it is ignored)"
              onChange={(e) => setNote(e.target.value.slice(0, 255))}
              disabled={busy}
              className="w-full"
            />
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button label={busy ? 'Saving...' : 'Ignore'} onClick={submitIgnore} disabled={busy} className="min-w-[150px]" rounded="lg" />
            <Button label="Cancel" variant="secondary" onClick={closeIgnore} disabled={busy} className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />
    </div>
  );
};

export default BankInboxPage;
