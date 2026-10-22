// src/services/shiftService.ts
import apiClient from '../api/client';
import type {
  CloseShiftPayload,
  MovementPayload,
  OpenShiftPayload,
  Shift,
  ShiftSummary,
} from '../models/interfaces/CashDrawer';

export const shiftService = {
  /** `null` when no shift is open. */
  async getCurrent(): Promise<ShiftSummary | null> {
    const res = await apiClient.get<ShiftSummary | null>('/payments/shifts/current');
    return res.data ?? null;
  },

  async list(limit = 30, offset = 0): Promise<Shift[]> {
    const res = await apiClient.get<Shift[]>('/payments/shifts', { params: { limit, offset } });
    return res.data;
  },

  async get(id: number): Promise<ShiftSummary> {
    const res = await apiClient.get<ShiftSummary>(`/payments/shifts/${id}`);
    return res.data;
  },

  async open(payload: OpenShiftPayload): Promise<ShiftSummary> {
    const res = await apiClient.post<ShiftSummary>('/payments/shifts/open', payload);
    return res.data;
  },

  async moveCash(id: number, payload: MovementPayload): Promise<ShiftSummary> {
    const res = await apiClient.post<ShiftSummary>(`/payments/shifts/${id}/movements`, payload);
    return res.data;
  },

  async close(id: number, payload: CloseShiftPayload): Promise<ShiftSummary> {
    const res = await apiClient.post<ShiftSummary>(`/payments/shifts/${id}/close`, payload);
    return res.data;
  },
};
