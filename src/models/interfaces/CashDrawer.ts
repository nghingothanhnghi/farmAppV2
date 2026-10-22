// src/models/interfaces/CashDrawer.ts
// Shifts (/payments/shifts...). Money = decimal STRINGS ("1000000.00"); VND has no decimals.

export interface Shift {
  id: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
  opening_float: string;
  /** Frozen at close; the live value is in ShiftSummary. */
  expected_cash: string | null;
  counted_cash: string | null;
  /** counted - expected; negative = cash is missing. */
  variance: string | null;
  note: string | null;
  close_note: string | null;
  opened_by: string | null;
  closed_by: string | null;
}

export interface MethodTotals {
  method: string;
  received_count: number;
  received_total: string;
  voided_total: string;
  net_total: string;
}

export interface CashMovement {
  id: number;
  type: 'pay_in' | 'pay_out';
  amount: string;
  reason: string;
  created_by: string | null;
  created_at: string;
}

/** open, /current, /{id}, /movements and /close all return this. */
export interface ShiftSummary extends Shift {
  cash_sales: string;
  cash_voids: string;
  pay_ins: string;
  pay_outs: string;
  /** Informational: already netted out of cash_sales. */
  change_given: string;
  payments_count: number;
  methods: MethodTotals[];
  movements: CashMovement[];
}

export interface OpenShiftPayload {
  opening_float?: number; // >= 0
  note?: string;
}

export interface MovementPayload {
  type: 'pay_in' | 'pay_out';
  amount: number;
  reason: string; // 3 to 255 characters
}

export interface CloseShiftPayload {
  counted_cash: number; // >= 0
  note?: string;
}
