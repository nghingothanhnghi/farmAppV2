// src/components/billiard/ShiftsPage.tsx
// Screen 5 of the payments guide: the cash drawer.
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconArrowLeft, IconCashPlus, IconCashMinus, IconLock, IconX } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import LinearProgress from '../common/LinearProgress';
import EmptyState from '../common/EmptyState';
import { FormInput } from '../common/Form';
import { useShifts } from '../../hooks/useShifts';
import { shiftService } from '../../services/shiftService';
import { useAlert } from '../../contexts/alertContext';
import {
  billiardErrorMessage,
  formatDateTime,
  formatMoneyString,
  formatNumber,
  parseWholeAmount,
} from '../../utils/billiard';
import ShiftSummaryView, { ShiftResult, Variance } from './components/ShiftSummaryView';
import type { ShiftSummary } from '../../models/interfaces/CashDrawer';

const MIN_REASON = 3;

/** Whole-number VND input that shows thousands separators. */
const MoneyInput: React.FC<{
  id: string;
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ id, value, onChange, placeholder, disabled }) => {
  const n = parseWholeAmount(value);
  return (
    <FormInput
      id={id}
      type="text"
      inputMode="numeric"
      value={n === null ? '' : formatNumber(n)}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full"
    />
  );
};

const ShiftsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { current, lastClosed, history, hasMore, loading, error, busy, actions } = useShifts();

  // open form
  const [float, setFloat] = useState('');
  const [openNote, setOpenNote] = useState('');
  // pay-in / pay-out
  const [movement, setMovement] = useState<'pay_in' | 'pay_out' | null>(null);
  const [mvAmount, setMvAmount] = useState('');
  const [mvReason, setMvReason] = useState('');
  // close
  const [closeOpen, setCloseOpen] = useState(false);
  const [counted, setCounted] = useState('');
  const [closeNote, setCloseNote] = useState('');
  // history detail
  const [detail, setDetail] = useState<ShiftSummary | null>(null);

  const backButton = (
    <Button
      label="Back to tables"
      variant="secondary"
      icon={<IconArrowLeft size={16} />}
      iconPosition="left"
      rounded="lg"
      onClick={() => navigate('/billiard')}
    />
  );

  if (loading) return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;

  const handleOpen = async () => {
    const payload: { opening_float?: number; note?: string } = {};
    const f = parseWholeAmount(float);
    if (f !== null) payload.opening_float = f;
    if (openNote.trim()) payload.note = openNote.trim();
    const s = await actions.open(payload);
    if (s) {
      setFloat('');
      setOpenNote('');
    }
  };

  const mvAmountNum = parseWholeAmount(mvAmount);
  const mvValid = mvAmountNum !== null && mvAmountNum > 0 && mvReason.trim().length >= MIN_REASON;
  const closeMovement = () => {
    if (busy) return;
    setMovement(null);
    setMvAmount('');
    setMvReason('');
  };
  const handleMovement = async () => {
    if (!movement || !mvValid) return;
    const s = await actions.moveCash({ type: movement, amount: mvAmountNum!, reason: mvReason.trim() });
    if (s) {
      setMovement(null);
      setMvAmount('');
      setMvReason('');
    }
  };

  const countedNum = parseWholeAmount(counted);
  const closeShiftModal = () => {
    if (busy) return;
    setCloseOpen(false);
    setCounted('');
    setCloseNote('');
  };
  const handleClose = async () => {
    if (countedNum === null) return;
    const s = await actions.close({
      counted_cash: countedNum,
      ...(closeNote.trim() ? { note: closeNote.trim() } : {}),
    });
    if (s) {
      setCloseOpen(false);
      setCounted('');
      setCloseNote('');
    }
  };

  const showDetail = async (id: number) => {
    if (detail?.id === id) return setDetail(null);
    try {
      setDetail(await shiftService.get(id));
    } catch (err) {
      setAlert({ type: 'error', message: billiardErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6 mx-auto max-w-2xl">
      <PageTitle title="Cash drawer" subtitle="Open a shift, record cash movements and count the drawer at close." actions={backButton} />

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {/* After close: expected vs counted. A negative variance means cash is missing (red). */}
      {lastClosed && (
        <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 dark:bg-gray-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Shift #{lastClosed.id} closed</h3>
            <button type="button" aria-label="Dismiss" onClick={actions.dismissClosed} className="text-gray-400 hover:text-gray-600">
              <IconX size={16} />
            </button>
          </div>
          <ShiftResult shift={lastClosed} />
        </div>
      )}

      {current === null ? (
        <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 dark:bg-gray-900 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">No open shift</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Count the cash in the drawer and enter it as the opening float.
          </p>
          <MoneyInput id="opening-float" value={float} onChange={setFloat} placeholder="Opening float (0 if empty)" disabled={busy} />
          <FormInput
            id="open-note"
            type="text"
            value={openNote}
            placeholder="Note (optional)"
            onChange={(e) => setOpenNote(e.target.value)}
            disabled={busy}
            className="w-full"
          />
          <div className="flex justify-end">
            <Button label={busy ? 'Opening...' : 'Open shift'} rounded="lg" disabled={busy} onClick={handleOpen} />
          </div>
        </div>
      ) : (
        <>
          <ShiftSummaryView shift={current} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              label="Pay in"
              variant="secondary"
              rounded="lg"
              icon={<IconCashPlus size={16} />}
              iconPosition="left"
              disabled={busy}
              onClick={() => setMovement('pay_in')}
            />
            <Button
              label="Pay out"
              variant="secondary"
              rounded="lg"
              icon={<IconCashMinus size={16} />}
              iconPosition="left"
              disabled={busy}
              onClick={() => setMovement('pay_out')}
            />
            <Button
              label="Close shift"
              variant="danger"
              rounded="lg"
              icon={<IconLock size={16} />}
              iconPosition="left"
              disabled={busy}
              onClick={() => setCloseOpen(true)}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">History</p>
        {history.length === 0 ? (
          <EmptyState message="No shifts yet." />
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-white/5 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-white/5">
            {history.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => showDetail(h.id)}
                  className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      #{h.id} · {formatDateTime(h.opened_at)}
                    </p>
                    <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
                      Float {formatMoneyString(h.opening_float)}
                      {h.opened_by ? ` · ${h.opened_by}` : ''}
                    </p>
                  </div>
                  {h.status === 'open' ? (
                    <Badge label="Open" variant="success" size="xsmall" />
                  ) : (
                    <span className="text-xs shrink-0">
                      <Variance value={h.variance} />
                    </span>
                  )}
                </button>
                {detail?.id === h.id && (
                  <div className="px-4 pb-4">
                    <ShiftSummaryView shift={detail} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {hasMore && (
          <div className="flex justify-center">
            <Button label="Load more" variant="secondary" rounded="lg" onClick={() => actions.fetchHistory(false)} />
          </div>
        )}
      </div>

      <Modal
        isOpen={movement !== null}
        onClose={closeMovement}
        title={movement === 'pay_in' ? 'Pay in' : 'Pay out'}
        size="small"
        content={
          <div className="px-10 pb-4 space-y-3">
            <MoneyInput id="mv-amount" value={mvAmount} onChange={setMvAmount} placeholder="Amount" disabled={busy} />
            <FormInput
              id="mv-reason"
              type="text"
              value={mvReason}
              placeholder="Reason (at least 3 characters)"
              onChange={(e) => setMvReason(e.target.value)}
              disabled={busy}
              className="w-full"
            />
            {mvReason.length > 0 && mvReason.trim().length < MIN_REASON && (
              <p className="text-xs text-red-600">Reason must be at least {MIN_REASON} characters.</p>
            )}
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button label={busy ? 'Saving...' : 'Save'} onClick={handleMovement} disabled={busy || !mvValid} className="min-w-[150px]" rounded="lg" />
            <Button label="Cancel" variant="secondary" onClick={closeMovement} disabled={busy} className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />

      <Modal
        isOpen={closeOpen}
        onClose={closeShiftModal}
        title="Close shift"
        size="small"
        content={
          <div className="px-10 pb-4 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">Count the cash in the drawer and enter the total.</p>
            <MoneyInput id="counted-cash" value={counted} onChange={setCounted} placeholder="Counted cash" disabled={busy} />
            <FormInput
              id="close-note"
              type="text"
              value={closeNote}
              placeholder="Note (optional)"
              onChange={(e) => setCloseNote(e.target.value)}
              disabled={busy}
              className="w-full"
            />
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button
              label={busy ? 'Closing...' : 'Close shift'}
              variant="danger"
              onClick={handleClose}
              disabled={busy || countedNum === null}
              className="min-w-[150px]"
              rounded="lg"
            />
            <Button label="Cancel" variant="secondary" onClick={closeShiftModal} disabled={busy} className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />
    </div>
  );
};

export default ShiftsPage;
