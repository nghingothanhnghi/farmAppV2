// src/utils/status.ts
import i18n from '../i18n';
import type { TableStatus, PaymentMethod } from '../models/interfaces/Billiard';

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

export const getPaymentMethodLabel = (method: PaymentMethod): string =>
  i18n.t(`badge_status.${method}`);

