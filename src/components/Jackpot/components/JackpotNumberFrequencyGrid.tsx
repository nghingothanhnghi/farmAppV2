// src/components/Jackpot/components/JackpotNumberFrequencyGrid.tsx
import React from 'react';

interface NumberFrequency {
  number: number;
  count: number;
}

interface Props {
  hotNumbers: NumberFrequency[];
  coldNumbers: NumberFrequency[];
  maxNumber?: number; // default 55
}

const JackpotNumberFrequencyGrid: React.FC<Props> = ({
  hotNumbers,
  coldNumbers,
  maxNumber = 55,
}) => {
  // Tạo map nhanh để check hot/cold
  const hotMap = new Map(hotNumbers.map(n => [n.number, n.count]));
  const coldMap = new Map(coldNumbers.map(n => [n.number, n.count]));

  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-10 gap-2 mt-4">
      {numbers.map(num => {
        const isHot = hotMap.has(num);
        const isCold = coldMap.has(num);
        const count = hotMap.get(num) ?? coldMap.get(num) ?? 0;

        let bg = 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'; // default
        if (isHot) bg = 'bg-red-500 text-white dark:bg-red-600 dark:text-white';
        else if (isCold) bg = 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white';

        return (
          <div
            key={num}
            className={`flex flex-col items-center justify-center rounded-md p-2 text-sm font-bold ${bg}`}
          >
            <span>{num}</span>
            <span className="text-xs font-normal">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default JackpotNumberFrequencyGrid;
