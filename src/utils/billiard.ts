// src/components/billiard/utils.ts
import { CurrencyConfig } from "../constants/currency";
import { parseApiErrors } from '../utils/errorUtils';
import type { BillResponse, BillState, PaymentLine } from '../models/interfaces/Billiard';

export const DEFAULT_CURRENCY = 'VND';

/** UTC ISO string (with or without trailing "Z") -> epoch ms. */
export const parseUtc = (iso: string): number => {
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
  return new Date(hasZone ? iso : `${iso}Z`).getTime();
};

/** UTC ISO -> local, human readable. */
export const formatDateTime = (iso?: string | null): string =>
  iso ? new Date(parseUtc(iso)).toLocaleString() : '—';

const pad = (n: number) => String(n).padStart(2, '0');

export const formatElapsed = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

export const formatDuration = (minutes: number): string => {
  const m = Math.max(0, Math.round(minutes));
  return `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
};

/** Decimal string -> currency text via Intl.NumberFormat (exact decimals, no parseFloat). */
export const formatMoneyString = (
  value: string | number | null | undefined,
  currency: string = DEFAULT_CURRENCY
): string => {
  if (value === null || value === undefined || value === '') return '—';
  try {
    return new Intl.NumberFormat(CurrencyConfig.locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(String(value) as unknown as number);
  } catch {
    return `${value} ${currency}`;
  }
};

/** Exact decimal addition on strings using BigInt (4 decimal places). */
export const addDecimalStrings = (values: Array<string | number>): string => {
  const SCALE = 4;
  const base = 10n ** BigInt(SCALE);
  const toUnits = (raw: string | number): bigint => {
    const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(String(raw).trim());
    if (!m) return 0n;
    const frac = (m[3] ?? '').padEnd(SCALE, '0').slice(0, SCALE);
    const n = BigInt(m[2] + frac);
    return m[1] ? -n : n;
  };
  const total = values.reduce<bigint>((acc, v) => acc + toUnits(v), 0n);
  const neg = total < 0n;
  const abs = neg ? -total : total;
  const frac = (abs % base).toString().padStart(SCALE, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${abs / base}${frac ? `.${frac}` : ''}`;
};

export const getBillState = (bill: BillResponse): BillState => {
  if (bill.payment_state === 'paid') return 'paid';
  if (bill.payment_state === 'pending') return 'pending';
  if (bill.end_time) return 'stopped';
  return 'active';
};

/** Local calendar date -> YYYY-MM-DD for query params. */
export const toDateParam = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const getStatus = (err: unknown): number | undefined =>
  (err as { response?: { status?: number } })?.response?.status;

/** Server `detail` when present (404/409/400 included); status-based text otherwise. */
export const billiardErrorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (getStatus(err) === 403) return 'Only a manager can do this.';
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof detail === 'string' || Array.isArray(detail)) return parseApiErrors(err).message;
  switch (getStatus(err)) {
    case 404:
      return 'Not found.';
    case 409:
      return 'This action is not allowed in the current state.';
    case 400:
      return 'Invalid product or variant.';
    default: {
      const msg = parseApiErrors(err).message;
      return msg === 'An unexpected error occurred' ? fallback : msg;
    }
  }
};

// --- Payments ---------------------------------------------------------------

/** VND has no decimals; amounts arrive as strings like "310000.00". */
export const toAmount = (value: string | number | null | undefined): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** A bank-transfer line that is waiting for the money (shows the QR). */
export const getWaitingTransferLine = (bill: BillResponse): PaymentLine | null =>
  bill.payments?.find((p) => p.method === 'bank_transfer' && p.status === 'pending') ?? null;

/** What is still owed: balance_due, or grand_total for backends that do not send it yet. */
export const getBalanceDue = (bill: BillResponse): number =>
  toAmount(bill.balance_due ?? bill.grand_total);

/** `pending`, nothing waiting, part already paid -> pay the rest. */
export const isPartPaid = (bill: BillResponse): boolean =>
  bill.payment_state === 'pending' && !getWaitingTransferLine(bill) && toAmount(bill.amount_paid) > 0;

/** `pending` card payment with no lines -> card form, then the confirm call. */
export const isAwaitingCard = (bill: BillResponse): boolean =>
  bill.payment_state === 'pending' && bill.payment_method === 'stripe' && !(bill.payments?.length);

/** Milliseconds until `iso` (negative once passed). Offset-less timestamps are UTC. */
export const msUntil = (iso: string, now: number = Date.now()): number => parseUtc(iso) - now;

export const formatCountdown = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};

/** Digits only -> whole number; empty -> null. VND has no decimals. */
export const parseWholeAmount = (raw: string): number | null => {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
};

export const formatNumber = (n: number): string => new Intl.NumberFormat('vi-VN').format(n);
