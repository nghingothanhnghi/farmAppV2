// src/components/billiard/components/PricingQuotePanel.tsx
// "Preview price": calls GET /billiard/pricing-rules/quote. Writes nothing.
import React, { useState } from 'react';
import Button from '../../common/Button';
import { FormGroup, FormInput, FormLabel, FormSelect } from '../../common/Form';
import { billiardService } from '../../../services/billiard_service';
import { DEFAULT_CURRENCY, billiardErrorMessage, formatDateTime, formatMoneyString } from '../../../utils/billiard';
import { describePricingParams, getBillingPolicyLabel } from '../../../utils/pricing';
import type { BilliardTable, PricingQuote } from '../../../models/interfaces/Billiard';

interface Props {
  tables: BilliardTable[];
}

const Row: React.FC<{ label: string; value: React.ReactNode; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <span className={bold ? 'text-base font-bold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-100'}>
      {value}
    </span>
  </div>
);

const PricingQuotePanel: React.FC<Props> = ({ tables }) => {
  const [tableId, setTableId] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [at, setAt] = useState(''); // datetime-local, no timezone = club-local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<PricingQuote | null>(null);

  const run = async () => {
    const tid = Number(tableId);
    if (!tableId || !Number.isFinite(tid)) return setError('Choose a table.');
    if (!/^\d+$/.test(minutes.trim()) || Number(minutes) < 1) return setError('Minutes must be a whole number of at least 1.');
    setLoading(true);
    setError(null);
    try {
      setQuote(await billiardService.getPricingQuote({ table_id: tid, minutes: Number(minutes), at: at || undefined }));
    } catch (err) {
      setQuote(null);
      setError(billiardErrorMessage(err, 'Could not get a price preview'));
    } finally {
      setLoading(false);
    }
  };

  const currency = quote?.currency ?? DEFAULT_CURRENCY;
  const paramsText = describePricingParams(quote?.params);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">Preview price</h3>
        <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
          Shows what a session would cost with the current rules. Nothing is saved.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormGroup className="space-y-1">
          <FormLabel htmlFor="quote_table">Table</FormLabel>
          <FormSelect id="quote_table" value={tableId} className="w-full" onChange={(e) => setTableId(e.target.value)}>
            <option value="">Select…</option>
            {tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup className="space-y-1">
          <FormLabel htmlFor="quote_minutes">Minutes played</FormLabel>
          <FormInput id="quote_minutes" type="text" inputMode="numeric" value={minutes}
            onChange={(e) => setMinutes(e.target.value)} />
        </FormGroup>
        <FormGroup className="space-y-1">
          <FormLabel htmlFor="quote_at">Start at (optional)</FormLabel>
          <FormInput id="quote_at" type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
          <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">Club-local time. Empty = now.</p>
        </FormGroup>
      </div>

      <div className="flex justify-end">
        <Button label={loading ? 'Calculating...' : 'Preview price'} rounded="lg" disabled={loading} onClick={run} />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {quote && (
        <div className="space-y-1.5 border-t border-gray-200 dark:border-white/5 pt-3">
          <Row label="Priced for" value={formatDateTime(quote.at)} />
          <Row label="Rule" value={quote.rule_name || 'No rule matched (table rate)'} />
          {quote.rule_type && (
            <Row label="Billing" value={`${getBillingPolicyLabel(quote.rule_type)}${paramsText ? ` · ${paramsText}` : ''}`} />
          )}
          {quote.hourly_rate != null && quote.hourly_rate !== '' && (
            <Row label="Rate" value={`${formatMoneyString(quote.hourly_rate, currency)} / h`} />
          )}
          <Row label={`Table fee (${quote.minutes} min)`} value={formatMoneyString(quote.fee, currency)} bold />
        </div>
      )}
    </div>
  );
};

export default PricingQuotePanel;
