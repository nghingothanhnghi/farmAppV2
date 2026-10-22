// src/services/bankFeedService.ts
import apiClient from '../api/client';
import type { BankTransaction, BankTxStatus } from '../models/interfaces/BankFeed';

export const bankFeedService = {
  async list(status?: BankTxStatus): Promise<BankTransaction[]> {
    const res = await apiClient.get<BankTransaction[]>('/payments/bank-feed/transactions', {
      params: status ? { status } : {},
    });
    return res.data;
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
