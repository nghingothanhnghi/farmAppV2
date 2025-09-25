// src/components/Jackpot/components/JackpotRulesPanel.tsx
import React from 'react';
import type { JackpotRules } from '../../../models/interfaces/Jackpot';
import Spinner from '../../common/Spinner';

interface JackpotRulesProps {
  rules: JackpotRules | null;
}

const JackpotRulesPanel: React.FC<JackpotRulesProps> = ({ rules }) => {
  if (!rules) {
    return (
      <Spinner size={32} />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">Thể lệ Jackpot 6/55</h3>
      <dl className="-my-3 divide-y divide-gray-200 dark:divide-white/5 text-xs">
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Giá vé tối thiểu:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{rules.min_price.toLocaleString()}₫</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Chọn số:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">
            Chọn 6 số trong khoảng{' '}
            {rules.number_range[0]} –{' '}
            {rules.number_range[rules.number_range.length - 1]} để tham gia.
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Giải Jackpot 1:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{rules.jackpot1_min.toLocaleString()}₫</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Giải Jackpot 2:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{rules.jackpot2_min.toLocaleString()}₫</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-gray-900 dark:text-gray-200">Lịch quay số:</dt>
          <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{rules.draw_days.join(', ')} lúc {rules.draw_time}</dd>
        </div>
      </dl>
    </div>
  );
};

export default JackpotRulesPanel;
