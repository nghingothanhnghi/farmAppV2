// src/services/bankAccountService.ts
import apiClient from '../api/client';
import type {
  BankAccount,
  BankAccountCreate,
  BankAccountEvent,
  BankAccountRename,
  ParsedBankQr,
} from '../models/interfaces/BankAccount';

export const bankAccountService = {
  /** Any logged-in user of the club. Returns null when no account is saved. */
  async getCurrent(): Promise<BankAccount | null> {
    const res = await apiClient.get<BankAccount | null>('/payments/bank-accounts/current');
    return res.data ?? null;
  },

  /** Manager or admin. Newest first. */
  async list(): Promise<BankAccount[]> {
    const res = await apiClient.get<BankAccount[]>('/payments/bank-accounts');
    return Array.isArray(res.data) ? res.data : [];
  },

  /** Manager or admin. Newest first. */
  async events(): Promise<BankAccountEvent[]> {
    const res = await apiClient.get<BankAccountEvent[]>('/payments/bank-accounts/events');
    return Array.isArray(res.data) ? res.data : [];
  },

  /** Replaces the active account (201); the old one goes to history. */
  async save(data: BankAccountCreate): Promise<BankAccount> {
    const res = await apiClient.post<BankAccount>('/payments/bank-accounts', data);
    return res.data;
  },

  async rename(id: number, data: BankAccountRename): Promise<BankAccount> {
    const res = await apiClient.patch<BankAccount>(`/payments/bank-accounts/${id}`, data);
    return res.data;
  },

  /** Transfers show no QR afterwards until a new account is saved. */
  async deactivate(id: number): Promise<BankAccount> {
    const res = await apiClient.post<BankAccount>(`/payments/bank-accounts/${id}/deactivate`);
    return res.data;
  },

  /**
   * Reads a bank QR picture (PNG/JPG, max 5 MB). Saves nothing.
   * Multipart with one field `file`. Same convention as mediaService: axios 1.x drops the
   * header for FormData in the browser so the boundary is added automatically.
   */
  async parseQr(file: File): Promise<ParsedBankQr> {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<ParsedBankQr>('/payments/bank-accounts/parse-qr', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
