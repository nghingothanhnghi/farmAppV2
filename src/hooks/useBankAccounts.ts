// src/hooks/useBankAccounts.ts
// Club bank account (screen 11). `current` is readable by any user; the history calls are manager only.
import { useCallback, useEffect, useState } from 'react';
import { bankAccountService } from '../services/bankAccountService';
import { billiardErrorMessage } from '../utils/billiard';
import type { BankAccount, BankAccountEvent } from '../models/interfaces/BankAccount';

export function useBankAccounts(isManager: boolean) {
  const [current, setCurrent] = useState<BankAccount | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [events, setEvents] = useState<BankAccountEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Never cached in local storage: always reloaded from the server after a change.
  const reload = useCallback(async () => {
    try {
      const [cur, list, evts] = await Promise.all([
        bankAccountService.getCurrent(),
        isManager ? bankAccountService.list() : Promise.resolve([] as BankAccount[]),
        isManager ? bankAccountService.events() : Promise.resolve([] as BankAccountEvent[]),
      ]);
      setCurrent(cur);
      setAccounts(list);
      setEvents(evts);
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load the bank account'));
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  return { current, accounts, events, loading, error, reload };
}

/** Cashier-side read of the club account, for a "Paying to: ..." line. Never throws. */
export function useCurrentBankAccount(enabled = true) {
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    bankAccountService
      .getCurrent()
      .then((a) => !cancelled && setAccount(a))
      .catch(() => !cancelled && setAccount(null))
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { account, loaded };
}
