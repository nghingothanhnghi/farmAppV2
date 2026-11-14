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

/** GET /payments/bank-feed/pending-lines (manager only): a transfer line still waiting for money. */
export interface PendingTransferLine {
  line_id: number;
  order_id: number;
  source_type: string; // "billiard_session"
  /** The session id for billiard. */
  source_id: string;
  amount: string;
  order_total: string;
  transfer_memo: string | null;
  created_at: string;
  expires_at: string | null;
  expired: boolean;
}

/** Page size for the bank inbox and the assign picker (server allows 1 to 200, default 50). */
export const BANK_FEED_PAGE_SIZE = 50;
