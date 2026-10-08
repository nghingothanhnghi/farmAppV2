import i18n from '../i18n';
import type { TableStatus, PaymentMethod } from '../models/interfaces/Billiard';

export const getTableStatusLabel = (status: TableStatus): string =>
  i18n.t(`badge_status.${status}`);

export const getPaymentMethodLabel = (method: PaymentMethod): string =>
  i18n.t(`badge_status.${method}`);
