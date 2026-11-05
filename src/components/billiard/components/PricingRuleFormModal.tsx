// src/components/billiard/components/PricingRuleFormModal.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FormCheckbox, FormGroup, FormLabel, FormToggle, FloatingLabelInput, FloatingLabelSelect } from '../../common/Form';
import { PRICING_RULE_TYPES, DAYS_OF_WEEK } from '../../../models/interfaces/Billiard';
import type {
  BilliardTable,
  DayOfWeek,
  PricingRule,
  PricingRulePayload,
  PricingRuleType,
} from '../../../models/interfaces/Billiard';
import type { SaveRuleResult } from '../../../hooks/usePricingRules';
import { dayLabel, getBillingPolicyLabel, parseDays, serializeDays, toHHMM } from '../../../utils/pricing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** null = create */
  rule: PricingRule | null;
  tables: BilliardTable[];
  saving: boolean;
  onSubmit: (id: number | null, payload: PricingRulePayload) => Promise<SaveRuleResult>;
}

interface FormState {
  name: string;
  rule_type: PricingRuleType;
  hourly_rate: string;
  block_minutes: string;
  min_minutes: string;
  table_id: string; // '' = all tables
  days: DayOfWeek[];
  start_time: string;
  end_time: string;
  priority: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: '',
  rule_type: 'per_minute',
  hourly_rate: '',
  block_minutes: '',
  min_minutes: '',
  table_id: '',
  days: [],
  start_time: '',
  end_time: '',
  priority: '0',
  is_active: true,
};

const fromRule = (r: PricingRule): FormState => ({
  name: r.name,
  rule_type: r.rule_type,
  hourly_rate: r.hourly_rate != null ? String(r.hourly_rate) : '',
  block_minutes: r.params?.block_minutes != null ? String(r.params.block_minutes) : '',
  min_minutes: r.params?.min_minutes != null ? String(r.params.min_minutes) : '',
  table_id: r.table_id != null ? String(r.table_id) : '',
  days: parseDays(r.days_of_week),
  start_time: toHHMM(r.start_time),
  end_time: toHHMM(r.end_time),
  priority: String(r.priority ?? 0),
  is_active: r.is_active,
});

const isIntInRange = (v: string, min: number, max: number) =>
  /^\d+$/.test(v.trim()) && Number(v) >= min && Number(v) <= max;

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (f.name.trim().length < 2) e.name = 'Name is required (min 2 characters).';
  if (f.hourly_rate.trim() && (!/^\d+(\.\d{1,2})?$/.test(f.hourly_rate.trim()) || !/[1-9]/.test(f.hourly_rate)))
    e.hourly_rate = 'Enter a valid amount greater than 0, or leave empty to use the table rate.';
  if (f.rule_type === 'block' && !isIntInRange(f.block_minutes, 1, 1440))
    e.block_minutes = 'Whole minutes between 1 and 1440.';
  if (f.rule_type === 'minimum_hour' && !isIntInRange(f.min_minutes, 1, 1440))
    e.min_minutes = 'Whole minutes between 1 and 1440.';
  if (!!f.start_time !== !!f.end_time) e.start_time = 'Set both start and end time, or neither.';
  if (f.start_time && f.end_time && f.start_time === f.end_time)
    e.end_time = 'Start and end must differ (use an end before the start for an overnight window).';
  if (!isIntInRange(f.priority, 0, 1000)) e.priority = 'Whole number between 0 and 1000.';
  return e;
}

function toPayload(f: FormState): PricingRulePayload {
  const params =
    f.rule_type === 'block'
      ? { block_minutes: Number(f.block_minutes) }
      : f.rule_type === 'minimum_hour'
        ? { min_minutes: Number(f.min_minutes) }
        : {};
  return {
    name: f.name.trim(),
    rule_type: f.rule_type,
    hourly_rate: f.hourly_rate.trim() || null, // stays a string - no float conversion
    params,
    table_id: f.table_id ? Number(f.table_id) : null,
    days_of_week: serializeDays(f.days), // '' = every day
    start_time: f.start_time || null,
    end_time: f.end_time || null,
    priority: Number(f.priority),
    is_active: f.is_active,
  };
}

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs">{msg}</p> : null;

