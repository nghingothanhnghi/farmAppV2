// src/components/billiard/SessionPage.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { IconAlertCircle, IconArrowLeft, IconClockPlus, IconDiscount2, IconPlus, IconPrinter, IconX } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Modal from '../common/Modal';
import LinearProgress from '../common/LinearProgress';
import { useAlert } from '../../contexts/alertContext';
import { useSession } from '../../hooks/useSession';
import { useGames } from '../../hooks/useGames';
import { useActiveTables } from '../../hooks/useActiveTables';
import { useNow } from '../../hooks/useNow';
import StartStopButtons from './components/StartStopButtons';
import AddItemModal from './components/AddItemModal';
import GamesPanel from './components/GamesPanel';
import BillView from './components/BillView';
import PayModal from './components/PayModal';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import TransferWaiting from './components/TransferWaiting';
import PaymentLines from './components/PaymentLines';
import PaymentHistory from './components/PaymentHistory';
import { STRIPE_ENABLED } from '../../config/constants';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { useCurrentShift } from '../../hooks/useShifts';
import { parseUtc } from '../../utils/formatters';
import { formatElapsed, getBillState, getWaitingTransferLine, isAwaitingCard } from '../../utils/billiard';

const SessionPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams();
  const id = Number(sessionId);
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const { bill, loading, error, busy, confirmIssue, actions } = useSession(id);
  const { bySessionId, refetch: refetchLive } = useActiveTables(30000);

  const state = bill ? getBillState(bill) : null;
  const waitingLine = bill ? getWaitingTransferLine(bill) : null;
  const canVoid = useHasAnyRole(['admin', 'super_admin', 'manager']);
  const canAdjustDiscount = !!bill && canVoid && (state === 'active' || state === 'stopped') && !(bill.payments?.length);
  const gamesApi = useGames(id, { enabled: state === 'active' });
  const now = useNow(1000, state === 'active');

  const [addOpen, setAddOpen] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const { current: openShift, checked: shiftChecked } = useCurrentShift(payOpen);

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
  const remainingSeconds = bill.ends_at
    ? Math.floor((parseUtc(bill.ends_at) - now) / 1000)
    : null;

  const handleAddItem = async (payload: Parameters<typeof actions.addItem>[0]) => {
    const ok = await actions.addItem(payload);
    if (ok) refetchLive();
    return ok;
  };

  const handleStop = async () => {
    const ok = await actions.stop();
    setConfirmStopOpen(false);
    if (ok) {
      refetchLive();
      gamesApi.actions.fetchGames(); // stop auto-completes the active game
    }
  };

  return (
    <div className="space-y-6 mx-auto max-w-2xl">
      <PageTitle
        title={`${bill.table_name ?? `${t('billiard_tables.cards.session_billiard.table')} #${bill.table_id}`} · ${t('billiard_tables.cards.session_billiard.label')} #${bill.session_id}`}
        actions={backButton}
      />

      {state === 'active' && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="
            number-digital 
            text-3xl 
            font-semibold 
            text-cyan-950 dark:text-cyan-100
            [text-shadow:0_0_5px_#22d3ee,0_0_10px_#22d3ee,0_0_20px_#22d3ee,0_0_40px_#22d3ee]
            dark:[text-shadow:0_0_5px_#22d3ee,0_0_10px_#22d3ee,0_0_20px_#22d3ee,0_0_40px_#22d3ee]
          ">
            {formatElapsed(elapsed)}
          </div>
          {remainingSeconds !== null && (
            <div className={`text-xs font-medium ${remainingSeconds < 0 ? 'text-red-600 dark:text-red-300' : 'text-gray-500 dark:text-gray-300'}`}>
              {remainingSeconds < 0 ? 'Overtime ' : 'Remaining '}
              {formatElapsed(Math.abs(remainingSeconds))}
            </div>
          )}
          <div className="flex items-center gap-2">
            {canVoid && (
              <>
                <Button label="+30 min" variant="secondary" rounded="lg" disabled={busy}
                  icon={<IconClockPlus size={16} />} iconPosition="left"
                  onClick={() => actions.extend(30)} />
                <Button label="Discount" variant="secondary" rounded="lg" disabled={busy || !canAdjustDiscount}
                  icon={<IconDiscount2 size={16} />} iconPosition="left"
                  onClick={() => setDiscountOpen(true)} />
                <Button label="Cancel session" variant="danger" rounded="lg" disabled={busy}
                  icon={<IconX size={16} />} iconPosition="left"
                  onClick={() => setCancelOpen(true)} />
              </>
            )}
            <Button
              label={t("btn.add_items_billard")}
              variant="secondary"
              icon={<IconPlus size={16}/>}
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

      {state === 'active' && (
        <GamesPanel
          games={gamesApi.games}
          activeGame={gamesApi.activeGame}
          busy={gamesApi.busy}
          onStart={gamesApi.actions.start}
          onScore={gamesApi.actions.score}
          onReset={gamesApi.actions.reset}
          onFinish={gamesApi.actions.finish}
          onNewGame={gamesApi.actions.newGame}
        />
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
      {/* receipt (paid) or the history of lines (part paid, voided, cancelled) */}
      <PaymentLines bill={bill} canVoid={canVoid} busy={busy} onVoid={actions.voidLine} />
      <PaymentHistory bill={bill} />
      {/*  "stopped" = awaiting payment → print the bill for the customer to acknowledge */}
      {state === 'stopped' && (
        <div className="flex justify-end gap-2">
          <Button label={t("btn.print_preview_bill")} variant="secondary" rounded="lg"
            icon={<IconPrinter size={16} />} iconPosition="left"
            onClick={() => setPrintOpen(true)} />
          {canAdjustDiscount && (
            <Button label="Discount" variant="secondary" rounded="lg" disabled={busy}
              icon={<IconDiscount2 size={16} />} iconPosition="left"
              onClick={() => setDiscountOpen(true)} />
          )}
          <Button label={t("btn.pay")} rounded="lg" disabled={busy} onClick={() => setPayOpen(true)} />
        </div>
      )}
      {/* pending + waiting transfer line -> screen 2 (polled by useSession) */}
      {state === 'pending' && waitingLine && (
        <>
          <TransferWaiting
            line={waitingLine}
            currency={bill.currency}
            busy={busy}
            amountPaid={bill.amount_paid}
            confirmIssue={confirmIssue}
            canManage={canVoid}
            onReceived={async (lineId, note) => {
              const res = await actions.confirmLine(lineId, note);
              if (res && getBillState(res) === 'paid') setAlert({ type: 'success', message: 'Payment recorded.' });
            }}
            onCancel={(lineId, reason) => actions.cancelLine(lineId, reason)}
          />
          <div className="flex justify-end">
            <Button label={t("btn.print_preview_bill")} variant="secondary" rounded="lg"
              icon={<IconPrinter size={16} />} iconPosition="left"
              onClick={() => setPrintOpen(true)} />
          </div>
        </>
      )}
      {/* pending, nothing waiting: card payment awaiting confirmation, or part paid -> pay the rest */}
      {state === 'pending' && !waitingLine && (
        <div className="flex justify-end gap-2">
          <Button label={t("btn.print_preview_bill")} variant="secondary" rounded="lg"
            icon={<IconPrinter size={16} />} iconPosition="left"
            onClick={() => setPrintOpen(true)} />
          {isAwaitingCard(bill) ? (
            <Button label={busy ? 'Confirming...' : 'Confirm payment'} rounded="lg"
              disabled={busy}
              onClick={async () => {
                const res = await actions.confirmPay();
                if (res) setAlert({ type: 'success', message: 'Payment recorded.' });
              }} />
          ) : (
            <Button label={t("btn.pay")} rounded="lg" disabled={busy} onClick={() => setPayOpen(true)} />
          )}
        </div>
      )}
      {/* "paid" → print the receipt */}
      {state === 'paid' && (
        <div className="flex justify-end gap-2">
          <Button label={t("btn.print_receipt")} variant="secondary" rounded="lg"
            icon={<IconPrinter size={16} />} iconPosition="left"
            onClick={() => setPrintOpen(true)} />
          <Button label={t("btn.back_to_tables")} variant="secondary" rounded="lg" onClick={() => navigate('/billiard')} />
        </div>
      )}
      {state === 'cancelled' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">This session was cancelled. No payment can be taken.</p>
          {bill.cancel_reason && <p className="mt-1">Reason: {bill.cancel_reason}</p>}
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
              label={busy ? t('btn.stopping') : t('btn.yes_stop_session')}
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

      <Modal
        showCloseButton={false}
        size="xsmall"
        isOpen={cancelOpen}
        onClose={() => !busy && setCancelOpen(false)}
        title="Cancel active session?"
        content={<div className="space-y-3 px-6 py-5 text-sm">
          <p>This frees the table and sets the bill to zero. A reason is required.</p>
          <textarea className="w-full rounded border p-2 dark:bg-gray-800" rows={3} value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)} placeholder="Reason (at least 3 characters)" />
        </div>}
        actions={<div className="flex gap-3">
          <Button label={busy ? 'Cancelling...' : 'Cancel session'} variant="danger" rounded="lg" disabled={busy || cancelReason.trim().length < 3}
            onClick={async () => { const result = await actions.cancel(cancelReason.trim()); if (result) setCancelOpen(false); }} />
          <Button label="Keep session" variant="secondary" rounded="lg" disabled={busy} onClick={() => setCancelOpen(false)} />
        </div>}
      />

      <Modal
        showCloseButton={false}
        size="xsmall"
        isOpen={discountOpen}
        onClose={() => !busy && setDiscountOpen(false)}
        title="Apply discount"
        content={<div className="space-y-3 px-6 py-5 text-sm">
          <p>Enter an amount or percent, not both. A reason is required for a non-zero discount. Enter amount 0 to remove it.</p>
          <input className="w-full rounded border p-2 dark:bg-gray-800" inputMode="numeric" value={discountAmount}
            onChange={(event) => { setDiscountAmount(event.target.value); if (event.target.value) setDiscountPercent(''); }} placeholder="Amount (VND)" />
          <input className="w-full rounded border p-2 dark:bg-gray-800" inputMode="decimal" value={discountPercent}
            onChange={(event) => { setDiscountPercent(event.target.value); if (event.target.value) setDiscountAmount(''); }} placeholder="Percent" />
          <input className="w-full rounded border p-2 dark:bg-gray-800" value={discountReason}
            onChange={(event) => setDiscountReason(event.target.value)} placeholder="Reason" />
        </div>}
        actions={<div className="flex gap-3">
          <Button label={busy ? 'Saving...' : 'Save discount'} rounded="lg" disabled={busy || (!discountAmount && !discountPercent)}
            onClick={async () => {
              const amount = discountAmount === '' ? undefined : Number(discountAmount);
              const percent = discountPercent === '' ? undefined : Number(discountPercent);
              if (
                (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) ||
                (percent !== undefined && (!Number.isFinite(percent) || percent <= 0 || percent > 100))
              ) return;
              const isRemoving = amount === 0;
              if (!isRemoving && !discountReason.trim()) return;
              const result = await actions.setDiscount({ amount, percent, reason: discountReason.trim() || undefined });
              if (result) setDiscountOpen(false);
            }} />
          <Button label="Cancel" variant="secondary" rounded="lg" disabled={busy} onClick={() => setDiscountOpen(false)} />
        </div>}
      />

      <PayModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        bill={bill}
        busy={busy}
        onPay={actions.pay}
        onConfirm={actions.confirmPay}
        noShiftOpen={shiftChecked && !openShift}
        onOpenShift={() => navigate('/billiard/shifts')}
        stripeEnabled={STRIPE_ENABLED}
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
