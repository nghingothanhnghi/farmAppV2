// src/components/billiard/PricingRulesPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconAlertCircle, IconArrowLeft, IconMoodEmpty, IconPlus } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import LinearProgress from '../common/LinearProgress';
import EmptyState from '../common/EmptyState';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { usePricingRules } from '../../hooks/usePricingRules';
import { useTables } from '../../hooks/useTables';
import PricingRuleFormModal from './components/PricingRuleFormModal';
import PricingQuotePanel from './components/PricingQuotePanel';
import { DEFAULT_CURRENCY, formatMoneyString } from '../../utils/billiard';
import { describeDays, describePricingParams, describeWindow, getBillingPolicyLabel } from '../../utils/pricing';
import type { PricingRule } from '../../models/interfaces/Billiard';

const PricingRulesPage: React.FC = () => {
  const navigate = useNavigate();
  // The server enforces ADMIN/MANAGER on writes; the list itself is open to any logged-in user.
  const canManage = useHasAnyRole(['admin', 'super_admin', 'manager']);

  const { rules, loading, error, saving, actions } = usePricingRules();
  const { tables } = useTables();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [deleting, setDeleting] = useState<PricingRule | null>(null);

  const tableName = (id?: number | null) =>
    id == null ? 'All tables' : tables.find((t) => t.id === id)?.name ?? `Table #${id}`;

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (r: PricingRule) => { setEditing(r); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await actions.deleteRule(deleting.id);
    if (ok) setDeleting(null);
  };

  // Highest priority first, then newest, so the list reads in the same order the server picks a winner.
  const sorted = [...rules].sort((a, b) => b.priority - a.priority || b.id - a.id);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Pricing rules"
        subtitle="Happy hours, peak rates, block and minimum billing. A session keeps the rule that matched when it started."
        actions={
          <>
            <Button label="Back to tables" variant="secondary" icon={<IconArrowLeft size={16} />}
              iconPosition="left" rounded="lg" onClick={() => navigate('/billiard')} />
            {canManage && (
              <Button label="Add rule" variant="secondary" icon={<IconPlus size={16} className="text-gray-500" />}
                iconPosition="left" rounded="lg" onClick={openCreate} />
            )}
          </>
        }
      />

      {!canManage && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          You can view pricing rules, but only admins and managers can change them.
        </p>
      )}

      {loading ? (
        <LinearProgress position="absolute" thickness="h-1" duration={3000} />
      ) : error && rules.length === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button label="Retry" variant="secondary" rounded="lg" onClick={actions.fetchRules} />
        </div>
      ) : rules.length === 0 ? (
        <EmptyState icon={<IconMoodEmpty size={48} />} message="No pricing rules yet. Tables use their own hourly rate." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Rule</th>
                <th className="px-3 py-2 font-medium">Billing</th>
                <th className="px-3 py-2 font-medium">Rate</th>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Applies to</th>
                <th className="px-3 py-2 font-medium text-right">Priority</th>
                <th className="px-3 py-2 font-medium">Status</th>
                {canManage && <th className="px-3 py-2 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-gray-800 dark:text-gray-100">
              {sorted.map((r) => {
                const paramsText = describePricingParams(r.params);
                return (
                  <tr key={r.id} className={r.is_active ? '' : 'opacity-60'}>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2">
                      {getBillingPolicyLabel(r.rule_type)}
                      {paramsText && <span className="block text-[0.625rem] text-gray-500 dark:text-gray-400">{paramsText}</span>}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.hourly_rate ? `${formatMoneyString(r.hourly_rate, DEFAULT_CURRENCY)} / h` : <span className="text-gray-400">Table rate</span>}
                    </td>
                    <td className="px-3 py-2">
                      {describeDays(r.days_of_week)}
                      <span className="block text-[0.625rem] text-gray-500 dark:text-gray-400">{describeWindow(r)}</span>
                    </td>
                    <td className="px-3 py-2">{tableName(r.table_id)}</td>
                    <td className="px-3 py-2 text-right">{r.priority}</td>
                    <td className="px-3 py-2">
                      <Badge label={r.is_active ? 'Active' : 'Inactive'} variant={r.is_active ? 'success' : 'gray'} size="xsmall" />
                    </td>
                    {canManage && (
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <Button label="Edit" size="xs" variant="secondary" rounded="lg" disabled={saving} onClick={() => openEdit(r)} />
                          <Button label={r.is_active ? 'Deactivate' : 'Activate'} size="xs" variant="secondary" rounded="lg"
                            disabled={saving} onClick={() => actions.toggleActive(r)} />
                          <Button label="Delete" size="xs" variant="danger" rounded="lg" disabled={saving} onClick={() => setDeleting(r)} />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
        When several rules match, the highest priority wins, then a table-specific rule over an all-tables rule, then the newest.
      </p>

      <PricingQuotePanel tables={tables} />

      {canManage && (
        <PricingRuleFormModal
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          rule={editing}
          tables={tables}
          saving={saving}
          onSubmit={actions.saveRule}
        />
      )}

      <Modal
        showCloseButton={false}
        size="xsmall"
        isOpen={deleting !== null}
        onClose={() => !saving && setDeleting(null)}
        content={
          <div className="text-sm px-10 pt-6 pb-10 text-center">
            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
            Delete the rule “{deleting?.name}”? Running and finished bills are not affected, but new sessions will no longer use it.
          </div>
        }
        actions={
          <div className="flex gap-4">
            <Button label={saving ? 'Deleting...' : 'Yes, Delete'} variant="danger" onClick={confirmDelete}
              disabled={saving} className="min-w-[150px]" rounded="lg" />
            <Button label="Cancel" variant="secondary" onClick={() => setDeleting(null)} disabled={saving}
              className="min-w-[150px]" rounded="lg" />
          </div>
        }
      />
    </div>
  );
};

export default PricingRulesPage;
