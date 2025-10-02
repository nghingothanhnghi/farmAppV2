// src/hooks/useJackpot.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { jackpotService } from '../services/jackpotService';
import type { Draw, DrawCreateInput, Ticket, PrizeResult, TicketCreateInput, JackpotRules, PrizeHistorySummary, TicketCountStat, NumberFrequencyStat, SalesSummaryResponse, NextSuggestionResponse } from '../models/interfaces/Jackpot';
export const useJackpot = () => {
  const [rules, setRules] = useState<JackpotRules | null>(null);
  const [latestDraw, setLatestDraw] = useState<Draw | null>(null);
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [prizeHistory, setPrizeHistory] = useState<PrizeHistorySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketCountStats, setTicketCountStats] = useState<TicketCountStat[]>([]);
  const [numberFrequency, setNumberFrequency] = useState<NumberFrequencyStat | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesSummaryResponse | null>(null);
  const [nextSuggestion, setNextSuggestion] = useState<NextSuggestionResponse | null>(null);
  /**
   * Fetch Jackpot Rules
   */
  const fetchRules = useCallback(async () => {
    const data = await jackpotService.getRules();
    setRules(data);
    return data;
  }, []);

  /** Fetch latest completed draw */
  const fetchLatestDraw = useCallback(async () => {
    try {
      const draw = await jackpotService.getLatestDraw();
      if (draw && draw.status === 'completed') {
        setLatestDraw(draw);
        console.log('🎯 Latest completed draw:', draw);
      } else {
        setLatestDraw(null);
      }
      return draw;
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('No completed draws — skipping latestDraw.');
        setLatestDraw(null);
        return null;
      }
      throw err;
    }
  }, []);

  /** ✅ Fetch or create the next *scheduled* draw */
  const fetchCurrentDraw = useCallback(async () => {
    try {
      let draw = await jackpotService.getCurrentDraw();
      if (!draw) {
        console.warn('No scheduled draw found — creating one...');
        draw = await jackpotService.createDraw({ draw_type: 'automatic' });
      }

      if (draw && draw.status === 'scheduled') {
        setCurrentDraw(draw);
        console.log('🎯 Current scheduled draw:', draw);
      } else {
        setCurrentDraw(null);
      }
      return draw;
    } catch (err: any) {
      console.error('Failed to fetch current draw', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch current draw');
      return null;
    }
  }, []);

  /**
 * Fetch aggregated prize history (monthly, quarterly, yearly)
 */
  const fetchPrizeHistory = useCallback(async (range: 'month' | 'quarter' | 'year' = 'month') => {
    try {
      const data = await jackpotService.getPrizeHistory(range);
      setPrizeHistory(data);
      return data;
    } catch (err: any) {
      console.error('Failed to fetch prize history', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch prize history');
      return null;
    }
  }, []);

  /**
   * Fetch both rules and latest draw at once
   */
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        fetchRules(),
        fetchLatestDraw(),
        fetchCurrentDraw(),
        fetchPrizeHistory(),
      ]);
    } catch (err: any) {
      console.error('Failed to fetch jackpot data', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch jackpot data');
    } finally {
      setLoading(false);
    }
  }, [fetchRules, fetchLatestDraw, fetchPrizeHistory]);

  /**
* Fetch tickets for a user and update local state
*/
  const fetchUserTickets = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const data = await jackpotService.getTicketsByUser(userId);

      // Extract both tickets and prizes
      const normalizedTickets = data.map((item: any) => item.ticket);
      setTickets(normalizedTickets);

      // Optional: if you want to prefill prizes state
      // setPrizes(Object.fromEntries(data.map((item: any) => [item.ticket.id, item.prize ?? 'No prize'])));

      return normalizedTickets;
    } catch (err: any) {
      console.error('Failed to fetch user tickets', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch user tickets');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);



  /**
   * Buy a ticket and add it to local state
   */
  const buyTicket = useCallback(async (ticketInput: TicketCreateInput) => {
    try {
      setLoading(true);
      if (!currentDraw || currentDraw.status !== 'scheduled') {
        throw new Error('No active draw available');
      }

      const newTicket = await jackpotService.buyTicket(ticketInput);

      // ✅ Optimistically update tickets state instead of refetching all
      setTickets(prev => [...prev, newTicket]);
      // ✅ Refresh analytics after buying a ticket
      fetchTicketCountByDraw();
      fetchNumberFrequency();
      fetchSalesSummary();
      fetchNextSuggestion();

      return newTicket;
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to buy ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentDraw]);

  /**
   * Check ticket result by ID
   */
  const checkTicket = useCallback(async (ticketId: number): Promise<PrizeResult | null> => {
    try {
      setLoading(true);
      return await jackpotService.checkTicket(ticketId);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'No prize for this ticket');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ NEW: Create a draw (manual, automatic, or smart_auto)
   */
  const createDraw = useCallback(async (input: DrawCreateInput) => {
    try {
      setLoading(true);
      const newDraw = await jackpotService.createDraw(input);
      if (newDraw.status === 'completed') {
        setLatestDraw(newDraw);
      } else if (newDraw.status === 'scheduled') {
        setCurrentDraw(newDraw);
      }
      return newDraw;
    } catch (err: any) {
      console.error('Failed to create draw', err);
      setError(err.response?.data?.detail ?? 'Failed to create draw');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch ticket count per draw */
  const fetchTicketCountByDraw = useCallback(async () => {
    try {
      const data = await jackpotService.getTicketCountByDraw();
      setTicketCountStats(data);
      return data;
    } catch (err: any) {
      console.error('Failed to fetch ticket count per draw', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch ticket count per draw');
      return [];
    }
  }, []);

  /** Fetch number frequency (hot/cold numbers) */
  const fetchNumberFrequency = useCallback(async (limit: number = 10) => {
    try {
      const data = await jackpotService.getNumberFrequency(limit);
      setNumberFrequency(data);
      return data;
    } catch (err: any) {
      console.error('Failed to fetch number frequency', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch number frequency');
      return null;
    }
  }, []);


  /** Fetch sales summary */
  const fetchSalesSummary = useCallback(async () => {
    try {
      const data = await jackpotService.getSalesSummary();
      setSalesSummary(data);
      return data;
    } catch (err: any) {
      console.error('Failed to fetch sales summary', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch sales summary');
      return null;
    }
  }, []);

  /** Fetch next suggestion */
  const fetchNextSuggestion = useCallback(async (topK: number = 20) => {
    try {
      const data = await jackpotService.getNextSuggestion(topK);
      setNextSuggestion(data);
      return data;
    } catch (err: any) {
      console.error('Failed to fetch next suggestion', err);
      setError(err.response?.data?.detail ?? 'Failed to fetch next suggestion');
      return null;
    }
  }, []);

  // 🔄 Initial fetch + auto polling every minute
  useEffect(() => {
    fetchInitialData();

    const interval = setInterval(async () => {
      const current = await fetchCurrentDraw();

      // ✅ When current draw is completed → refresh latest & schedule next
      if (current && current.status === "completed") {
        console.log("🎉 Draw just completed → refreshing latest & scheduling next");

        await fetchLatestDraw();   // grab the completed one
        await fetchCurrentDraw();  // backend ensures next scheduled
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchInitialData, fetchCurrentDraw, fetchLatestDraw]);


  useEffect(() => {
    if (rules) {
      console.log('🎯 Jackpot rules received:', rules);
      // console.log('📅 Next draw date:', nextDrawDate);
      // console.log('📝 Next draw label:', nextDrawLabel);
    }
  }, [rules]);

  return {
    latestDraw,
    currentDraw,
    rules,
    tickets,
    prizeHistory,
    loading,
    error,
    // nextDrawDate,  // ✅ expose raw Date
    // nextDrawLabel, // ✅ expose formatted string
    ticketCountStats,
    numberFrequency,
    salesSummary,      // ✅ expose sales summary
    nextSuggestion,    // ✅ expose next suggestion
    actions: {
      fetchRules,
      fetchLatestDraw,
      fetchCurrentDraw,
      fetchInitialData,
      fetchUserTickets,
      buyTicket,
      checkTicket,
      createDraw,
      fetchTicketCountByDraw,
      fetchNumberFrequency,
      fetchSalesSummary,   // ✅ expose fetcher
      fetchNextSuggestion, // ✅ expose fetcher
    },
  };
};

