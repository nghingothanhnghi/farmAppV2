// src/components/Jackpot/components/JackpotNextSuggestionPanel.tsx
import React from 'react';
import type { NextSuggestionResponse } from '../../../models/interfaces/Jackpot';

interface Props {
  nextSuggestion: NextSuggestionResponse;
}

const JackpotNextSuggestionPanel: React.FC<Props> = ({ nextSuggestion }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
        🎯 Suggested Numbers
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({nextSuggestion.strategy})
        </span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {nextSuggestion.suggested_numbers.map((n) => (
          <span
            key={n}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
};

export default JackpotNextSuggestionPanel;
