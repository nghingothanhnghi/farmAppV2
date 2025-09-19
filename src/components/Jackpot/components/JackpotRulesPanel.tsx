// src/components/Jackpot/components/JackpotRules.tsx
import React from 'react';
import type { JackpotRules } from '../../../models/interfaces/Jackpot';
import Spinner from '../../common/Spinner';

interface JackpotRulesProps {
  rules: JackpotRules | null;
}

const JackpotRulesPanel: React.FC<JackpotRulesProps> = ({ rules }) => {
  if (!rules) {
    return (
      <Spinner size={32}/>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">📜 Thể lệ Jackpot 6/55</h2>

      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
        <li>
          <strong>Giá vé tối thiểu:</strong> {rules.min_price.toLocaleString()}₫
        </li>
        <li>
          <strong>Chọn số:</strong> Chọn 6 số trong khoảng{' '}
          {rules.number_range[0]} –{' '}
          {rules.number_range[rules.number_range.length - 1]} để tham gia.
        </li>
        <li>
          <strong>Giải Jackpot 1:</strong> Tối thiểu{' '}
          {rules.jackpot1_min.toLocaleString()}₫
        </li>
        <li>
          <strong>Giải Jackpot 2:</strong> Tối thiểu{' '}
          {rules.jackpot2_min.toLocaleString()}₫
        </li>
        <li>
          <strong>Lịch quay số:</strong>{' '}
          {rules.draw_days.join(', ')} lúc {rules.draw_time}
        </li>
      </ul>
    </div>
  );
};

export default JackpotRulesPanel;