const PricingRuleFormModal: React.FC<Props> = ({ isOpen, onClose, rule, tables, saving, onSubmit }) => {
  const { t } = useTranslation();
  const [f, setF] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setF(rule ? fromRule(rule) : EMPTY);
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, rule]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  const toggleDay = (d: DayOfWeek) =>
    set('days', f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d]);

  const handleSubmit = async () => {
    const e = validate(f);
    setErrors(e);
    setServerError(null);
    if (Object.keys(e).length > 0) return;
    const res = await onSubmit(rule?.id ?? null, toPayload(f));
    if (res === true) onClose();
    else if (res.message) setServerError(res.message);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={saving ? () => { } : onClose}
      title={rule ? 'Edit pricing rule' : 'New pricing rule'}
      size="small"
      content={
        <div className="px-7 pb-4 min-h-[300px] space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Rules apply to sessions that start after the change. Running and finished bills keep the rule
            they started with.
          </p>
          <FormGroup className="space-y-1">
            <FloatingLabelInput
              id="rule_name"
              name="name"
              label="Name"
              placeholder="Enter pricing rule name, e.g. Happy Hour"
              value={f.name}
              onChange={(e) => set('name', e.target.value)}
              disabled={saving}
              required
              alwaysFloat
            />
            <FieldError msg={errors.name} />
          </FormGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormGroup className="space-y-1">
              <FloatingLabelSelect
                id="rule_type"
                name="rule_type"
                label="Billing type"
                value={f.rule_type}
                disabled={saving}
                onChange={(e) => set('rule_type', e.target.value as PricingRuleType)}
                className="w-full"
              >
                {PRICING_RULE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getBillingPolicyLabel(type)}
                  </option>
                ))}
              </FloatingLabelSelect>
            </FormGroup>
            <FormGroup className="space-y-1">
              <FloatingLabelInput
                id="rule_rate"
                name="hourly_rate"
                label="Hourly rate (optional)"
                placeholder="Table's own rate"
                type="text"
                inputMode="decimal"
                value={f.hourly_rate}
                onChange={(e) => set('hourly_rate', e.target.value)}
                disabled={saving}
                alwaysFloat
              />
              <FieldError msg={errors.hourly_rate} />
            </FormGroup>
          </div>

          {f.rule_type === 'block' && (
            <FormGroup className="space-y-1">
              <FloatingLabelInput
                id="rule_block"
                name="block_minutes"
                label="Block length (minutes)"
                placeholder="e.g. 30"
                type="text"
                inputMode="numeric"
                value={f.block_minutes}
                onChange={(e) => set('block_minutes', e.target.value)}
                disabled={saving}
                alwaysFloat
              />

              <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">Time is charged in whole blocks of this length.</p>
              <FieldError msg={errors.block_minutes} />
            </FormGroup>
          )}

          {f.rule_type === 'minimum_hour' && (
            <FormGroup className="space-y-1">
              <FloatingLabelInput
                id="rule_min"
                name="min_minutes"
                label="Minimum charged time (minutes)"
                placeholder="e.g. 60"
                type="text"
                inputMode="numeric"
                value={f.min_minutes}
                onChange={(e) => set('min_minutes', e.target.value)}
                disabled={saving}
                alwaysFloat
              />
              <FieldError msg={errors.min_minutes} />
            </FormGroup>
          )}

          <FormGroup className="space-y-1">
            <FloatingLabelSelect
              id="rule_table"
              name="table_id"
              label="Applies to"
              value={f.table_id}
              disabled={saving}
              onChange={(e) => set('table_id', e.target.value)}
              className="w-full"
            >
              <option value="">All tables</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </FloatingLabelSelect>
          </FormGroup>

          <FormGroup className="space-y-1">
            <FormLabel htmlFor="rule_days">Days (none selected = every day)</FormLabel>
            <div className="grid grid-cols-4 gap-x-4 gap-y-3" id="rule_days">
              {DAYS_OF_WEEK.map((d) => (
                <FormCheckbox key={d} id={`rule_day_${d}`} label={dayLabel(d)} checked={f.days.includes(d)}
                  disabled={saving} onChange={() => toggleDay(d)} />
              ))}
            </div>
          </FormGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormGroup className="space-y-1">
              <FloatingLabelInput
                id="rule_start"
                name="start_time"
                label="Start time (club-local)"
                type="time"
                value={f.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                disabled={saving}
                alwaysFloat
              />
              <FieldError msg={errors.start_time} />
            </FormGroup>
            <FormGroup className="space-y-1">
              <FloatingLabelInput
                id="rule_end"
                name="end_time"
                label="End time (club-local)"
                type="time"
                value={f.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                disabled={saving}
                alwaysFloat
              />
              <FieldError msg={errors.end_time} />
            </FormGroup>
          </div>
          <p className="text-[0.625rem] text-gray-500 dark:text-gray-400 -mt-2">
            Leave both empty for all day. An end time earlier than the start is an overnight window (e.g. 22:00 – 02:00).
          </p>

          <div className="grid gap-4 sm:grid-cols-2 items-end">
            <FormGroup className="space-y-1">
              <FloatingLabelInput
                id="rule_priority"
                name="priority"
                label="Priority (0–1000, higher wins)"
                type="text"
                inputMode="numeric"
                value={f.priority}
                onChange={(e) => set('priority', e.target.value)}
                disabled={saving}
                alwaysFloat
              />
              <FieldError msg={errors.priority} />
            </FormGroup>
            <FormToggle id="rule_active" label="Active" checked={f.is_active}
              onChange={(e) => set('is_active', e.target.checked)} />
          </div>

          {serverError && <p className="text-red-500 text-xs">{serverError}</p>}
        </div>
      }
      actions={
        <div className="flex gap-4">
          <Button label={saving ? t('btn.saving') : t('btn.save')} onClick={handleSubmit} disabled={saving}
            className="min-w-[150px]" rounded="lg" />
          <Button label={t('btn.cancel')} variant="secondary" onClick={onClose} disabled={saving}
            className="min-w-[150px]" rounded="lg" />
        </div>
      }
    />
  );
};

export default PricingRuleFormModal;
