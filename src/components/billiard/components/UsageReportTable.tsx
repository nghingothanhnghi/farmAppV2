// src/components/billiard/components/UsageReportTable.tsx
import React, { useMemo } from 'react';
import DataGrid from '../../common/dataGrid/dataGrid';
import { addDecimalStrings, DEFAULT_CURRENCY, formatDuration, formatMoneyString } from '../../../utils/billiard';
import type { UsageReport, UsageTotals } from '../../../models/interfaces/Billiard';

interface Props {
  report: UsageReport;
  currency?: string;
}

const UsageReportTable: React.FC<Props> = ({ report, currency = DEFAULT_CURRENCY }) => {
  const { rows } = report;

  // Prefer server totals; otherwise sum exactly (decimal strings via BigInt).
  const totals: UsageTotals = useMemo(
    () =>
      report.totals ?? {
        times_played: rows.reduce((s, r) => s + r.times_played, 0),
        total_minutes: rows.reduce((s, r) => s + r.total_minutes, 0),
        total_revenue: addDecimalStrings(rows.map((r) => r.total_revenue)),
        unpaid_total: addDecimalStrings(rows.map((r) => r.unpaid_total)),
      },
    [report.totals, rows]
  );

  const columnDefs = useMemo(
    () => [
      { headerName: 'Table', field: 'table_name', flex: 1 },
      { headerName: 'Times played', field: 'times_played', width: 140, filter: false },
      {
        headerName: 'Total time',
        field: 'total_minutes',
        width: 140,
        filter: false,
        valueFormatter: (p: any) => formatDuration(Number(p.value ?? 0)),
      },
      {
        headerName: 'Revenue',
        field: 'total_revenue',
        flex: 1,
        filter: false,
        valueFormatter: (p: any) => formatMoneyString(p.value, currency),
      },
      {
        headerName: 'Unpaid',
        field: 'unpaid_total',
        flex: 1,
        filter: false,
        valueFormatter: (p: any) => formatMoneyString(p.value, currency),
      },
    ],
    [currency]
  );

  const stat = (label: string, value: string) => (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-white/5 px-3 py-2">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataGrid rowData={rows} columnDefs={columnDefs} pagination paginationPageSize={10} height="420px" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stat('Times played', String(totals.times_played))}
        {stat('Total time', formatDuration(totals.total_minutes))}
        {stat('Total revenue', formatMoneyString(totals.total_revenue, currency))}
        {stat('Unpaid total', formatMoneyString(totals.unpaid_total, currency))}
      </div>
    </div>
  );
};

export default UsageReportTable;
