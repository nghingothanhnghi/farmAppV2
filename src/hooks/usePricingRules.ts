// src/hooks/usePricingRules.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage, getStatus } from '../utils/billiard';
import type { PricingRule, PricingRulePayload } from '../models/interfaces/Billiard';

export type SaveRuleResult = true | { status?: number; message: string };

const toPayload = (r: PricingRule): PricingRulePayload => ({
  name: r.name,
  rule_type: r.rule_type,
  hourly_rate: r.hourly_rate ?? null,
  params: r.params ?? {},
  table_id: r.table_id ?? null,
  days_of_week: r.days_of_week ?? '',
  start_time: r.start_time ?? null,
  end_time: r.end_time ?? null,
  priority: r.priority,
  is_active: r.is_active,
});

/** Pricing rules list + writes. Writes are ADMIN/MANAGER only on the server (403 otherwise). */
export function usePricingRules() {
  const { setAlert } = useAlert();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const guard = useRef(false); // one write at a time

  const fetchRules = useCallback(async () => {
    try {
      setRules(await billiardService.getPricingRules());
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load pricing rules'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function write<T>(fn: () => Promise<T>, okMessage: string, failMessage: string) {
    if (guard.current) return { ok: false as const, message: '' };
    guard.current = true;
    setSaving(true);
    try {
      await fn();
      setAlert({ type: 'success', message: okMessage });
      await fetchRules();
      return { ok: true as const };
    } catch (err) {
      const status = getStatus(err);
      const message =
        status === 403
          ? 'Only admins and managers can change pricing rules.'
          : billiardErrorMessage(err, failMessage);
      if (status === 404) fetchRules(); // rule was removed elsewhere -> list is stale
      return { ok: false as const, status, message };
    } finally {
      guard.current = false;
      setSaving(false);
    }
  }

  /** `id` null = create. Errors are returned (shown in the form) rather than alerted. */
  const saveRule = async (id: number | null, payload: PricingRulePayload): Promise<SaveRuleResult> => {
    const r = await write(
      () => (id == null ? billiardService.createPricingRule(payload) : billiardService.updatePricingRule(id, payload)),
      id == null ? 'Pricing rule created.' : 'Pricing rule updated.',
      'Failed to save pricing rule'
    );
    return r.ok ? true : { status: r.status, message: r.message };
  };

  const toggleActive = async (rule: PricingRule): Promise<boolean> => {
    const r = await write(
      () => billiardService.updatePricingRule(rule.id, { ...toPayload(rule), is_active: !rule.is_active }),
      rule.is_active ? 'Rule deactivated.' : 'Rule activated.',
      'Failed to update rule'
    );
    if (!r.ok && r.message) setAlert({ type: 'error', message: r.message });
    return r.ok;
  };

  const deleteRule = async (id: number): Promise<boolean> => {
    const r = await write(
      () => billiardService.deletePricingRule(id),
      'Pricing rule deleted. Existing bills are unchanged.',
      'Failed to delete rule'
    );
    if (!r.ok && r.message) setAlert({ type: 'error', message: r.message });
    return r.ok;
  };

  return { rules, loading, error, saving, actions: { fetchRules, saveRule, toggleActive, deleteRule } };
}
