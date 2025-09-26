// src/components/Jackpot/JackpotPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useJackpotContext } from '../../contexts/jackpotContext';
import { useAuth } from '../../contexts/authContext';
import type { PlayType, PrizeResult } from '../../models/interfaces/Jackpot';
import JackpotRulesPanel from './components/JackpotRulesPanel';
import JackpotLatestDraw from './components/JackpotLatestDraw';
import JackpotNumberSelector from './components/JackpotNumberSelector';
import JackpotTicketsList from './components/JackpotTicketsList';
import JackpotPrizeHistory from './components/JackpotPrizeHistory';
import JackpotNumberFrequencyPanel from './components/JackpotNumberFrequencyPanel';
import JackpotAnalyticsPanel from './components/JackpotAnalyticsPanel';
import JackpotTicketCountPanel from './components/JackpotTicketCountPanel';
import BuyTicketPanel from './components/BuyTicketPanel';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Announcement from '../Announcement/Announcement';
import { IconPlus } from '@tabler/icons-react';

const JackpotPage: React.FC = () => {
    const navigate = useNavigate();
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const { user } = useAuth();
    const { latestDraw, currentDraw, rules, tickets, loading, error, actions, prizeHistory, ticketCountStats, numberFrequency, salesSummary, nextSuggestion } = useJackpotContext();
    const [numbers, setNumbers] = useState<number[]>([]);
    const [playType, setPlayType] = useState<PlayType>('basic');
    const [prizes, setPrizes] = useState<Record<number, PrizeResult | string>>({});

    // Derive required number count (fallback to 6 if rules not loaded)
    const requiredNumbers = rules?.number_range?.length ? 6 : 6;

    // ✅ Fetch user tickets when user logs in
    useEffect(() => {
        if (user) {
            actions.fetchUserTickets(user.id);
        }
        actions.fetchTicketCountByDraw();
        actions.fetchNumberFrequency();
        actions.fetchSalesSummary();
        actions.fetchNextSuggestion(20);
    }, [user, actions.fetchUserTickets]);

    useEffect(() => {
        if (error) {
            setShowAnnouncement(true);
        }
    }, [error]);


    const handleCheckResult = async (ticketId: number) => {
        setPrizes(prev => ({ ...prev, [ticketId]: 'Checking...' }));
        const result = await actions.checkTicket(ticketId);
        setPrizes(prev => ({
            ...prev,
            [ticketId]: result ?? 'No prize',
        }));
    };

    return (
        <div>
            <PageTitle
                title="Jackpot 6/55"
                actions={
                    <Button
                        variant="secondary"
                        icon={<IconPlus size={18} />}
                        iconOnly
                        rounded='full'
                        label="Create Draw"
                        className='bg-transparent'
                        onClick={() => navigate('/jackpot/create')}
                    />
                }
            />
            <div className="mx-auto max-w-4xl">
                {loading && <Spinner size={32} />}
                {error && showAnnouncement && (
                    <Announcement
                        type="error"
                        title="Something went wrong"
                        message={
                            <>
                                {error}
                                <button
                                    onClick={actions.fetchInitialData}
                                    className="ml-2 underline text-sm text-blue-800 dark:text-blue-300"
                                >
                                    Retry
                                </button>
                            </>
                        }
                        dismissible
                        onDismiss={() => setShowAnnouncement(false)}
                        size="xs"
                    />
                )}

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-6'>
                        <JackpotNumberSelector
                            numbers={numbers}
                            setNumbers={setNumbers}
                            numberRange={rules?.number_range ?? Array.from({ length: 55 }, (_, i) => i + 1)}
                            requiredNumbers={requiredNumbers}
                        />
                        <JackpotRulesPanel rules={rules} />
                        {/* Prize history summary + probabilities */}
                        <JackpotPrizeHistory prizeHistory={prizeHistory} />
                        <div className='space-y-6'>
                            <JackpotTicketCountPanel ticketCountStats={ticketCountStats} />

                            {numberFrequency && (
                                <JackpotNumberFrequencyPanel
                                    hotNumbers={numberFrequency.hot_numbers}
                                    coldNumbers={numberFrequency.cold_numbers}
                                    loading={loading}
                                    maxNumber={55}
                                />
                            )}

                            <JackpotAnalyticsPanel
                                salesSummary={salesSummary}
                                nextSuggestion={nextSuggestion}
                            />

                        </div>
                    </div>
                    <div className='flex flex-col space-y-2'>
                        {/* User's Tickets List */}
                        <JackpotTicketsList
                            tickets={tickets}
                            prizes={prizes}
                            onCheckResult={handleCheckResult}
                        />
                        <hr className='my-2 w-full border-t border-zinc-950/5 dark:border-white/5' />
                        {/* Buy Ticket + PlayType Panel */}
                        <BuyTicketPanel
                            numbers={numbers}
                            setNumbers={setNumbers}
                            playType={playType}
                            setPlayType={setPlayType}
                            requiredNumbers={requiredNumbers}
                        />
                        <JackpotLatestDraw latestDraw={latestDraw} currentDraw={currentDraw} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JackpotPage;
