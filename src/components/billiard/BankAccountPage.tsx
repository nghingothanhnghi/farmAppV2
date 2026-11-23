// src/components/billiard/BankAccountPage.tsx
// Screen 11 of the payments guide: the club's receiving bank account (manager / admin).
// The transfer QR on the pay screen is built from this account.
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft, IconBuildingBank, IconUpload } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import InlineNotice from '../common/InlineNotice';
import { FormGroup, FormInput, FormLabel } from '../common/Form';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { useBankAccounts } from '../../hooks/useBankAccounts';
import { useAlert } from '../../contexts/alertContext';
import { bankAccountService } from '../../services/bankAccountService';
import { bankAccountErrorMessage, getStatus, maskAccountNo } from '../../utils/billiard';
import { formatDateTime } from '../../utils/formatters';
import { BANK_QR_ACCEPT, BANK_QR_MAX_BYTES } from '../../models/interfaces/BankAccount';
import type { BankAccount, BankAccountEvent } from '../../models/interfaces/BankAccount';

const EVENT_LABELS: Record<string, string> = {
  account_created: 'Account saved',
  account_replaced: 'Account replaced',
  account_renamed: 'Account renamed',
  account_deactivated: 'Account turned off',
};

const BIN_RE = /^\d{6}$/;
const ACCOUNT_NO_RE = /^[A-Za-z0-9]{4,32}$/;

const BankAccountPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const canManage = useHasAnyRole(['admin', 'super_admin', 'manager']);
  const { current, accounts, events, loading, error, reload } = useBankAccounts(canManage);

  const [bankBin, setBankBin] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Hidden after the first 501: the server has no QR reader, so the manager just types.
  const [qrUnavailable, setQrUnavailable] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [renameCode, setRenameCode] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'accounts' | 'events'>('accounts');

  if (!canManage) {
    return (
      <div className="mt-10 text-center font-semibold text-red-500">
        Unauthorized: You do not have access to view this page.
      </div>
    );
  }

  const trimmed = {
    bank_bin: bankBin.trim(),
    account_no: accountNo.trim(),
    account_name: accountName.trim(),
    bank_code: bankCode.trim().toUpperCase(),
  };

  // Same rules as the server, so the manager sees the problem before sending.
  const validate = (): string | null => {
    if (!BIN_RE.test(trimmed.bank_bin)) return 'Bank BIN must be exactly 6 digits.';
    if (!ACCOUNT_NO_RE.test(trimmed.account_no)) return 'Account number must be 4 to 32 letters or digits.';
    if (trimmed.account_name.length < 2 || trimmed.account_name.length > 100)
      return 'Account holder name must be 2 to 100 characters.';
    if (trimmed.bank_code.length > 20) return 'Bank code can be at most 20 characters.';
    return null;
  };

  const handleReview = () => {
    const problem = validate();
    setFormError(problem);
    if (!problem) setConfirmOpen(true);
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      await bankAccountService.save({
        bank_bin: trimmed.bank_bin,
        account_no: trimmed.account_no,
        account_name: trimmed.account_name,
        ...(trimmed.bank_code ? { bank_code: trimmed.bank_code } : {}),
      });
      setConfirmOpen(false);
      setBankBin('');
      setAccountNo('');
      setAccountName('');
      setBankCode('');
      setFormError(null);
      setAlert({ type: 'success', message: 'Bank account saved. New transfers will pay this account.' });
      await reload(); // show the saved account from the server, never from local state
    } catch (err) {
      // Keep the typed fields; show the server message next to the form.
      setConfirmOpen(false);
      setFormError(bankAccountErrorMessage(err, 'Failed to save the bank account'));
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setFormError('Choose a PNG or JPG image.');
      return;
    }
    if (file.size > BANK_QR_MAX_BYTES) {
      setFormError('The image is larger than 5 MB.'); // checked here so no request is sent
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      const parsed = await bankAccountService.parseQr(file);
      // Prefill only. The QR has no holder name, so that field stays for the manager to type.
      // `amount` and `memo` (payment QRs only) are ignored and never saved.
      setBankBin(parsed.bank_bin);
      setAccountNo(parsed.account_no);
      setAccountName('');
    } catch (err) {
      if (getStatus(err) === 501) setQrUnavailable(true);
      setFormError(bankAccountErrorMessage(err, 'Could not read the QR image'));
    } finally {
      setUploading(false);
    }
  };

  const openRename = (acc: BankAccount) => {
    setRenameName(acc.account_name);
    setRenameCode(acc.bank_code ?? '');
    setRenameError(null);
    setRenameOpen(true);
  };

  const handleRename = async () => {
    if (!current) return;
    const name = renameName.trim();
    if (name.length < 2 || name.length > 100) {
      setRenameError('Account holder name must be 2 to 100 characters.');
      return;
    }
    if (renameCode.trim().length > 20) {
      setRenameError('Bank code can be at most 20 characters.');
      return;
    }
    setBusy(true);
    try {
      await bankAccountService.rename(current.id, {
        account_name: name,
        bank_code: renameCode.trim() ? renameCode.trim().toUpperCase() : null,
      });
      setRenameOpen(false);
      setAlert({ type: 'success', message: 'Account updated.' });
      await reload();
    } catch (err) {
      setRenameError(bankAccountErrorMessage(err, 'Failed to update the account'));
    } finally {
      setBusy(false);
    }
  };

  const handleDeactivate = async () => {
    if (!current) return;
    setBusy(true);
    try {
      await bankAccountService.deactivate(current.id);
      setDeactivateOpen(false);
      setAlert({ type: 'success', message: 'Bank account turned off. Transfers show no QR until a new one is saved.' });
      await reload();
    } catch (err) {
      setDeactivateOpen(false);
      setAlert({ type: 'error', message: bankAccountErrorMessage(err, 'Failed to turn off the account') });
    } finally {
      setBusy(false);
    }
  };

  const row = (label: string, value: string | null) =>
    value ? (
      <div className="flex justify-between gap-4 text-sm">
        <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="text-right font-medium text-gray-900 dark:text-white break-all">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <PageTitle
        title={t('bank_account.page_header.title')}
        subtitle={t('bank_account.page_header.description')}
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

      <div className="mx-auto w-full max-w-2xl space-y-6">
        {loading ? (
          <Spinner className="mx-auto mt-10" />
        ) : error ? (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <Button label="Retry" variant="secondary" rounded="lg" onClick={reload} />
          </div>
        ) : (
          <>
            {/* Current account */}
            <section className="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow dark:border-white/5 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                  <IconBuildingBank size={18} /> Current account
                </h2>
                <Badge
                  label={current ? 'Active' : 'Not set'}
                  variant={current ? 'success' : 'warning'}
                  size="xsmall"
                />
              </div>
              {current ? (
                <>
                  <dl className="space-y-1.5">
                    {row('Account holder', current.account_name)}
                    {row('Account number', current.account_no)}
                    {row('Bank BIN', current.bank_bin)}
                    {row('Bank code', current.bank_code)}
                    {row('Saved', formatDateTime(current.created_at))}
                  </dl>
                  <div className="flex justify-end gap-2">
                    <Button label="Correct name" variant="secondary" rounded="lg" size="sm" onClick={() => openRename(current)} />
                    <Button label="Turn off" variant="danger" rounded="lg" size="sm" onClick={() => setDeactivateOpen(true)} />
                  </div>
                </>
              ) : (
                <InlineNotice variant="warning">
                  No bank account is saved. Bank transfers show no QR until you save one below.
                </InlineNotice>
              )}
            </section>

            {/* Save a (new) account */}
            <section className="space-y-4 rounded-lg border border-gray-100 bg-white p-4 shadow dark:border-white/5 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {current ? 'Replace the account' : 'Save the account'}
                </h2>
                {!qrUnavailable && (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      accept={BANK_QR_ACCEPT}
                      className="hidden"
                      aria-label="Upload a bank QR image"
                      onChange={handleFile}
                    />
                    <Button
                      label={uploading ? 'Reading…' : 'Upload QR image'}
                      variant="secondary"
                      size="sm"
                      rounded="lg"
                      icon={<IconUpload size={16} />}
                      iconPosition="left"
                      disabled={uploading || busy}
                      onClick={() => fileRef.current?.click()}
                    />
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {qrUnavailable
                  ? 'Type the account details below.'
                  : 'Upload a picture of your bank QR to fill in the bank and account number, or type them.'}
                {' '}The QR does not carry the account holder name, so type it yourself.
              </p>

              <FormGroup className="space-y-1">
                <FormLabel htmlFor="bank_bin">Bank BIN (6 digits)</FormLabel>
                <FormInput id="bank_bin" type="text" inputMode="numeric" maxLength={6} value={bankBin}
                  onChange={(e) => setBankBin(e.target.value.replace(/\D/g, ''))} disabled={busy} placeholder="970436" />
              </FormGroup>
              <FormGroup className="space-y-1">
                <FormLabel htmlFor="account_no">Account number</FormLabel>
                <FormInput id="account_no" type="text" maxLength={32} value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value.replace(/[^A-Za-z0-9]/g, ''))} disabled={busy} placeholder="0123456789" />
              </FormGroup>
              <FormGroup className="space-y-1">
                <FormLabel htmlFor="account_name">Account holder name</FormLabel>
                <FormInput id="account_name" type="text" maxLength={100} value={accountName}
                  onChange={(e) => setAccountName(e.target.value)} disabled={busy} placeholder="CLUB A" />
              </FormGroup>
              <FormGroup className="space-y-1">
                <FormLabel htmlFor="bank_code">Bank code (optional)</FormLabel>
                <FormInput id="bank_code" type="text" maxLength={20} value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)} disabled={busy} placeholder="VCB" />
              </FormGroup>

              {formError && <p role="alert" className="text-xs text-red-500">{formError}</p>}

              <div className="flex justify-end">
                <Button label="Review and save" rounded="lg" onClick={handleReview} disabled={busy || uploading} />
              </div>
            </section>

            {/* History */}
            <section className="space-y-3">
              <div role="tablist" className="flex gap-2">
                <Button label="Accounts" size="sm" rounded="full" variant={historyTab === 'accounts' ? 'primary' : 'secondary'} onClick={() => setHistoryTab('accounts')} />
                <Button label="Events" size="sm" rounded="full" variant={historyTab === 'events' ? 'primary' : 'secondary'} onClick={() => setHistoryTab('events')} />
              </div>
              <ul className="divide-y divide-gray-200 rounded-lg border border-gray-100 bg-white dark:divide-white/5 dark:border-white/5 dark:bg-gray-900">
                {historyTab === 'accounts'
                  ? accounts.map((a: BankAccount) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900 dark:text-white">{a.account_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {a.bank_code ? `${a.bank_code} · ` : ''}{a.bank_bin} · {maskAccountNo(a.account_no)} · {formatDateTime(a.created_at)}
                          </p>
                        </div>
                        <Badge label={a.is_active ? 'Active' : 'Inactive'} variant={a.is_active ? 'success' : 'gray'} size="xsmall" />
                      </li>
                    ))
                  : events.map((ev: BankAccountEvent) => (
                      <li key={ev.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                        <span className="text-gray-900 dark:text-white">{EVENT_LABELS[ev.event_type] ?? ev.event_type.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(ev.created_at)}</span>
                      </li>
                    ))}
                {(historyTab === 'accounts' ? accounts.length : events.length) === 0 && (
                  <li className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">Nothing here yet.</li>
                )}
              </ul>
            </section>
          </>
        )}
      </div>

      {/* Summary before saving */}
      <Modal
        isOpen={confirmOpen}
        onClose={busy ? () => {} : () => setConfirmOpen(false)}
        title="Save this account?"
        size="small"
        content={
          <div className="space-y-2 px-7 pb-4 text-sm text-gray-700 dark:text-gray-200">
            <p>
              Account <strong>{trimmed.account_no}</strong>, bank <strong>{trimmed.bank_bin}</strong>
              {trimmed.bank_code ? ` (${trimmed.bank_code})` : ''}, holder <strong>{trimmed.account_name}</strong>.
            </p>
            <p>New transfers will pay this account. A QR already on screen keeps the account it was created with.</p>
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button label={busy ? 'Saving…' : 'Save'} onClick={handleSave} disabled={busy} className="min-w-[150px]" rounded="lg" />
            <Button label="Back" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={busy} className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />

      {/* Correct the holder name / bank code (bank and number cannot be edited) */}
      <Modal
        isOpen={renameOpen}
        onClose={busy ? () => {} : () => setRenameOpen(false)}
        title="Correct the account"
        size="small"
        content={
          <div className="space-y-4 px-7 pb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The bank and account number cannot be edited. To change them, save a new account.
            </p>
            <FormGroup className="space-y-1">
              <FormLabel htmlFor="rename_name">Account holder name</FormLabel>
              <FormInput id="rename_name" type="text" maxLength={100} value={renameName} onChange={(e) => setRenameName(e.target.value)} disabled={busy} />
            </FormGroup>
            <FormGroup className="space-y-1">
              <FormLabel htmlFor="rename_code">Bank code (optional)</FormLabel>
              <FormInput id="rename_code" type="text" maxLength={20} value={renameCode} onChange={(e) => setRenameCode(e.target.value)} disabled={busy} />
            </FormGroup>
            {renameError && <p role="alert" className="text-xs text-red-500">{renameError}</p>}
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button label={busy ? 'Saving…' : 'Save'} onClick={handleRename} disabled={busy} className="min-w-[150px]" rounded="lg" />
            <Button label="Cancel" variant="secondary" onClick={() => setRenameOpen(false)} disabled={busy} className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />

      {/* Confirm before turning off */}
      <Modal
        isOpen={deactivateOpen}
        onClose={busy ? () => {} : () => setDeactivateOpen(false)}
        title="Turn off the bank account?"
        size="small"
        content={
          <p className="px-7 pb-4 text-sm text-gray-700 dark:text-gray-200">
            Bank transfers will show no QR until a new account is saved. Transfers already waiting keep their QR.
          </p>
        }
        actions={
          <div className="flex gap-4">
            <Button label={busy ? 'Turning off…' : 'Turn off'} variant="danger" onClick={handleDeactivate} disabled={busy} className="min-w-[150px]" rounded="lg" />
            <Button label="Cancel" variant="secondary" onClick={() => setDeactivateOpen(false)} disabled={busy} className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />
    </div>
  );
};

export default BankAccountPage;
