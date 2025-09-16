// src/models/interfaces/Payment.ts
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface PaymentOut {
  id: number;
  user_id: number;
  client_id: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference_id: string;
  extra_metadata?: Record<string, any> | null;
  created_at: string; // ISO string from backend
  updated_at?: string | null;
}

export interface PaymentCreate {
  user_id: number;
  client_id: string;
  provider: string;
  amount: number;
  currency?: string; // defaults to "VND"
  reference_id: string;
  extra_metadata?: Record<string, any>;
}

export interface PaymentUpdate {
  status: PaymentStatus;
  extra_metadata?: Record<string, any>;
}

// ─────────────────────────────
// Stripe-specific Types
// ─────────────────────────────
export interface StripePaymentCreate {
  user_id: number;
  client_id: string;
  amount: number;
  currency?: string; // defaults to "usd" on backend
  extra_metadata?: Record<string, any>;
}

export interface StripeIntent {
  id: string;
  client_secret: string;
  status: string;
  amount: number;
  currency: string;
  [key: string]: any; // allow Stripe extra fields
}

export interface StripePaymentResponse {
  payment: PaymentOut;
  stripe: StripeIntent;
}
