// src/components/Jackpot/components/JackpotAnalyticsPanel.tsx
import React from 'react';
import type { SalesSummaryResponse, NextSuggestionResponse, TicketCountStat, NumberFrequency  } from '../../../models/interfaces/Jackpot';
import JackpotSalesSummaryPanel from './JackpotSalesSummaryPanel';
import JackpotNextSuggestionPanel from './JackpotNextSuggestionPanel';
import JackpotTicketCountPanel from './JackpotTicketCountPanel';
import JackpotNumberFrequencyPanel from './JackpotNumberFrequencyPanel';
interface Props {
    salesSummary: SalesSummaryResponse | null;
    nextSuggestion: NextSuggestionResponse | null;
    ticketCountStats: TicketCountStat[] | null;
    hotNumbers: NumberFrequency[] | null;
    coldNumbers: NumberFrequency[] | null;
    loading?: boolean;
    maxNumber?: number;
}

const JackpotAnalyticsPanel: React.FC<Props> = ({ salesSummary, nextSuggestion, ticketCountStats,  hotNumbers, 
  coldNumbers, 
  loading,
  maxNumber = 55, }) => {
    if (!salesSummary && !nextSuggestion && !ticketCountStats && !hotNumbers && !coldNumbers) return null;
    return (
        <div className="space-y-6">
            {salesSummary && <JackpotSalesSummaryPanel salesSummary={salesSummary} />}
            {ticketCountStats && <JackpotTicketCountPanel ticketCountStats={ticketCountStats} />}
            {hotNumbers && coldNumbers && ( <JackpotNumberFrequencyPanel hotNumbers={hotNumbers} coldNumbers={coldNumbers} loading={loading} maxNumber={maxNumber} />)}
            {nextSuggestion && <JackpotNextSuggestionPanel nextSuggestion={nextSuggestion} />}
        </div>
    );
};

export default JackpotAnalyticsPanel;
