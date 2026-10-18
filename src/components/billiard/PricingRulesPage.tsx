// src/components/billiard/PricingRulesPage.tsx
import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { IconAlertCircle, IconArrowLeft, IconMoodEmpty, IconPlus, IconCalculator } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Modal from '../common/Modal';
import LinearProgress from '../common/LinearProgress';
import EmptyState from '../common/EmptyState';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { usePricingRules } from '../../hooks/usePricingRules';
import { useTables } from '../../hooks/useTables';
import PricingRuleFormModal from './components/PricingRuleFormModal';
import PricingQuotePanel from './components/PricingQuotePanel';
import PricingRulesTable from './components/PricingRulesTable';
import type { PricingRule } from '../../models/interfaces/Billiard';
import SideContentPanel from '../common/SideContentPanel';
import { useSideContent } from '../../hooks/useSideContent';

const PricingRulesPage: React.FC = () => {
  // const { t } = useTranslation()
  const navigate = useNavigate();

  const sideContent = useSideContent();

  const openPricingPreview = () => {
    sideContent.openSide();
  };

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

  return (
    <div className="flex flex-col h-full min-h-0 space-y-6">
      <PageTitle
        title="Pricing rules"
        subtitle="Happy hours, peak rates, block and minimum billing. A session keeps the rule that matched when it started."
        actions={
          <>
            <Button
              label="Preview price"
              variant="secondary"
              icon={<IconCalculator size={16} />}
              iconPosition="left"
              rounded="lg"
              onClick={openPricingPreview}
            />
            <Button label="Back to tables" variant="secondary" icon={<IconArrowLeft size={16} />}
              iconPosition="left" rounded="lg" onClick={() => navigate('/billiard')} />
            {canManage && (
              <Button label="Add rule" variant="secondary" icon={<IconPlus size={16} className="text-gray-500" />}
                iconPosition="left" rounded="lg" onClick={openCreate} />
            )}

          </>
        }
      />

      <SideContentPanel
        open={sideContent.sideOpen}
        onClose={sideContent.closeSide}
      >
        <PricingQuotePanel tables={tables} />

      </SideContentPanel>

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
        <div style={{ flex: '1 1 auto', minHeight: 0 }}>
          <PricingRulesTable
            rules={rules}
            canManage={canManage}
            saving={saving}
            tableName={tableName}
            onEdit={openEdit}
            onToggleActive={actions.toggleActive}
            onDelete={setDeleting}
          />
        </div>
      )}

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
