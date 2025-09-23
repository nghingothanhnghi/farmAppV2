// src/components/Jackpot/components/JackpotPrizeHistory.tsx
import React from 'react';
import type { PrizeHistorySummary } from '../../../models/interfaces/Jackpot';

interface Props {
  prizeHistory: PrizeHistorySummary | null;
}

const JackpotPrizeHistory: React.FC<Props> = ({ prizeHistory }) => {
  if (!prizeHistory) return null;

  return (
    <div className="
      bg-green-50 border border-green-200 
        dark:bg-gray-800 dark:border-white/5
        bg-gradient-to-b from-green-50 to-green-100
        shadow dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]
        dark:from-green-950 dark:to-green-900/30 
        transition-all duration-300 
        p-4 space-y-4
        rounded-lg"
    >
      <h3 className="text-sm font-medium text-green-900 dark:text-green-300">Thống kê trúng thưởng</h3>
      <dl className="-my-3 divide-y divide-gray-200 dark:divide-white/5 text-xs">
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Jackpot 1:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{prizeHistory.totalJackpot1 ?? 0}</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Jackpot 2:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{prizeHistory.totalJackpot2 ?? 0}</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Giải Nhất:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{prizeHistory.totalFirst ?? 0}</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Giải Nhì:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{prizeHistory.totalSecond ?? 0}</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Giải Ba:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{prizeHistory.totalThird ?? 0}</dd>
        </div>
      </dl>
      {typeof prizeHistory.totalPrizeValue === 'number' && (
        <div className='flex flex-col items-center mt-4 border border-green-200 dark:border-white/5 rounded-lg bg-green-100 dark:bg-green-900/30 p-4'>
          <h6 className="text-[0.625rem] text-gray-600 dark:text-gray-400">Tổng giá trị giải thưởng</h6>
          <p className='text-2xl font-bold'>{prizeHistory.totalPrizeValue.toLocaleString('vi-VN')}₫</p>
        </div>
      )}

      {prizeHistory.probabilities && (
        <div className='space-y-4'>
          <h3 className="text-sm font-medium text-green-900 dark:text-green-300">Xác suất trúng thưởng</h3>
          <dl className="-my-3 divide-y divide-gray-200 dark:divide-white/5 text-xs">
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-gray-900 dark:text-gray-200">Jackpot:</dt>
              <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">1 / {Math.round(1 / prizeHistory.probabilities.jackpot).toLocaleString('vi-VN')}</dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-gray-900 dark:text-gray-200">5 số + Bonus:</dt>
              <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">1 / {Math.round(1 / prizeHistory.probabilities.five_plus_bonus).toLocaleString('vi-VN')}</dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-gray-900 dark:text-gray-200">Giải Nhì(4 số):</dt>
              <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">1 / {Math.round(1 / prizeHistory.probabilities.four_numbers).toLocaleString('vi-VN')}</dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-gray-900 dark:text-gray-200">Giải Ba(3 số):</dt>
              <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">1 / {Math.round(1 / prizeHistory.probabilities.three_numbers).toLocaleString('vi-VN')}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default JackpotPrizeHistory;
