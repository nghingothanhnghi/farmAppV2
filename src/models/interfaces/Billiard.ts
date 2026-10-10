// src/models/interfaces/Billiard.ts
// Response shapes inferred from the API spec. Money = decimal STRINGS (no float math).

export type TableStatus = 'available' | 'playing' | 'reserved' | 'maintenance';

// for purpose filtering by group
export const TABLE_STATUSES: TableStatus[] = [
  'available',
  'playing',
  'reserved',
  'maintenance',
];

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
  table_id: number;      // mapped from `id`
  table_name?: string;   // mapped from `name`
  session_id: number;
  start_time: string; // UTC ISO
  elapsed_minutes: number;
  /** Rate of the pricing rule frozen at session start (may differ from the table's own rate). */
  hourly_rate?: string;
  /** Not exposed by the backend yet - rendered only when present. */
  pricing_rule_name?: string | null;
  current_table_fee: string;
  current_product_fee: string;
  current_total: string;
  currency?: string; // not sent; falls back to DEFAULT_CURRENCY
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
  quantity: number;
  unit_price: string;
  total_price: string;
}

/** Known billing policies. Old bills may carry `rounded_hour`; unknown values must still render. */
export type BillingPolicy = 'per_minute' | 'hourly' | 'block' | 'minimum_hour' | 'rounded_hour';

/** Params frozen with the session. Both keys are optional; the object may be empty or null. */
export type PricingParams = {
  block_minutes?: number;
  min_minutes?: number;
  [key: string]: unknown;
};

export type BillState = 'active' | 'stopped' | 'pending' | 'paid';

export interface BillResponse {
  session_id: number;
  table_id: number;
  table_name?: string;
  start_time: string;
  end_time?: string | null; // null/absent => still running
  duration_minutes?: number;
  /** Rate of the rule picked at session start - NOT necessarily the table's own rate. */
  hourly_rate?: string;
  /** BillingPolicy, but typed loosely so an unexpected value never breaks the UI. */
  billing_policy?: BillingPolicy | (string & {});
  /** e.g. "Happy hour". null = no rule matched, or session older than pricing rules. */
  pricing_rule_name?: string | null;
  /** e.g. {"block_minutes": 30}. {} or null when none. */
  pricing_params?: PricingParams | null;
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

// --- Pricing rules (/billiard/pricing-rules) ---------------------------------
// Shapes follow the written backend spec; NOT yet verified against /docs.

export type PricingRuleType = 'per_minute' | 'hourly' | 'block' | 'minimum_hour';

export const PRICING_RULE_TYPES: PricingRuleType[] = ['per_minute', 'hourly', 'block', 'minimum_hour'];

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const DAYS_OF_WEEK: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export interface PricingRuleParams {
  block_minutes?: number; // rule_type = block, 1..1440
  min_minutes?: number;   // rule_type = minimum_hour, 1..1440
}

export interface PricingRule {
  id: number;
  name: string;
  rule_type: PricingRuleType;
  hourly_rate?: string | null;   // overrides the table's rate when set
  params?: PricingRuleParams | null;
  table_id?: number | null;      // null/empty = all tables
  days_of_week?: string | null;  // "mon,tue" or empty = every day
  start_time?: string | null;    // club-local; sent together with end_time
  end_time?: string | null;      // end < start = overnight window
  priority: number;              // 0..1000, higher wins
  is_active: boolean;
}

export type PricingRulePayload = Omit<PricingRule, 'id'>;

export interface PricingQuoteParams {
  table_id: number;
  minutes: number;
  /** Optional. No timezone = club-local time. */
  at?: string;
}

/**
 * Quote response. The exact field names are unconfirmed, so everything is optional
 * and the UI falls back to listing whatever came back.
 */
export interface PricingQuote {
  table_id?: number;
  minutes?: number;
  hourly_rate?: string;
  billing_policy?: string;
  pricing_rule_name?: string | null;
  pricing_params?: PricingParams | null;
  total_table_fee?: string;
  currency?: string;
  [key: string]: unknown;
}
