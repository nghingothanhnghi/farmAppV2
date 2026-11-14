// src/services/bankFeedService.ts
import apiClient from '../api/client';
import { BANK_FEED_PAGE_SIZE } from '../models/interfaces/BankFeed';
import type { BankTransaction, BankTxStatus, PendingTransferLine } from '../models/interfaces/BankFeed';

export const bankFeedService = {
  /** Paged: `limit` 1 to 200 (server default 50), `offset` skips rows. */
  async list(status?: BankTxStatus, limit = BANK_FEED_PAGE_SIZE, offset = 0): Promise<BankTransaction[]> {
    const res = await apiClient.get<BankTransaction[]>('/payments/bank-feed/transactions', {
      params: { limit, offset, ...(status ? { status } : {}) },
    });
    return res.data;
  },

  /**
   * Manager only: transfer lines still waiting for money, newest first. Pass `amount` to list only
   * lines of exactly that amount (what "Assign" needs). Paged like the transaction list.
   */
  async pendingLines(amount?: string | number, limit = BANK_FEED_PAGE_SIZE, offset = 0): Promise<PendingTransferLine[]> {
    const res = await apiClient.get<PendingTransferLine[]>('/payments/bank-feed/pending-lines', {
      params: { limit, offset, ...(amount !== undefined && amount !== '' ? { amount } : {}) },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  /** Links the money to a waiting transfer line. The amounts must be equal. */
  async assign(txId: number, lineId: number): Promise<BankTransaction> {
    const res = await apiClient.post<BankTransaction>(
      `/payments/bank-feed/transactions/${txId}/assign`,
      { line_id: lineId }
    );
    return res.data;
  },

  async ignore(txId: number, note?: string): Promise<BankTransaction> {
    const res = await apiClient.post<BankTransaction>(
      `/payments/bank-feed/transactions/${txId}/ignore`,
      note ? { note } : undefined
    );
    return res.data;
  },
};
