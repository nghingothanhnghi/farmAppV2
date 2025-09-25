// src/hooks/useJackpot.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { jackpotService } from '../services/jackpotService';
import type { Draw, DrawCreateInput, Ticket, PrizeResult, TicketCreateInput, JackpotRules, PrizeHistorySummary, TicketCountStat, NumberFrequencyStat } from '../models/interfaces/Jackpot';
export const useJackpot = () => {
  const [rules, setRules] = useState<JackpotRules | null>(null);
  const [latestDraw, setLatestDraw] = useState<Draw | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [prizeHistory, setPrizeHistory] = useState<PrizeHistorySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketCountStats, setTicketCountStats] = useState<TicketCountStat[]>([]);
  const [numberFrequency, setNumberFrequency] = useState<NumberFrequencyStat | null>(null);
  /**
   * Fetch Jackpot Rules
   */
  const fetchRules = useCallback(async () => {
    const data = await jackpotService.getRules();
    setRules(data);
    return data;
  }, []);

  /**
   * Fetch the latest draw, auto-create one if not found
   */
  const fetchLatestDraw = useCallback(async () => {
    let draw: Draw | null = null;
    try {
      draw = await jackpotService.getLatestDraw();
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('No draws found — creating first draw...');
        draw = await jackpotService.createDraw({ draw_type: "auto" });
      } else {
        throw err;
      }
    }
    setLatestDraw(draw);
    return draw;
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

      await Promise.all([fetchRules(), fetchLatestDraw(), fetchPrizeHistory()]);
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
      const newTicket = await jackpotService.buyTicket(ticketInput);

      // ✅ Optimistically update tickets state instead of refetching all
      setTickets(prev => [...prev, newTicket]);

      return newTicket;
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to buy ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
   * ✅ NEW: Create a draw (manual, auto, or smart_auto)
   */
 const createDraw = useCallback(
  async (input: DrawCreateInput): Promise<Draw | null> => {
    try {
      setLoading(true);
      const newDraw = await jackpotService.createDraw(input);
      setLatestDraw(newDraw);
      return newDraw;
    } catch (err: any) {
      console.error('Failed to create draw', err);
      setError(err.response?.data?.detail ?? 'Failed to create draw');
      return null;
    } finally {
      setLoading(false);
    }
  },
  []
);



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

  /**
   * ✅ Derived: Calculate next draw date based on rules.draw_days + rules.draw_time
   */
  const nextDrawDate = useMemo(() => {
    if (!rules?.draw_days || !rules?.draw_time) return null;

    const today = new Date();
    const todayDay = today.getDay(); // 0=Sun,1=Mon,...
    const [hour, minute] = rules.draw_time.split(':').map(Number);

    // Normalize draw_days to numbers 0-6 (support English day names from backend)
    const englishMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const drawDays = rules.draw_days
      .map(d => englishMap[d.toLowerCase()])
      .filter(d => d !== undefined)
      .sort();

    if (drawDays.length === 0) return null;

    let candidate: Date | null = null;
    for (let i = 0; i <= 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      nextDate.setHours(hour, minute, 0, 0);

      if (drawDays.includes(nextDate.getDay()) && nextDate > today) {
        candidate = nextDate;
        break;
      }
    }

    // If no match found in next 7 days, just pick first draw day next week
    if (!candidate) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + ((7 - todayDay) % 7) + drawDays[0]);
      nextDate.setHours(hour, minute, 0, 0);
      candidate = nextDate;
    }

    return candidate;
  }, [rules]);

  const nextDrawLabel = useMemo(() => {
    if (!nextDrawDate) return null;
    return nextDrawDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [nextDrawDate]);

  // 🔄 Initial fetch + auto polling every minute
  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchLatestDraw, 60_000); // poll every 60s
    return () => clearInterval(interval);
  }, [fetchInitialData, fetchLatestDraw]);

  useEffect(() => {
    if (rules) {
      console.log('🎯 Jackpot rules received:', rules);
      console.log('📅 Next draw date:', nextDrawDate);
      console.log('📝 Next draw label:', nextDrawLabel);
    }
  }, [rules, nextDrawDate, nextDrawLabel]);

  return {
    latestDraw,
    rules,
    tickets,
    prizeHistory,
    loading,
    error,
    nextDrawDate,  // ✅ expose raw Date
    nextDrawLabel, // ✅ expose formatted string
    ticketCountStats,
    numberFrequency,
    actions: {
      fetchRules,
      fetchLatestDraw,
      fetchInitialData,
      fetchUserTickets,
      buyTicket,
      checkTicket,
      createDraw,
      fetchTicketCountByDraw,
      fetchNumberFrequency,
    },
  };
};

