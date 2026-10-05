// src/components/billiard/components/BillView.tsx
import React from 'react';
import Badge from '../../common/Badge';
import { addDecimalStrings, formatDateTime, formatDuration, formatMoneyString, getBillState } from '../../../utils/billiard';
import type { BillResponse } from '../../../models/interfaces/Billiard';

interface Props {
  bill: BillResponse;
  /** Live figures to show instead of the bill's while the session is running. */
  overrides?: Partial<Pick<BillResponse, 'table_fee' | 'product_fee' | 'grand_total'>>;
}

const Line: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <span className={bold ? 'text-base font-bold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-100'}>
      {value}
    </span>
  </div>
);

const BillView: React.FC<Props> = ({ bill, overrides }) => {
  const b = { ...bill, ...overrides };
  const c = b.currency;
  const state = getBillState(bill);
  const productFee = b.product_fee ?? addDecimalStrings(b.items.map((i) => i.line_total));

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {b.table_name ?? `Table #${b.table_id}`} · Session #{b.session_id}
          </h3>
          <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
            {formatDateTime(b.start_time)}
            {b.end_time ? ` → ${formatDateTime(b.end_time)}` : ' → in progress'}
            {b.duration_minutes != null && ` · ${formatDuration(b.duration_minutes)}`}
          </p>
        </div>
        <Badge
          label={state === 'paid' ? 'Paid' : state === 'stopped' ? 'Awaiting payment' : 'Playing'}
          variant={state === 'paid' ? 'success' : state === 'stopped' ? 'warning' : 'info'}
          size="xsmall"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Items</p>
        {b.items.length === 0 ? (
          <p className="text-xs text-gray-400">No items added.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-white/5">
            {b.items.map((it, idx) => (
              <li key={it.id ?? idx} className="py-1.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="text-gray-800 dark:text-gray-100 truncate">
                    {it.product_name}
                    {it.variant_name ? ` (${it.variant_name})` : ''}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {it.quantity} × {formatMoneyString(it.unit_price, c)}
                  </p>
                </div>
                <span className="shrink-0 text-gray-800 dark:text-gray-100">{formatMoneyString(it.line_total, c)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1.5 border-t border-gray-200 dark:border-white/5 pt-3">
        <Line label="Table fee" value={formatMoneyString(b.table_fee, c)} />
        <Line label="Products" value={formatMoneyString(productFee, c)} />
        <Line label="Total" value={formatMoneyString(b.grand_total, c)} bold />
        {bill.payment_method && state === 'paid' && (
          <Line label="Paid by" value={bill.payment_method.replace('_', ' ')} />
        )}
      </div>
    </div>
  );
};

export default BillView;
