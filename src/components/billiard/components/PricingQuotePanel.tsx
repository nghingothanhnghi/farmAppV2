// src/components/billiard/components/PricingQuotePanel.tsx
// "Preview price": calls GET /billiard/pricing-rules/quote. Writes nothing.
import React, { useState } from 'react';
import Button from '../../common/Button';
import { FormGroup, FormInput, FormLabel, FormSelect, FloatingLabelInput, FloatingLabelSelect } from '../../common/Form';
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
    <div className="p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingLabelSelect
          id="quote_table"
          name="quote_table"
          label="Table"
          value={tableId}
          className="w-full"
          onChange={(e) => setTableId(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a table
          </option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </FloatingLabelSelect>

        <FloatingLabelInput
          id="quote_minutes"
          name="quote_minutes"
          type="text"
          label="Minutes played"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <FormGroup className="space-y-1 sm:col-span-2">
          <FloatingLabelInput
            id="quote_at"
            name="quote_at"
            type="datetime-local"
            label="Start at (optional)"
            inputMode="numeric"
            value={at}
            onChange={(e) => setAt(e.target.value)}
            alwaysFloat
          />
          <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">Club-local time. Empty = now.</p>
        </FormGroup>
      </div>
      <div className="flex">
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
