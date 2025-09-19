// src/components/Jackpot/components/JackpotPrizeHistory.tsx
import React from 'react';
import type { PrizeHistorySummary } from '../../../models/interfaces/Jackpot';

interface Props {
  prizeHistory: PrizeHistorySummary | null;
}

const JackpotPrizeHistory: React.FC<Props> = ({ prizeHistory }) => {
  if (!prizeHistory) return null;

  return (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 shadow-sm">
      <h3 className="font-bold text-green-800">🏆 Thống kê trúng thưởng</h3>
      <ul className="mt-2 space-y-1 text-green-700">
        <li>🎰 Jackpot 1: <strong>{prizeHistory.totalJackpot1 ?? 0}</strong></li>
        <li>🎰 Jackpot 2: <strong>{prizeHistory.totalJackpot2 ?? 0}</strong></li>
        <li>🥇 Giải Nhất: <strong>{prizeHistory.totalFirst ?? 0}</strong></li>
        <li>🥈 Giải Nhì: <strong>{prizeHistory.totalSecond ?? 0}</strong></li>
        <li>🥉 Giải Ba: <strong>{prizeHistory.totalThird ?? 0}</strong></li>
      </ul>

      {typeof prizeHistory.totalPrizeValue === 'number' && (
        <p className="mt-2 font-semibold text-green-800">
          💰 Tổng giá trị giải thưởng: {prizeHistory.totalPrizeValue.toLocaleString('vi-VN')}₫
        </p>
      )}

      {prizeHistory.probabilities && (
        <div className="mt-2">
          <h4 className="font-semibold text-green-800">🎯 Xác suất trúng thưởng</h4>
          <ul className="space-y-1">
            <li>🎰 Jackpot: 1 / {Math.round(1 / prizeHistory.probabilities.jackpot).toLocaleString('vi-VN')}</li>
            <li>🎰 5 số + Bonus: 1 / {Math.round(1 / prizeHistory.probabilities.five_plus_bonus).toLocaleString('vi-VN')}</li>
            <li>🥈 4 số: 1 / {Math.round(1 / prizeHistory.probabilities.four_numbers).toLocaleString('vi-VN')}</li>
            <li>🥉 3 số: 1 / {Math.round(1 / prizeHistory.probabilities.three_numbers).toLocaleString('vi-VN')}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default JackpotPrizeHistory;
