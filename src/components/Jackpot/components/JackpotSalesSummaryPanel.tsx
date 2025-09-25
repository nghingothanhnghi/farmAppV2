// src/components/Jackpot/components/JackpotSalesSummaryPanel.tsx
import React from 'react';
import type { SalesSummaryResponse } from '../../../models/interfaces/Jackpot';

interface Props {
  salesSummary: SalesSummaryResponse;
}

const JackpotSalesSummaryPanel: React.FC<Props> = ({ salesSummary }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
        💰 Sales Summary
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center shadow-sm">
          <p className="text-sm text-gray-500">Total Tickets</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {salesSummary.total_tickets.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center shadow-sm">
          <p className="text-sm text-gray-500">Unit Price</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {salesSummary.unit_price.toLocaleString()} đ
          </p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {salesSummary.total_revenue.toLocaleString()} đ
          </p>
        </div>
      </div>
    </div>
  );
};

export default JackpotSalesSummaryPanel;
