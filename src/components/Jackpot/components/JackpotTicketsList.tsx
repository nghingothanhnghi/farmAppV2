import type { Ticket, PrizeResult } from '../../../models/interfaces/Jackpot';

interface Props {
  tickets: Ticket[];
  prizes: Record<number, PrizeResult | string>;
  onCheckResult: (ticketId: number) => void;
}

const JackpotTicketsList: React.FC<Props> = ({ tickets, prizes, onCheckResult }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Your Tickets</h2>
      {tickets.length === 0 && <p className="text-gray-500">No tickets yet.</p>}
      {tickets.map(ticket => {
        const prize = prizes[ticket.id];
        return (
          <div
            key={ticket.id}
            className="p-3 border rounded-lg mb-2 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                #{ticket.id}: {ticket.numbers.join(', ')} ({ticket.play_type})
              </p>
              {prize && typeof prize !== 'string' && (
                <p className="text-green-700 font-semibold">
                  🎉 {prize.category} — {prize.prize_value.toLocaleString()}₫
                </p>
              )}
              {typeof prize === 'string' && (
                <p
                  className={`text-sm ${
                    prize === 'No prize' ? 'text-gray-500' : 'text-blue-500'
                  }`}
                >
                  {prize}
                </p>
              )}
            </div>
            <button
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg"
              onClick={() => onCheckResult(ticket.id)}
            >
              Check Result
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default JackpotTicketsList;
