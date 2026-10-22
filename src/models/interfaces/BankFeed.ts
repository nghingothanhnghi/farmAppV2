// src/models/interfaces/BankFeed.ts
// Bank inbox (/payments/bank-feed/transactions...). Manager or admin only.

export type BankTxStatus = 'matched' | 'unmatched' | 'needs_review' | 'ignored';

export interface BankTransaction {
  id: number;
  provider: string; // "sepay"
  external_id: string;
  gateway: string | null; // bank name
  account_number: string | null;
  transfer_type: string | null; // "in" | "out"
  amount: string;
  /** The transfer note as the bank sent it. */
  content: string | null;
  code: string | null;
  reference_code: string | null;
  transaction_date: string | null;
  status: BankTxStatus;
  /** Why it needs review or is unmatched. */
  reason: string | null;
  order_id: number | null;
  line_id: number | null;
  handled_by_id: number | null;
  handled_at: string | null;
  note: string | null;
  created_at: string;
}
