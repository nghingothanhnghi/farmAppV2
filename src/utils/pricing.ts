// src/utils/pricing.ts
// Labels and text helpers for pricing rules / billing policies. Pure functions, no i18n dependency
// so they also work inside the receipt HTML.
import type {
  BillResponse,
  DayOfWeek,
  PricingParams,
  PricingRule,
  PricingRuleParams,
} from '../models/interfaces/Billiard';
import { DAYS_OF_WEEK } from '../models/interfaces/Billiard';

const humanize = (v: string) => {
  const s = v.replace(/_/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

const POLICY_LABELS: Record<string, string> = {
  per_minute: 'Per minute',
  hourly: 'Hourly',
  block: 'Time blocks',
  minimum_hour: 'Minimum charge',
  rounded_hour: 'Rounded hour (legacy)',
};

/** Readable label for any billing_policy / rule_type; unknown values are humanized, never hidden. */
export const getBillingPolicyLabel = (policy?: string | null): string =>
  policy ? POLICY_LABELS[policy] ?? humanize(policy) : '';

const positiveInt = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

/** "30-minute blocks", "60-minute minimum". Empty string when there is nothing to say. */
export const describePricingParams = (params?: PricingParams | PricingRuleParams | null): string => {
  if (!params || typeof params !== 'object') return '';
  const parts: string[] = [];
  const block = positiveInt(params.block_minutes);
  const min = positiveInt(params.min_minutes);
  if (block) parts.push(`${block}-minute blocks`);
  if (min) parts.push(`${min}-minute minimum`);
  return parts.join(', ');
};

export interface PricingSummary {
  rate: string | null;        // raw decimal string; format at the call site
  ruleName: string | null;
  policyLabel: string;        // '' when unknown
  paramsText: string;         // '' when none
}

/** Everything the bill / receipt shows about how the table fee was priced. All parts may be empty. */
export const getPricingSummary = (
  bill: Pick<BillResponse, 'hourly_rate' | 'billing_policy' | 'pricing_rule_name' | 'pricing_params'>
): PricingSummary => ({
  rate: bill.hourly_rate != null && bill.hourly_rate !== '' ? String(bill.hourly_rate) : null,
  ruleName: bill.pricing_rule_name?.trim() || null,
  policyLabel: getBillingPolicyLabel(bill.billing_policy),
  paramsText: describePricingParams(bill.pricing_params),
});

// --- Rule list helpers -------------------------------------------------------

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

export const dayLabel = (d: DayOfWeek) => DAY_LABELS[d];

/** "mon, Tue ,xx" -> ['mon','tue'] (unknown tokens dropped, canonical order). */
export const parseDays = (raw?: string | null): DayOfWeek[] => {
  const set = new Set(
    (raw ?? '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
  );
  return DAYS_OF_WEEK.filter((d) => set.has(d));
};

export const serializeDays = (days: DayOfWeek[]): string =>
  DAYS_OF_WEEK.filter((d) => days.includes(d)).join(',');

export const describeDays = (raw?: string | null): string => {
  const days = parseDays(raw);
  return days.length === 0 || days.length === 7 ? 'Every day' : days.map(dayLabel).join(', ');
};

/** "18:00:00" -> "18:00" (works for both HH:MM and HH:MM:SS). */
export const toHHMM = (t?: string | null): string => (t ? t.slice(0, 5) : '');

export const describeWindow = (rule: Pick<PricingRule, 'start_time' | 'end_time'>): string => {
  const s = toHHMM(rule.start_time);
  const e = toHHMM(rule.end_time);
  if (!s || !e) return 'All day';
  return e < s ? `${s} – ${e} (overnight)` : `${s} – ${e}`;
};
