// src/utils/status.ts
import i18n from '../i18n';
import type { TableStatus, BillPaymentMethod, LineStatus, BillState } from '../models/interfaces/Billiard';
import type { BankTxStatus } from '../models/interfaces/BankFeed';
import type { Shift } from '../models/interfaces/CashDrawer';

export const TABLE_STATUS_VARIANTS = {
  available: 'success',
  playing: 'warning',
  reserved: 'secondary',
  maintenance: 'danger',
} as const satisfies Record<TableStatus, string>;

export const getTableStatusVariant = (status: TableStatus) =>
  TABLE_STATUS_VARIANTS[status];

export const getTableStatusLabel = (status: TableStatus): string =>
  i18n.t(`badge_status.${status}`);


// ---- Bill status -------------------------------------------------

export const BILL_STATUS_VARIANTS = {
  active: 'success',
  stopped: 'secondary',
  pending: 'warning',
  paid: 'success',
} as const satisfies Record<BillState, string>;

export const getBillStatusVariant = (status: BillState) =>
  BILL_STATUS_VARIANTS[status];

export const getBillStatusLabel = (status: BillState): string =>
  i18n.t(`badge_status.${status}`);

// ---- Payment line status -----------------------------------------

export const PAYMENT_LINE_STATUS_VARIANTS = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'secondary',
  voided: 'danger',
  failed: 'danger',
} as const satisfies Record<LineStatus, string>;

export const getPaymentLineStatusVariant = (status: LineStatus) =>
  PAYMENT_LINE_STATUS_VARIANTS[status];

export const getPaymentLineStatusLabel = (status: LineStatus): string =>
  i18n.t(`badge_status.${status}`);

// ---- Payment method ----------------------------------------------
export const getPaymentMethodLabel = (
  method: BillPaymentMethod
): string => i18n.t(`badge_status.${method}`);

// ---- Bank transaction status ------------------------------------

export const BANK_TX_STATUS_VARIANTS = {
  needs_review: 'warning',
  unmatched: 'danger',
  matched: 'success',
  ignored: 'gray',
} as const satisfies Record<BankTxStatus, string>;

export const getBankTxStatusVariant = (status: BankTxStatus) =>
  BANK_TX_STATUS_VARIANTS[status];

export const getBankTxStatusLabel = (status: BankTxStatus): string =>
  i18n.t(`badge_status.${status}`);

// ---- Bank transaction tabs --------------------------------------

export const BANK_TX_STATUS_TABS: {
  id: BankTxStatus;
  label: string;
}[] = [
  { id: 'needs_review', label: 'badge_status.needs_review' },
  { id: 'unmatched', label: 'badge_status.unmatched' },
  { id: 'matched', label: 'badge_status.matched' },
  { id: 'ignored', label: 'badge_status.ignored' },
];

// ---- Cash drawer shift status -----------------------------------

export type ShiftStatus = Shift['status'];

export const SHIFT_STATUS_VARIANTS = {
  open: 'success',
  closed: 'gray',
} as const satisfies Record<ShiftStatus, string>;

export const getShiftStatusVariant = (status: ShiftStatus) =>
  SHIFT_STATUS_VARIANTS[status];

export const getShiftStatusLabel = (status: ShiftStatus): string =>
  i18n.t(`badge_status.${status}`);