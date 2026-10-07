// src/models/interfaces/Billiard.ts
// Response shapes inferred from the API spec. Money = decimal STRINGS (no float math).

export type TableStatus = 'available' | 'playing' | 'reserved' | 'maintenance';
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
  product_id?: number | null; // null once the product is deleted; row is a snapshot
  variant_id?: number | null;
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: string;
//   line_total: string;
  total_price: string;
}

export interface BillResponse {
  session_id: number;
  table_id: number;
  table_name?: string;
  start_time: string;
  end_time?: string | null; // null/absent => still running
  duration_minutes?: number;
  hourly_rate?: string;
  billing_policy?: string;
  total_table_fee: string;
  total_product_fee: string;
  items: BillItem[];
  grand_total: string;
  currency: string;
  payment_state?: string; // "unpaid" | "paid" | ...
  payment_method?: PaymentMethod | null;
  payment_reference?: string | null;
  paid_at?: string | null;
  opened_by?: string | null;
  stopped_by?: string | null;
  paid_by?: string | null;
  
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