// src/models/interfaces/BankAccount.ts
// Club receiving bank account (/payments/bank-accounts...). The transfer QR is built from it.

/** GET /payments/bank-accounts/current (or null when the club has none). */
export interface BankAccount {
  id: number;
  client_id: number;
  /** 6 digits. */
  bank_bin: string;
  /** e.g. "VCB". Can be null while the QR still works (the club saved only the BIN). */
  bank_code: string | null;
  account_no: string;
  account_name: string;
  is_active: boolean;
  created_at: string;
}

/** POST /payments/bank-accounts. Replaces the active account; the old one goes to history. */
export interface BankAccountCreate {
  bank_bin: string; // exactly 6 digits
  account_no: string; // 4 to 32 letters or digits
  account_name: string; // 2 to 100 characters
  bank_code?: string | null; // max 20
}

/** PATCH /payments/bank-accounts/{id}. Bank and account number cannot be edited. */
export interface BankAccountRename {
  account_name: string;
  bank_code?: string | null;
}

/** POST /payments/bank-accounts/parse-qr. Nothing is saved: prefill the form with it. */
export interface ParsedBankQr {
  bank_bin: string;
  account_no: string;
  /** Only when the picture was a payment QR; ignore it. */
  amount: number | null;
  memo: string | null;
}

export type BankAccountEventType =
  | 'account_created'
  | 'account_replaced'
  | 'account_renamed'
  | 'account_deactivated';

/** GET /payments/bank-accounts/events (managers). */
export interface BankAccountEvent {
  id: number;
  account_id: number | null;
  event_type: BankAccountEventType | (string & {});
  actor_id: number | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

/** QR image upload limit enforced by the server (413 above it). */
export const BANK_QR_MAX_BYTES = 5 * 1024 * 1024;
export const BANK_QR_ACCEPT = 'image/png,image/jpeg';
