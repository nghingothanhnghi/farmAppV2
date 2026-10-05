// src/models/interfaces/Billiard.ts
// Response shapes inferred from the API spec. Money = decimal STRINGS (no float math).

export type TableStatus = 'available' | 'playing' | 'reserved';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'stripe';

export interface BilliardTable {
  id: number;
  name: string;
  status: TableStatus;
  hourly_rate: string;
}

export interface TableCreate {
  name: string;
  hourly_rate: string;
}

export interface ActiveTable {
  table_id: number;
  table_name?: string;
  session_id: number;
  start_time: string; // UTC ISO
  elapsed_minutes: number;
  current_table_fee: string;
  current_product_fee: string;
  current_total: string;
  currency?: string;
}

export interface SessionStart {
  session_id: number;
  table_id: number;
  start_time: string;
  opened_by: number | string;
}

export interface BillItem {
  id?: number;
  product_id?: number;
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface BillResponse {
  session_id: number;
  table_id: number;
  table_name?: string;
  start_time: string;
  end_time?: string | null; // null/absent => still running
  duration_minutes?: number;
  table_fee: string;
  product_fee?: string;
  items: BillItem[];
  grand_total: string;
  currency: string;
  payment_status?: string; // "paid" once settled
  payment_method?: PaymentMethod | null;
}

export interface PayResponse extends BillResponse {
  gateway?: { client_secret?: string; [key: string]: unknown } | null;
}

export interface AddItemPayload {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export interface UsageRow {
  table_id?: number;
  table_name: string;
  times_played: number;
  total_minutes: number;
  total_revenue: string;
  unpaid_total: string;
}

export interface UsageTotals {
  times_played: number;
  total_minutes: number;
  total_revenue: string;
  unpaid_total: string;
}

export interface UsageReport {
  rows: UsageRow[];
  totals?: UsageTotals | null;
}