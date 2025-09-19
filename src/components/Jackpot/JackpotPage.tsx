// src/components/Jackpot/JackpotPage.tsx

import { useState } from 'react';
import { useJackpot } from '../../hooks/useJackpot';
import type { PlayType, PrizeResult, Ticket } from '../../models/interfaces/Jackpot';
import JackpotRulesPanel from './components/JackpotRulesPanel';
import JackpotLatestDraw from './components/JackpotLatestDraw';
import JackpotNumberSelector from './components/JackpotNumberSelector';
import JackpotTicketsList from './components/JackpotTicketsList';
import JackpotPrizeHistory from './components/JackpotPrizeHistory';
import BuyTicketPanel from './components/BuyTicketPanel';

const JackpotPage: React.FC = () => {
    const { latestDraw, nextDrawLabel, rules, tickets: initialTickets, loading, error, actions, prizeHistory } = useJackpot();
    const [numbers, setNumbers] = useState<number[]>([]);
    const [playType, setPlayType] = useState<PlayType>('basic');
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets); // ✅ local tickets state
    const [prizes, setPrizes] = useState<Record<number, PrizeResult | string>>({});

    // Derive required number count (fallback to 6 if rules not loaded)
    const requiredNumbers = rules?.number_range?.length ? 6 : 6;

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
            <JackpotPrizeHistory prizeHistory={prizeHistory} />

            <JackpotLatestDraw latestDraw={latestDraw} nextDrawLabel={nextDrawLabel} />

            <JackpotNumberSelector
                numbers={numbers}
                setNumbers={setNumbers}
                numberRange={rules?.number_range ?? Array.from({ length: 55 }, (_, i) => i + 1)}
                requiredNumbers={requiredNumbers}
            />

            {/* Buy Ticket + PlayType Panel */}
            <BuyTicketPanel
                numbers={numbers}
                setNumbers={setNumbers}
                playType={playType}
                setPlayType={setPlayType}
                requiredNumbers={requiredNumbers}
                onTicketPurchased={(ticket) => setTickets(prev => [...prev, ticket])} // ✅ update local tickets
            />
            {/* User's Tickets List */}
            <JackpotTicketsList
                tickets={tickets}
                prizes={prizes}
                onCheckResult={handleCheckResult}
            />
        </div>
    );
};

export default JackpotPage;
