// src/components/Jackpot/components/JackpotAnalyticsPanel.tsx
import React from 'react';
import type { SalesSummaryResponse, NextSuggestionResponse } from '../../../models/interfaces/Jackpot';
import JackpotSalesSummaryPanel from './JackpotSalesSummaryPanel';
import JackpotNextSuggestionPanel from './JackpotNextSuggestionPanel';
interface Props {
    salesSummary: SalesSummaryResponse | null;
    nextSuggestion: NextSuggestionResponse | null;
}

const JackpotAnalyticsPanel: React.FC<Props> = ({ salesSummary, nextSuggestion }) => {
    if (!salesSummary && !nextSuggestion) return null;
    return (
        <React.Fragment>
            {salesSummary && <JackpotSalesSummaryPanel salesSummary={salesSummary} />}
            {nextSuggestion && <JackpotNextSuggestionPanel nextSuggestion={nextSuggestion} />}
        </React.Fragment>
    );
};

export default JackpotAnalyticsPanel;
