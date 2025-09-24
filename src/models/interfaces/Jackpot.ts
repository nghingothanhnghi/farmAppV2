// src/models/interfaces/Jackpot.ts

export type DrawType = "auto" | "manual" | "smart_auto";
export type DrawStatus = "pending" | "completed" | "cancelled";


export interface Draw {
  id: number;
  draw_date: string;
  numbers: number[];
  bonus_number: number;
  draw_type: DrawType;   // ✅ strongly typed instead of string
  status: DrawStatus;
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
export interface PrizeHistorySummary {
  totalJackpot1: number;
  totalJackpot2: number;
  totalFirst: number;
  totalSecond: number;
  totalThird: number;
  totalPrizeValue: number; // sum of all prizes
  probabilities?: PrizeProbabilities;
}
