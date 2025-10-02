// src/models/interfaces/Jackpot.ts

export type DrawType = "automatic" | "manual" | "smart_auto";
export type DrawStatus = "scheduled" | "completed" | "cancelled";


export interface Draw {
  id: number;
  draw_date: string;
  numbers: number[];
  bonus_number?: number | null;
  draw_type: DrawType;   // ✅ strongly typed instead of string
  status: DrawStatus;
  current_jackpot1: number; // 💡 missing
  current_jackpot2: number; // 💡 missing
}

export interface DrawCreateInput {
  draw_date?: string;   // allow manual selection of draw date
  numbers?: number[];
  bonus_number?: number;
  draw_type?: DrawType; // defaults to auto
}


export type PlayType = "basic" | "bao5" | "bao7" | "bao8" | "bao9";

export interface Ticket {
  id: number;
  user_id: number;
  numbers: number[];
  play_type: PlayType;
  draw_id: number;
  result?: PrizeResult;
}

export interface PrizeResult {
  id: number;
  ticket_id: number;
  category: string;
  prize_value: number;
}

export interface TicketCreateInput {
  user_id: number;
  numbers: number[];
  play_type: PlayType;
  draw_id: number;
}

export interface JackpotRules {
  min_price: number;
  number_range: number[];
  jackpot1_min: number;
  jackpot2_min: number;
  draw_days: string[];
  draw_time: string;
}

export interface PrizeProbabilities {
  jackpot: number;
  five_plus_bonus: number;
  four_numbers: number;
  three_numbers: number;
}
export interface PrizeCategory {
  count: number;
  value: number;
}

export interface PrizeTotals {
  winners: number;
  value: number;
}

export interface PrizeHistorySummary {
  // --- old flat keys (backward compatibility) ---
  totalJackpot1: number;
  totalJackpot2: number;
  totalFirst: number;
  totalSecond: number;
  totalThird: number;
  totalPrizeValue: number;

  // --- new nested objects ---
  Jackpot1: PrizeCategory;
  Jackpot2: PrizeCategory;
  First: PrizeCategory;
  Second: PrizeCategory;
  Third: PrizeCategory;

  totals: PrizeTotals;

  probabilities?: PrizeProbabilities;
}

/**
 * Analytics: Ticket count per draw
 */
export interface TicketCountStat {
  draw_id: number;
  draw_date: string; // ISO string (UTC)
  ticket_count: number;
}

/**
 * Analytics: Hot/Cold number frequency
 */
export interface NumberFrequency {
  number: number;
  count: number;
}

export interface NumberFrequencyStat {
  hot_numbers: NumberFrequency[];
  cold_numbers: NumberFrequency[];
}

export interface SalesSummaryResponse {
  total_tickets: number;
  unit_price: number;
  total_revenue: number;
}

export interface NextSuggestionResponse {
  suggested_numbers: number[];
  strategy: string;
}
