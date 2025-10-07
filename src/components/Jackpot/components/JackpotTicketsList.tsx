import { useEffect, useState, useMemo } from 'react';
import type { Ticket, PrizeResult } from '../../../models/interfaces/Jackpot';
import EmptyState from '../../common/EmptyState';
import { IconMoodEmpty } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../common/Button';
import { formatDateVN } from '../../../utils/formatters';
interface Props {
  tickets: Ticket[];
  prizes: Record<number, PrizeResult | string>;
  onCheckResult: (ticketId: number) => void;
}

const JackpotTicketsList: React.FC<Props> = ({ tickets, prizes, onCheckResult }) => {
  console.log('Prizes:', prizes);
  console.log('Tickets:', tickets);
  // Sort latest first
  // const sortedTickets = tickets.slice().reverse();
  const sortedTickets = useMemo(() => tickets.slice().reverse(), [tickets]);


  // Track the latest ticket ID to highlight it
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  useEffect(() => {
    if (tickets.length > 0) {
      const newestTicket = tickets[tickets.length - 1];
      setHighlightedId(newestTicket.id);

      // Remove highlight after 2s
      const timeout = setTimeout(() => setHighlightedId(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [tickets]); // runs whenever tickets change
  return (
    <div className="">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">Vé của bạn</h3>
      {tickets.length === 0 && (
        <EmptyState
          icon={<IconMoodEmpty size={48} />}
          message="Bạn chưa có vé nào. Hãy mua ngay để tham gia kỳ quay tiếp theo!"
        />
      )}
      <div className="max-h-30 overflow-y-auto mt-2 pr-1 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] [mask-repeat:no-repeat] [mask-size:100%_100%]">
        <AnimatePresence>
          {sortedTickets.map(ticket => {
            const prize = prizes[ticket.id];
            const isHighlighted = ticket.id === highlightedId;
            return (
              <motion.div
                key={ticket.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor: isHighlighted
                    ? 'rgba(168, 85, 247, 0.15)' // purple highlight
                    : 'rgba(0,0,0,0)',
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 dark:bg-gray-800/80 dark:border-white/5 shadow-sm mb-2"
              >
                <div className='flex-1'>
                  <div className="flex flex-col text-xs text-gray-900 dark:text-gray-200">
                    {ticket.numbers.join(', ')}
                    <div className='flex items-center space-x-2 text-[0.625rem] mt-0.5'>
                      <span className=' text-gray-700 dark:text-gray-400 line-clamp-3'>#{ticket.id} — ({ticket.play_type})</span>
                      {ticket.draw && (
                        <span className="text-[0.625rem] text-gray-500 dark:text-gray-400">
                          Kỳ quay: {formatDateVN(ticket.draw.draw_date)}
                        </span>
                      )}
                      {typeof prize === 'string' && (
                        <span
                          className={`${prize === 'No prize' ? 'text-gray-500' : 'text-blue-500'
                            }`}
                        >
                          {prize}
                        </span>
                      )}
                    </div>

                  </div>
                  {prize && typeof prize !== 'string' && (
                    <p className="text-green-700 font-semibold">
                      🎉 {prize.category} — {prize.prize_value.toLocaleString()}₫
                    </p>
                  )}
                </div>
                <Button
                  label="Kiểm tra"
                  onClick={() => onCheckResult(ticket.id)}
                  variant={
                    ticket.draw?.status === "scheduled"
                      ? "secondary" // outlined/neutral for upcoming draw
                      : "primary"   // filled for completed draws
                  }
                  rounded='lg'
                  size='xxs'
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JackpotTicketsList;
