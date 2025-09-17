// src/services/paymentService.ts
import apiClient from "../api/client";
import type { PaymentOut, PaymentCreate, PaymentUpdate, StripePaymentCreate, StripePaymentResponse } from "../models/interfaces/Payment";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedPayments {
  results: PaymentOut[];
  total: number;
}

export const paymentService = {
  // ─────────────────────────────
  // 🟢 CRUD for Payments
  // ─────────────────────────────
  async createPayment(payload: PaymentCreate): Promise<PaymentOut> {
    const response = await apiClient.post<PaymentOut>("/payments", payload);
    return response.data;
  },

  async updatePayment(paymentId: number, payload: PaymentUpdate): Promise<PaymentOut> {
    const response = await apiClient.patch<PaymentOut>(`/payments/${paymentId}`, payload);
    return response.data;
  },

  async getPaymentsByClient(clientId: string, filters?: Record<string, unknown>): Promise<PaymentOut[]> {
    const response = await apiClient.get<PaymentOut[]>(`/payments/client/${clientId}`, {
      params: filters ?? {},
    });
    return response.data;
  },

    async getAllPayments(filters?: Record<string, unknown>): Promise<PaginatedPayments> {
    const response = await apiClient.get<PaginatedPayments>("/payments", {
      params: filters ?? {},
    });
    return response.data;
  },

  async getPaymentsByUser(userId: number, filters?: Record<string, unknown>): Promise<PaymentOut[]> {
    const response = await apiClient.get<PaymentOut[]>(`/payments/user/${userId}`, {
      params: filters ?? {},
    });
    return response.data;
  },

  // ─────────────────────────────
  // 🟦 Stripe-specific Endpoints
  // ─────────────────────────────
  async createStripePayment(payload: StripePaymentCreate): Promise<StripePaymentResponse> {
    const response = await apiClient.post<StripePaymentResponse>("/payments/stripe/create", payload);
    return response.data;
  },

  async confirmStripePayment(referenceId: string): Promise<PaymentOut> {
    const response = await apiClient.post<PaymentOut>(`/payments/stripe/confirm/${referenceId}`);
    return response.data;
  },

  async refundStripePayment(referenceId: string, amount?: number): Promise<PaymentOut> {
    const response = await apiClient.post<PaymentOut>(`/payments/stripe/refund/${referenceId}`, null, {
      params: amount ? { amount } : {},
    });
    return response.data;
  },
};
