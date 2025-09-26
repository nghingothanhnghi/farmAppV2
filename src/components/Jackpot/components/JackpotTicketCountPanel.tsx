import React from 'react';
import type { TicketCountStat } from '../../../models/interfaces/Jackpot';

interface JackpotTicketCountPanelProps {
  ticketCountStats: TicketCountStat[];
}

const JackpotTicketCountPanel: React.FC<JackpotTicketCountPanelProps> = ({ ticketCountStats }) => {
  return (
    <div
      className='
    bg-white rounded-2xl shadow-md border border-gray-100 dark:border-white/5 
      bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 
      dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-5 space-y-4'
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
          🎟️ Ticket Count per Draw
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Last {ticketCountStats.length} draws
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ticketCountStats.map(stat => (
          <div
            key={stat.draw_id}
            className="
            flex flex-col items-start rounded-xl p-3 
            bg-gradient-to-tr from-indigo-50 to-white 
          dark:from-indigo-900/20 dark:to-gray-900 
            border border-gray-200 dark:border-gray-700 
            inset-shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Draw #{stat.draw_id}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {new Date(stat.draw_date).toLocaleDateString('vi-VN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="mt-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {stat.ticket_count.toLocaleString()} 🎫
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JackpotTicketCountPanel;
