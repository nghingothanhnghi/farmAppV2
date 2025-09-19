// src/services/jackpotService.ts

import apiClient from '../api/client';
import type { Draw, Ticket, PrizeResult, TicketCreateInput, JackpotRules, PrizeHistorySummary } from '../models/interfaces/Jackpot';

export const jackpotService = {
  /**
   * Create a new draw
   */
  createDraw: async (): Promise<Draw> => {
    const response = await apiClient.post<Draw>('/jackpot/draw');
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


  getRules: async (): Promise<JackpotRules> => {
    const response = await apiClient.get<JackpotRules>('/jackpot/rules');
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


};
