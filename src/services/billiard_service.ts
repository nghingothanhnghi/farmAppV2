// src/components/billiard/services/billiard_service.ts
// Uses the shared axios client (Bearer token + 401 handling already wired).
import apiClient from '../api/client';
import type {
  ActiveTable,
  AddItemPayload,
  BilliardTable,
  BillResponse,
  PayResponse,
  PaymentMethod,
  SessionStart,
  TableCreate,
  UsageReport,
} from '../models/interfaces/Billiard';

export const billiardService = {
  // --- Tables ---
  async createTable(data: TableCreate): Promise<BilliardTable> {
    const res = await apiClient.post('/tables', data);
    return res.data;
  },

  async getTables(): Promise<BilliardTable[]> {
    const res = await apiClient.get('/tables');
    return Array.isArray(res.data) ? res.data : [];
  },

  async getActiveTables(): Promise<ActiveTable[]> {
    const res = await apiClient.get('/tables/active');
    const list: any[] = Array.isArray(res.data) ? res.data : [];
    return list.map((r) => ({
      ...r,
      table_id: r.table_id ?? r.id,
      table_name: r.table_name ?? r.name,
    }));
  },

  async startTable(tableId: number): Promise<SessionStart> {
    const res = await apiClient.post(`/tables/${tableId}/start`);
    return res.data;
  },

  // --- Sessions ---
  async getSession(sessionId: number): Promise<BillResponse> {
    const res = await apiClient.get(`/sessions/${sessionId}`);
    return res.data;
  },

  async addItem(sessionId: number, payload: AddItemPayload) {
    const res = await apiClient.post(`/sessions/${sessionId}/items`, payload);
    return res.data;
  },

  async stopSession(sessionId: number): Promise<BillResponse> {
    const res = await apiClient.post(`/sessions/${sessionId}/stop`);
    return res.data;
  },

  // Only the method is sent - the backend always charges its own grand_total.
  async paySession(sessionId: number, method: PaymentMethod): Promise<PayResponse> {
    const res = await apiClient.post(`/sessions/${sessionId}/pay`, { payment_method: method });
    return res.data;
  },

  async confirmPayment(sessionId: number): Promise<BillResponse> {
    const res = await apiClient.post(`/sessions/${sessionId}/pay/confirm`);
    return res.data;
  },

  // --- Reports ---
  async getUsageReport(startDate: string, endDate: string): Promise<UsageReport> {
    const res = await apiClient.get('/reports/tables/usage', {
      params: { start_date: startDate, end_date: endDate },
    });
    const d = res.data;
    if (Array.isArray(d)) return { rows: d };
    return { rows: d?.rows ?? d?.items ?? d?.results ?? [], totals: d?.totals ?? null };
  },
};
