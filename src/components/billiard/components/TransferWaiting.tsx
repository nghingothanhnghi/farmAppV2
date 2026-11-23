// src/components/billiard/components/TransferWaiting.tsx
// Screen 2 of the payments guide: a bank-transfer line is waiting for the money.
// Rendered from the bill alone (no local copy), so a page reload rebuilds it with the same QR.
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import { Link } from 'react-router';
import { useNow } from '../../../hooks/useNow';
import { formatCountdown, formatMoneyString, msUntil } from '../../../utils/billiard';
import type { PaymentLine } from '../../../models/interfaces/Billiard';
import {
  getPaymentLineStatusLabel,
  getPaymentLineStatusVariant,
} from '../../../utils/status';

interface Props {
  line: PaymentLine;
  currency: string;
  busy: boolean;
  /** Part of the bill already paid in this split (shown for context). */
  amountPaid?: string;
  /** Why the last Received press was refused (club rule): keeps the note box open / shows a hint. */
  confirmIssue?: 'note_required' | 'manager_only' | null;
  /** Managers get a link to the bank account set-up when the QR is missing. */
  canManage?: boolean;
  onReceived: (lineId: number, note?: string) => void;
  onCancel: (lineId: number, reason?: string) => void;
}

const Detail: React.FC<{ label: string; value: string | null }> = ({ label, value }) =>
  value ? (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white text-right break-all">{value}</span>
    </div>
  ) : null;

const TransferWaiting: React.FC<Props> = ({
  line,
  currency,
  busy,
  amountPaid,
  confirmIssue = null,
  canManage = false,
  onReceived,
  onCancel,
}) => {
  const t = line.transfer;
  const expiresAt = t?.expires_at ?? null;
  const now = useNow(1000, expiresAt !== null);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  if (!t) return null;

  const remainingMs = expiresAt ? msUntil(expiresAt, now) : null;
  const expired = remainingMs !== null && remainingMs <= 0;
  const hasQr = !!(t.qr_payload || t.qr_image_url);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 dark:bg-gray-900 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Waiting for bank transfer</h3>
        {/* <Badge label="Waiting" variant="warning" size="xsmall" /> */}
        <Badge
  label={getPaymentLineStatusLabel(line.status)}
  variant={getPaymentLineStatusVariant(line.status)}
  size="xsmall"
/>
      </div>

      {hasQr && (
        <div className={`flex justify-center ${expired ? 'opacity-40' : ''}`}>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            {t.qr_payload ? (
              <QRCodeSVG value={t.qr_payload} size={220} />
            ) : (
              <img src={t.qr_image_url ?? undefined} alt="Bank transfer QR" width={220} height={220} />
            )}
          </div>
        </div>
      )}

      {/* The QR pays the account saved when this line was created: show its holder so a wrong account is spotted before the customer pays. */}
      {hasQr && t.account_name && (
        <p className="text-center text-sm text-gray-700 dark:text-gray-200">
          Pays to: <span className="font-semibold">{t.account_name}</span>
          {t.account_no ? ` (${t.account_no})` : ''}
        </p>
      )}

      {/* No QR at all: the club has no bank account saved. Amount and memo still let the customer type the transfer. */}
      {!hasQr && (
        <p role="status" className="rounded-md border border-amber-200 bg-amber-50 p-2 text-center text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          No bank account is set up, so there is no QR.{' '}
          {canManage ? (
            <Link to="/billiard/bank-account" className="font-medium underline">Set up the bank account</Link>
          ) : (
            'Ask a manager to set up the bank account.'
          )}
        </p>
      )}

      {/* Amount and memo are always large: the bank feed matches the payment by the memo. */}
      <div className="text-center space-y-1">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatMoneyString(t.amount, currency)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Transfer note (memo)</p>
        <p className="font-mono text-2xl font-semibold tracking-wider text-blue-600 dark:text-blue-400">{t.memo}</p>
      </div>

      {/* Bank code can be null even when the QR works (club saved only the BIN): never required. */}
      {(!hasQr || t.account_no) && (
        <div className="space-y-1.5 border-t border-gray-200 dark:border-white/5 pt-3">
          <Detail label="Bank" value={t.bank_code} />
          <Detail label="Account number" value={t.account_no} />
          <Detail label="Account name" value={t.account_name} />
        </div>
      )}

      {amountPaid && Number(amountPaid) > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Already paid: {formatMoneyString(amountPaid, currency)}
        </p>
      )}

      {remainingMs !== null && (
        <p
          role="status"
          className={`text-center text-sm ${expired ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}
        >
          {expired
            ? 'The QR has expired. If the customer has already paid, press Received.'
            : `QR valid for ${formatCountdown(remainingMs)}`}
        </p>
      )}

      {cancelling ? (
        <div className="space-y-2">
          <FormReason value={reason} onChange={setReason} disabled={busy} />
          <div className="flex justify-end gap-2">
            <Button
              label="Back"
              variant="secondary"
              rounded="lg"
              disabled={busy}
              onClick={() => setCancelling(false)}
            />
            <Button
              label={busy ? 'Cancelling...' : 'Cancel transfer'}
              variant="danger"
              rounded="lg"
              disabled={busy}
              onClick={() => onCancel(line.id, reason.trim() || undefined)}
            />
          </div>
        </div>
      ) : (
        // Both buttons stay available after expiry: the customer may have paid already.
        <div className="space-y-2">
          <input
            type="text"
            maxLength={255}
            value={note}
            disabled={busy}
            onChange={(e) => setNote(e.target.value)}
            placeholder={confirmIssue === 'note_required' ? 'Bank reference you checked (required)' : 'Bank reference you checked (optional)'}
            aria-label="Bank reference note"
            aria-required={confirmIssue === 'note_required'}
            aria-invalid={confirmIssue === 'note_required'}
            className={`w-full text-sm bg-transparent dark:bg-gray-800 dark:text-gray-100 border rounded-md px-3 py-2 focus:outline-none ${
              confirmIssue === 'note_required' ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-gray-700 focus:border-slate-400'
            }`}
          />
          {confirmIssue === 'note_required' && (
            <p role="alert" className="text-xs text-red-600">A note of at least 3 characters is required to confirm this transfer.</p>
          )}
          {confirmIssue === 'manager_only' && (
            <p role="alert" className="text-xs text-amber-700 dark:text-amber-400">
              Ask a manager to confirm this transfer, or wait for the bank.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button label="Cancel" variant="secondary" rounded="lg" disabled={busy} onClick={() => setCancelling(true)} />
            <Button
              label={busy ? 'Confirming...' : 'Received'}
              rounded="lg"
              disabled={busy}
              onClick={() => onReceived(line.id, note.trim() || undefined)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FormReason: React.FC<{ value: string; onChange: (v: string) => void; disabled: boolean }> = ({
  value,
  onChange,
  disabled,
}) => (
  <input
    type="text"
    maxLength={255}
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Reason (optional)"
    aria-label="Cancel reason"
    className="w-full text-sm bg-transparent dark:bg-gray-800 dark:text-gray-100 border border-slate-200 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400"
  />
);

export default TransferWaiting;
