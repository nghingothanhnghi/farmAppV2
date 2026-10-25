// src/components/billiard/components/ShiftSummaryView.tsx
import React from 'react';
import Badge from '../../common/Badge';
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatMoneyString, toAmount } from '../../../utils/billiard';
import type { Shift, ShiftSummary } from '../../../models/interfaces/CashDrawer';

const Row: React.FC<{ label: string; value: React.ReactNode; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <span className={bold ? 'text-base font-bold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-100'}>
      {value}
    </span>
  </div>
);

/** counted - expected. Negative = cash is missing: red. */
export const Variance: React.FC<{ value: string | null }> = ({ value }) => {
  if (value === null) return <span>—</span>;
  const n = toAmount(value);
  const cls = n < 0 ? 'text-red-600 font-semibold' : n > 0 ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold';
  return (
    <span className={cls}>
      {n > 0 ? '+' : ''}
      {formatMoneyString(value)}
      {n < 0 && ' (cash missing)'}
    </span>
  );
};

/** Opening / expected / counted / variance of a shift (live for open ones, frozen once closed). */
export const ShiftResult: React.FC<{ shift: Shift }> = ({ shift }) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-1.5">
    <Row label={t('cashier.expected_cash')} value={formatMoneyString(shift.expected_cash)} />
    <Row label={t('cashier.counted_cash')} value={formatMoneyString(shift.counted_cash)} />
    <Row label={t('cashier.variance_cash')} value={<Variance value={shift.variance} />} bold />
  </div>
)};

const ShiftSummaryView: React.FC<{ shift: ShiftSummary }> = ({ shift }) => {
  const { t } = useTranslation();
  
  return (
  <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 dark:bg-gray-900 p-4 space-y-4">
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('cashier.shift')} #{shift.id}</h3>
        <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
          Opened {formatDateTime(shift.opened_at)}
          {shift.opened_by ? ` by ${shift.opened_by}` : ''}
          {shift.closed_at ? ` · Closed ${formatDateTime(shift.closed_at)}` : ''}
        </p>
      </div>
      <Badge
        label={shift.status === 'open' ? 'Open' : 'Closed'}
        variant={shift.status === 'open' ? 'success' : 'gray'}
        size="xsmall"
      />
    </div>

    {shift.status === 'open' && (
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">Expected cash in drawer</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatMoneyString(shift.expected_cash)}
        </p>
      </div>
    )}

    <div className="space-y-1.5">
      <Row label={t('cashier.opening_float')} value={formatMoneyString(shift.opening_float)} />
      <Row label={t('cashier.cash_sales')} value={formatMoneyString(shift.cash_sales)} />
      <Row label={t('cashier.cash_voids')} value={formatMoneyString(shift.cash_voids)} />
      <Row label={t('cashier.pay_ins')} value={formatMoneyString(shift.pay_ins)} />
      <Row label={t('cashier.pay_outs')} value={formatMoneyString(shift.pay_outs)} />
      <p className="text-[0.625rem] text-gray-500 dark:text-gray-400 text-right">
        Change given {formatMoneyString(shift.change_given)} is already netted out of cash sales.
      </p>
    </div>

    {shift.status === 'closed' && (
      <div className="border-t border-gray-200 dark:border-white/5 pt-3">
        <ShiftResult shift={shift} />
      </div>
    )}

    {shift.methods.length > 0 && (
      <div className="space-y-1.5 border-t border-gray-200 dark:border-white/5 pt-3">
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          By payment method ({shift.payments_count} payments)
        </p>
        {shift.methods.map((m) => (
          <div key={m.method} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-700 dark:text-gray-200">
              {m.method.replace('_', ' ')} · {m.received_count}
            </span>
            <span className="text-gray-800 dark:text-gray-100">
              {formatMoneyString(m.net_total)}
              {toAmount(m.voided_total) > 0 && (
                <span className="text-[0.625rem] text-gray-500"> (voided {formatMoneyString(m.voided_total)})</span>
              )}
            </span>
          </div>
        ))}
      </div>
    )}

    {shift.movements.length > 0 && (
      <div className="space-y-1.5 border-t border-gray-200 dark:border-white/5 pt-3">
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Cash movements
        </p>
        <ul className="divide-y divide-gray-200 dark:divide-white/5">
          {shift.movements.map((mv) => (
            <li key={mv.id} className="py-1.5 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="text-gray-800 dark:text-gray-100 truncate">{mv.reason}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {formatDateTime(mv.created_at)}
                  {mv.created_by ? ` · ${mv.created_by}` : ''}
                </p>
              </div>
              <span className={mv.type === 'pay_in' ? 'text-green-600' : 'text-red-600'}>
                {mv.type === 'pay_in' ? '+' : '−'}
                {formatMoneyString(mv.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)};

export default ShiftSummaryView;
