// src/components/Jackpot/JackpotPage.tsx

import { useState } from 'react';
import { useJackpot } from '../../hooks/useJackpot';
import { useAuth } from '../../contexts/authContext';
import type { PlayType, PrizeResult } from '../../models/interfaces/Jackpot';
import JackpotRulesPanel from './components/JackpotRulesPanel';
import JackpotLatestDraw from './components/JackpotLatestDraw';
import JackpotNumberSelector from './components/JackpotNumberSelector';
import JackpotTicketsList from './components/JackpotTicketsList';

const JackpotPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const { latestDraw, nextDrawLabel, rules, tickets, loading, error, actions, prizeHistory} = useJackpot();
    const [numbers, setNumbers] = useState<number[]>([]);
    const [playType, setPlayType] = useState<PlayType>('basic');
    const [prizes, setPrizes] = useState<Record<number, PrizeResult | string>>({});

    // Derive required number count (fallback to 6 if rules not loaded)
    const requiredNumbers = rules?.number_range?.length ? 6 : 6;

    const handleBuyTicket = async () => {
        if (!isAuthenticated || !user) {
            alert('Please log in to buy a ticket.');
            return;
        }
        if (!latestDraw) {
            alert('No active draw available.');
            return;
        }
        if (numbers.length !== requiredNumbers) {
            alert(`Please select exactly ${requiredNumbers} numbers.`);
            return;
        }
        try {
            const ticket = await actions.buyTicket({
                user_id: user.id,
                draw_id: latestDraw.id,
                numbers,
                play_type: playType,
            });
            alert(`Ticket #${ticket.id} purchased successfully!`);
            setNumbers([]); // reset selection
        } catch {
            // errors are handled in the hook
        }
    };

    const handleCheckResult = async (ticketId: number) => {
        setPrizes(prev => ({ ...prev, [ticketId]: 'Checking...' }));
        const result = await actions.checkTicket(ticketId);
        setPrizes(prev => ({
            ...prev,
            [ticketId]: result ?? 'No prize',
        }));
    };

    return (


        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🎰 Jackpot 6/55</h1>

            <JackpotRulesPanel rules={rules} />

            {loading && <p className="text-gray-500">Loading data...</p>}
            {error && (
                <p className="text-red-500 mb-4">
                    {error}
                    <button
                        onClick={actions.fetchInitialData}
                        className="ml-2 text-blue-600 underline"
                    >
                        Retry
                    </button>
                </p>
            )}

      {/* Prize history summary + probabilities */}
      {prizeHistory && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 shadow-sm">
          <h3 className="font-bold text-green-800">🏆 Thống kê trúng thưởng</h3>
          <ul className="mt-2 space-y-1 text-green-700">
            <li>🎰 Jackpot 1: <strong>{prizeHistory.totalJackpot1 ?? 0}</strong></li>
            <li>🎰 Jackpot 2: <strong>{prizeHistory.totalJackpot2 ?? 0}</strong></li>
            <li>🥇 Giải Nhất: <strong>{prizeHistory.totalFirst ?? 0}</strong></li>
            <li>🥈 Giải Nhì: <strong>{prizeHistory.totalSecond ?? 0}</strong></li>
            <li>🥉 Giải Ba: <strong>{prizeHistory.totalThird ?? 0}</strong></li>
          </ul>
          {typeof prizeHistory.totalPrizeValue === "number" && (
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
      )}



            <JackpotLatestDraw latestDraw={latestDraw} nextDrawLabel={nextDrawLabel} />

            <JackpotNumberSelector
                numbers={numbers}
                setNumbers={setNumbers}
                numberRange={rules?.number_range ?? Array.from({ length: 55 }, (_, i) => i + 1)}
                requiredNumbers={requiredNumbers}
            />

            {/* Play Type Selector */}
            <select
                value={playType}
                onChange={e => setPlayType(e.target.value as PlayType)}
                className="border rounded-lg p-2 mb-4 w-full"
            >
                <option value="basic">Basic</option>
                <option value="bao5">Bao 5</option>
                <option value="bao7">Bao 7</option>
                <option value="bao8">Bao 8</option>
                <option value="bao9">Bao 9</option>
            </select>

            <button
                onClick={handleBuyTicket}
                disabled={loading || numbers.length !== requiredNumbers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Buy Ticket'}
            </button>

            <JackpotTicketsList
                tickets={tickets}
                prizes={prizes}
                onCheckResult={handleCheckResult}
            />
        </div>
    );
};

export default JackpotPage;
