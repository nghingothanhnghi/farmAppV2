// src/utils/status.ts
import i18n from '../i18n';
import type { TableStatus, BillPaymentMethod, LineStatus, BillState, PaymentEventType } from '../models/interfaces/Billiard';
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
  active: 'info',
  stopped: 'secondary',
  pending: 'warning',
  paid: 'success',
} as const satisfies Record<BillState, string>;

export const getBillStatusVariant = (status: BillState) =>
  BILL_STATUS_VARIANTS[status];

export const getBillStatusLabel = (status: BillState): string =>
  i18n.t(`bill_status.${status}`);

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

export const getPaymentModeLabel = (
  mode: BillPaymentMethod | 'split'
): string =>
  mode === 'split'
    ? i18n.t('badge_status.split')
    : getPaymentMethodLabel(mode);

// ---- Payment event type ------------------------------------------
export const PAYMENT_EVENT_LABELS = {
  line_created: 'payment_events.line_created',
  cash_received: 'payment_events.cash_received',
  transfer_awaiting: 'payment_events.transfer_awaiting',
  transfer_confirmed: 'payment_events.transfer_confirmed',
  transfer_auto_confirmed: 'payment_events.transfer_auto_confirmed',
  transfer_assigned_from_bank: 'payment_events.transfer_assigned_from_bank',
  line_cancelled: 'payment_events.line_cancelled',
  line_failed: 'payment_events.line_failed',
  line_voided: 'payment_events.line_voided',
  order_paid: 'payment_events.order_paid',
} as const satisfies Record<PaymentEventType, string>;

export const getPaymentEventLabel = (type: string): string => {
  const key = PAYMENT_EVENT_LABELS[type as PaymentEventType];

  return key
    ? i18n.t(key)
    : type.replace(/_/g, ' ');
};

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