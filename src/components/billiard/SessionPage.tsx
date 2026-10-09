// src/components/billiard/SessionPage.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { IconAlertCircle, IconArrowLeft, IconPlus, IconPrinter } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Modal from '../common/Modal';
import LinearProgress from '../common/LinearProgress';
import { useAlert } from '../../contexts/alertContext';
import { useSession } from '../../hooks/useSession';
import { useActiveTables } from '../../hooks/useActiveTables';
import { useNow } from '../../hooks/useNow';
import StartStopButtons from './components/StartStopButtons';
import AddItemModal from './components/AddItemModal';
import BillView from './components/BillView';
import PayModal from './components/PayModal';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import { formatElapsed, getBillState, parseUtc } from '../../utils/billiard';

const SessionPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams();
  const id = Number(sessionId);
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const { bill, loading, error, busy, actions } = useSession(id);
  const { bySessionId, refetch: refetchLive } = useActiveTables(30000);

  const state = bill ? getBillState(bill) : null;
  const now = useNow(1000, state === 'active');

  const [addOpen, setAddOpen] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  const backButton = (
    <Button
      label={t("btn.back_to_tables")}
      variant="secondary"
      icon={<IconArrowLeft size={16} />}
      iconPosition="left"
      rounded="lg"
      onClick={() => navigate('/billiard')}
    />
  );

  if (loading && !bill) {
    return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;
  }

  if (!bill) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-3">
        <p className="text-sm text-red-700">{error ?? 'Session not found.'}</p>
        <div className="flex justify-center gap-2">
          <Button label="Retry" variant="secondary" rounded="lg" onClick={actions.fetchBill} />
          {backButton}
        </div>
      </div>
    );
  }

  const live = bySessionId.get(id);
  const elapsed = Math.max(0, Math.floor((now - parseUtc(bill.start_time)) / 1000));

  const handleAddItem = async (payload: Parameters<typeof actions.addItem>[0]) => {
    const ok = await actions.addItem(payload);
    if (ok) refetchLive();
    return ok;
  };

  const handleStop = async () => {
    const ok = await actions.stop();
    setConfirmStopOpen(false);
    if (ok) refetchLive();
  };

  return (
    <div className="space-y-6 mx-auto max-w-2xl">
      <PageTitle
        title={`${bill.table_name ?? `${t('billiard_tables.cards.session_billiard.table')} #${bill.table_id}`} · ${t('billiard_tables.cards.session_billiard.label')} #${bill.session_id}`}
        actions={backButton}
      />

      {state === 'active' && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-mono text-3xl font-semibold text-gray-900 dark:text-white">
            {formatElapsed(elapsed)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={t("btn.add_items_billard")}
              variant="secondary"
              icon={<IconPlus size={16} className="text-gray-500" />}
              iconPosition="left"
              rounded="lg"
              disabled={busy}
              onClick={() => setAddOpen(true)}
            />
            <StartStopButtons
              status="playing"
              size="md"
              busy={busy}
              onStop={() => setConfirmStopOpen(true)}
            />
          </div>
        </div>
      )}

      <BillView
        bill={bill}
        overrides={
          state === 'active' && live
            ? {
              total_table_fee: live.current_table_fee,
              total_product_fee: live.current_product_fee,
              grand_total: live.current_total,
            }
            : undefined
        }
      />
      {/*  "stopped" = awaiting payment → print the bill for the customer to acknowledge */}
      {state === 'stopped' && (
        <div className="flex justify-end gap-2">
          <Button label="Print bill" variant="secondary" rounded="lg"
            icon={<IconPrinter size={16} />} iconPosition="left"
            onClick={() => setPrintOpen(true)} />
          <Button label="Pay" rounded="lg" disabled={busy} onClick={() => setPayOpen(true)} />
        </div>
      )}
      {state === 'pending' && (
        <div className="flex justify-end gap-2">
          <Button label="Print bill" variant="secondary" rounded="lg"
            icon={<IconPrinter size={16} />} iconPosition="left"
            onClick={() => setPrintOpen(true)} />
          <Button label={busy ? 'Confirming...' : 'Confirm payment'} rounded="lg"
            disabled={busy}
            onClick={async () => {
              const res = await actions.confirmPay();
              if (res) setAlert({ type: 'success', message: 'Payment recorded.' });
            }} />
        </div>
      )}
      {/* "paid" → print the receipt */}
      {state === 'paid' && (
        <div className="flex justify-end gap-2">
          <Button label="Print receipt" variant="secondary" rounded="lg"
            icon={<IconPrinter size={16} />} iconPosition="left"
            onClick={() => setPrintOpen(true)} />
          <Button label="Back to tables" variant="secondary" rounded="lg" onClick={() => navigate('/billiard')} />
        </div>
      )}

      <AddItemModal isOpen={addOpen} onClose={() => setAddOpen(false)} busy={busy} onSubmit={handleAddItem} />

      <Modal
        showCloseButton={false}
        size="xsmall"
        isOpen={confirmStopOpen}
        onClose={() => !busy && setConfirmStopOpen(false)}
        content={
          <div className="text-sm px-10 pt-6 pb-10 text-center">
            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            {t("billiard_tables.modals.confirm.stop_session.message")}
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button
              label={busy ? 'Stopping...' : 'Yes, Stop'}
              variant="danger"
              onClick={handleStop}
              disabled={busy}
              className="min-w-[150px]"
              rounded="lg"
            />
            <Button
              label={t("btn.cancel")}
              variant="secondary"
              onClick={() => setConfirmStopOpen(false)}
              disabled={busy}
              className="min-w-[150px]"
              rounded="lg"
            />
          </div>
        }
      />

      <PayModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        bill={bill}
        busy={busy}
        onPay={actions.pay}
        onConfirm={actions.confirmPay}
        onSettled={() => setAlert({ type: 'success', message: 'Payment recorded.' })}
      // StripeCheckout={YourExistingStripeComponent}  // see notes
      />

      <ReceiptPreviewModal
        isOpen={printOpen}
        onClose={() => setPrintOpen(false)}
        bill={bill}
      />

    </div>
  );
};

export default SessionPage;
