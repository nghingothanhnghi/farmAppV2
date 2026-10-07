// src/components/billiard/components/TableCard.tsx
import React from 'react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import StartStopButtons from './StartStopButtons';
import { DEFAULT_CURRENCY, formatElapsed, formatMoneyString, parseUtc } from '../../../utils/billiard';
import type { ActiveTable, BilliardTable } from '../../../models/interfaces/Billiard';

interface Props {
  table: BilliardTable;
  live?: ActiveTable;
  now: number; // shared 1s tick from the page
  starting: boolean;
  disabled: boolean; // another start is in flight
  onStart: (table: BilliardTable) => void;
  onOpen: (sessionId: number) => void;
}

const STATUS_VARIANT = {
  available: 'success',
  playing: 'warning',
  reserved: 'secondary',
  maintenance: 'danger',
} as const;

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className={bold ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}>
      {value}
    </span>
  </div>
);

const TableCard: React.FC<Props> = ({ table, live, now, starting, disabled, onStart, onOpen }) => {
  const currency = live?.currency ?? DEFAULT_CURRENCY;
  const elapsed = live ? Math.max(0, Math.floor((now - parseUtc(live.start_time)) / 1000)) : 0;
  const variant = STATUS_VARIANT[table.status as keyof typeof STATUS_VARIANT] ?? 'gray';

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{table.name}</h3>
          <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
            {formatMoneyString(table.hourly_rate)} / h
          </p>
        </div>
        <Badge label={table.status} variant={variant} size="xsmall" className="capitalize" />
      </div>

      {table.status === 'playing' && (
        <div className="space-y-2 flex-1">
          {live ? (
            <>
              <div className="font-mono text-2xl font-semibold text-gray-900 dark:text-white">
                {formatElapsed(elapsed)}
              </div>
              <div className="space-y-1 border-t border-gray-200 dark:border-white/5 pt-2">
                <Row label="Table fee" value={formatMoneyString(live.current_table_fee, currency)} />
                <Row label="Products" value={formatMoneyString(live.current_product_fee, currency)} />
                <Row label="Total" value={formatMoneyString(live.current_total, currency)} bold />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400">Loading session…</p>
          )}
        </div>
      )}

      <div className="mt-auto">
        {table.status === 'available' && (
          <StartStopButtons
            status="available"
            busy={starting}
            disabled={disabled}
            onStart={() => onStart(table)}
            fullWidth
          />
        )}
        {table.status === 'playing' && (
          <Button
            label="Open session"
            variant="secondary"
            size="sm"
            rounded="lg"
            fullWidth
            disabled={!live}
            onClick={() => live && onOpen(live.session_id)}
          />
        )}
        {table.status === 'reserved' && (
          <p className="text-xs text-gray-400 text-center">Reserved</p>
        )}
        {table.status === 'maintenance' && (
          <p className="text-xs text-gray-400 text-center">Under maintenance</p>
        )}
      </div>
    </div>
  );
};

export default TableCard;
