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
        <div className="p-4 rounded-lg shadow bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-white/5 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900/30 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          <p className="text-sm text-blue-600 dark:text-blue-300">Total Tickets</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-300">
            {salesSummary.total_tickets.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-lg shadow bg-green-50 border border-green-200 dark:bg-gray-800 dark:border-white/5 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900/30 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          <p className="text-sm text-green-600 dark:text-green-300">Unit Price</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-300">
            {salesSummary.unit_price.toLocaleString()} đ
          </p>
        </div>
        <div className="p-4 rounded-lg shadow bg-purple-50 border border-purple-200 dark:bg-gray-800 dark:border-white/5 bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900/30 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          <p className="text-sm text-purple-600 dark:text-purple-300">Total Revenue</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-300">
            {salesSummary.total_revenue.toLocaleString()} đ
          </p>
        </div>
      </div>
    </div>
  );
};

export default JackpotSalesSummaryPanel;
