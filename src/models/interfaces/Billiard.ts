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

/** Method shown on a bill: a single method, or `split` when several lines were used. */
export type BillPaymentMethod = PaymentMethod | 'split';
/** Method of one payment line (Stripe cannot be part of a split). */
export type LineMethod = 'cash' | 'bank_transfer';
export type LineStatus = 'pending' | 'completed' | 'cancelled' | 'voided' | 'failed';

/** Present only on a pending bank_transfer line. */
export interface TransferInstruction {
  bank_code: string | null;
  account_no: string | null;
  account_name: string | null;
  amount: string;
  /** e.g. "PAY7L2" - the bank feed matches the payment by this memo. */
  memo: string;
  /** Draw as a QR code; null when no bank account is configured. */
  qr_payload: string | null;
  /** Hosted QR image fallback. */
  qr_image_url: string | null;
  /** Timestamp without offset = UTC. */
  expires_at: string | null;
}

export interface PaymentLine {
  id: number;
  method: LineMethod;
  amount: string;
  status: LineStatus;
  cash_tendered: string | null;
  change_given: string | null;
  payment_reference: string | null;
  note: string | null;
  confirmed_at: string | null;
  voided_at: string | null;
  void_reason: string | null;
  transfer: TransferInstruction | null;
}

/** Body of POST /sessions/{id}/pay for a single method. */
export interface PayOnePayload {
  payment_method: PaymentMethod;
  /** Only with payment_method "cash". Leave out for an exact payment. */
  cash_tendered?: number;
}

export interface SplitLinePayload {
  method: LineMethod;
  amount: number;
  cash_tendered?: number;
  note?: string;
}

/** Body of POST /sessions/{id}/pay for a split: 1-6 lines that add up to balance_due. */
export interface PaySplitPayload {
  payments: SplitLinePayload[];
}

/** Never both shapes at once. */
export type PayPayload = PayOnePayload | PaySplitPayload;

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
  payment_state?: string; // "unpaid" | "pending" | "paid"
  payment_method?: BillPaymentMethod | null;
  payment_reference?: string | null;
  paid_at?: string | null;
  /** Sum of completed payment lines. Absent on responses from older backends. */
  amount_paid?: string;
  /** grand_total - amount_paid. */
  balance_due?: string;
  /** Empty on bills paid before the payment module. */
  payments?: PaymentLine[];
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

// --- Controller status (/billiard/controller/status) ------------------------

/** Status reported for the central controller that accepts table button events. */
export type BilliardControllerStatus = 'online' | 'offline' | 'syncing' | 'error';

/** Manager/admin-only controller health snapshot. Device credentials are never exposed. */
export interface BilliardController {
  device_id: string;
  name: string;
  status: BilliardControllerStatus;
  firmware_version?: string | null;
  last_seen?: string | null;
  /** Highest controller event sequence already applied by the server. */
  last_applied_seq: number;
}

/**
 * Controller registration. Shapes follow the written backend spec;
 * NOT yet verified against /docs (candidate fields beyond device_id are optional).
 */
export interface HydroCandidate {
  device_id: string;
  name?: string | null;
}

export interface ControllerRegisterPayload {
  device_id: string;
  name?: string;
}

/** `api_key` is returned only by register. Show it once; it is never exposed again. */
export interface ControllerRegisterResponse {
  device_id: string;
  name?: string | null;
  api_key: string;
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
  created_at?: string;           // read-only
}

export type PricingRulePayload = Omit<PricingRule, 'id' | 'created_at'>;

export interface PricingQuoteParams {
  table_id: number;
  minutes: number;
  /** Optional. No timezone = club-local time. */
  at?: string;
}

/** GET /billiard/pricing-rules/quote - confirmed against a real response. */
export interface PricingQuote {
  table_id: number;
  minutes: number;
  /** Moment priced, with a UTC offset, e.g. "2026-10-10T14:35:08+07:00". */
  at: string;
  /** Winning rule; null/absent when nothing matched and the table's own rate applies. */
  rule_id?: number | null;
  rule_name?: string | null;
  rule_type?: string | null;
  hourly_rate?: string | null;
  params?: PricingRuleParams | null;
  /** Table fee for `minutes` (decimal string). */
  fee: string;
  currency?: string; // not sent today; falls back to DEFAULT_CURRENCY
}

// --- Game scoring (/sessions/{id}/games, /games/{id}/...) --------------------
// Scoring never touches billing or the session timer.

/** `cancelled` is read-only in the UI. Unknown values must still render. */
export type GameStatus = 'active' | 'completed' | 'cancelled';

export type ScorePlayer = 'A' | 'B';

export interface Game {
  id: number;
  session_id: number;
  game_number: number;
  start_time: string;            // naive UTC (see parseUtc)
  end_time: string | null;
  player_a_score: number;
  player_b_score: number;
  status: GameStatus;
}

export interface ScorePayload {
  player: ScorePlayer;
  delta: number; // -10..10, never 0
}

/** POST /games/{id}/new = finish the current game + start the next one at 0:0. */
export interface NewGameResponse {
  finished: Game;
  started: Game;
}
