// src/services/jackpotService.ts

import apiClient from '../api/client';
import type { Draw, DrawCreateInput, Ticket, PrizeResult, TicketCreateInput, JackpotRules, PrizeHistorySummary, TicketCountStat, NumberFrequencyStat, SalesSummaryResponse,
  NextSuggestionResponse } from '../models/interfaces/Jackpot';

export const jackpotService = {
  /**
   * Create a new draw
   */
  createDraw: async (input: DrawCreateInput): Promise<Draw> => {
    const payload: any = {
      draw_type: input.draw_type ?? 'automatic',
    };

    if (input.draw_date) payload.draw_date = input.draw_date;
    if (input.draw_type === 'manual') {
      payload.numbers = input.numbers;
      payload.bonus_number = input.bonus_number;
    }

    const response = await apiClient.post<Draw>('/jackpot/draw', payload);
    return response.data;
  },

  /**
   * Buy a ticket for the latest draw
   */
  buyTicket: async (ticket: TicketCreateInput): Promise<Ticket> => {
    const response = await apiClient.post<Ticket>('/jackpot/ticket', ticket);
    return response.data;
  },

  /**
   * Check the result of a ticket by ID
   */
  checkTicket: async (ticketId: number): Promise<PrizeResult> => {
    const response = await apiClient.get<PrizeResult>(`/jackpot/ticket/${ticketId}/check`);
    return response.data;
  },

  /**
   * Get the latest draw (most recent draw date and numbers)
   */
  getLatestDraw: async (): Promise<Draw> => {
    const response = await apiClient.get<Draw>('/jackpot/draw/latest');
    return response.data;
  },

    /**
   * Get the current scheduled/active draw (creates one if none exists)
   */
  getCurrentDraw: async (): Promise<Draw> => {
    const response = await apiClient.get<Draw>('/jackpot/draw/current');
    return response.data;
  },


  getRules: async (): Promise<JackpotRules> => {
    const response = await apiClient.get<JackpotRules>('/jackpot/rules');
    return response.data;
  },

  /**
   * Get all tickets for a specific user
   */
  getTicketsByUser: async (userId: number): Promise<Ticket[]> => {
    const response = await apiClient.get<Ticket[]>(`/jackpot/tickets/user/${userId}`);
    return response.data;
  },

  /**
   * Get aggregated prize statistics for a given range (month, quarter, year)
   */
  getPrizeHistory: async (
    range: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<PrizeHistorySummary> => {
    const response = await apiClient.get<PrizeHistorySummary>(
      `/jackpot/prizes/history?range=${range}`
    );
    return response.data;
  },

    /**
   * Get ticket count per draw
   */
  getTicketCountByDraw: async (): Promise<TicketCountStat[]> => {
    const res = await apiClient.get(`/jackpot/analytics/ticket-count`);
    return res.data;
  },

  /**
   * Get number frequency (hot/cold numbers)
   */
  getNumberFrequency: async (limit: number = 10): Promise<NumberFrequencyStat> => {
    const res = await apiClient.get(`/jackpot/analytics/number-frequency`, {
      params: { limit },
    });
    return res.data;
  },

  /**
   * Get sales summary (total tickets, revenue)
   */
  getSalesSummary: async (): Promise<SalesSummaryResponse> => {
    const res = await apiClient.get(`/jackpot/analytics/sales-summary`);
    return res.data;
  },

  /**
   * Suggest next numbers for the draw
   */
  getNextSuggestion: async (topK: number = 20): Promise<NextSuggestionResponse> => {
    const res = await apiClient.get(`/jackpot/analytics/next-suggestion`, {
      params: { top_k: topK },
    });
    return res.data;
  },

};
