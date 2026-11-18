// src/components/billiard/TablesPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  IconDots,
  IconChartBar,
  IconDeviceDesktopAnalytics,
  IconMoodEmpty,
  IconTag,
  IconCirclePlus,
  IconCashRegister,
  IconBuildingBank,
} from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LinearProgress from '../common/LinearProgress';
import EmptyState from '../common/EmptyState';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { useTables } from '../../hooks/useTables';
import { useActiveTables } from '../../hooks/useActiveTables';
import { useNow } from '../../hooks/useNow';
import TableCard from './components/TableCard';
import TableFormModal from './components/TableFormModal';
import type { BilliardTable, TableCreate, TableStatus } from '../../models/interfaces/Billiard';
import DropdownButton from '../common/DropdownButton';

const GROUPS: { status: TableStatus; label: string }[] = [
  { status: 'available', label: 'Available' },
  { status: 'playing', label: 'Playing' },
  { status: 'reserved', label: 'Reserved' },
  { status: 'maintenance', label: 'Maintenance' },
];

const TablesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canManage = useHasAnyRole(['admin', 'super_admin', 'manager']);

  const {
    tables,
    loading,
    error,
    startingId,
    creating,
    updating,
    deactivatingId,
    actions,
  } = useTables();

  const { byTableId, error: liveError, refetch: refetchLive } = useActiveTables(30000);
  const now = useNow(1000); // local 1s tick for elapsed timers
  const [formOpen, setFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<BilliardTable | null>(null);
  const [tableToDeactivate, setTableToDeactivate] =
    useState<BilliardTable | null>(null);

  const openCreateForm = () => {
    setEditingTable(null);
    setFormOpen(true);
  };

  const openEditForm = (table: BilliardTable) => {
    setEditingTable(table);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTable(null);
  };

  const handleFormSubmit = async (data: TableCreate) => {
    if (editingTable) {
      return actions.updateTable(editingTable.id, data);
    }

    return actions.createTable(data);
  };

  const handleStart = async (table: BilliardTable) => {
    const session = await actions.startTable(table.id);

    if (session) {
      navigate(`/billiard/sessions/${session.session_id}`);
    } else {
      refetchLive();
    }
  };

  const openDeactivateConfirmation = (table: BilliardTable) => {
    setTableToDeactivate(table);
  };

  const closeDeactivateConfirmation = () => {
    if (deactivatingId !== null) return;
    setTableToDeactivate(null);
  };

  const handleDeactivate = async () => {
    if (!tableToDeactivate) return;

    const result = await actions.deactivateTable(tableToDeactivate.id);

    if (result === true) {
      setTableToDeactivate(null);
    }
  };

  const knownStatuses = GROUPS.map((g) => g.status as string);

  const sections = [
    ...GROUPS.map((g) => ({
      label: g.label,
      items: tables.filter((t) => t.status === g.status),
    })),
    {
      label: 'Other',
      items: tables.filter((t) => !knownStatuses.includes(t.status)),
    },
  ].filter((s) => s.items.length > 0);

  return (
    <div>
      <PageTitle
        title={t('billiard_tables.billiard_tables_title')}
        subtitle={t('billiard_tables.billiard_tables_description')}
        actions={
          <>
            <Button
              label={t('btn.cash_drawer')}
              variant="secondary"
              icon={<IconCashRegister size={16} className="text-gray-500" />}
              iconPosition="left"
              rounded="lg"
              onClick={() => navigate('/billiard/shifts')}
            />

            {canManage && (
              <Button
                label={t('btn.add_table')}
                variant="secondary"
                icon={<IconCirclePlus size={16} className="text-gray-500" />}
                iconPosition="left"
                rounded="lg"
                onClick={openCreateForm}
              />
            )}

            {canManage && (
              <DropdownButton
                label={<IconDots />}
                variant="secondary"
                size="md"
                direction="auto"
                items={[
                  {
                    label: t('btn.bank_inbox'),
                    value: 'bank-inbox',
                    icon: <IconBuildingBank size={16} />,
                  },
                  {
                    label: t('btn.table_report'),
                    value: 'reports',
                    icon: <IconChartBar size={16} />,
                  },
                  {
                    label: t('btn.pricing_rules'),
                    value: 'pricing-rules',
                    icon: <IconTag size={16} />,
                  },
                  {
                    label: t('btn.billiard_controllers'),
                    value: 'controllers',
                    icon: <IconDeviceDesktopAnalytics size={16} />,
                  },
                ]}
                onSelect={(item) => {
                  switch (item.value) {
                    case 'bank-inbox':
                      navigate('/billiard/bank-inbox');
                      break;
                    case 'reports':
                      navigate('/billiard/reports');
                      break;
                    case 'pricing-rules':
                      navigate('/billiard/pricing-rules');
                      break;
                    case 'controllers':
                      navigate('/billiard/controllers');
                      break;
                  }
                }}
              />
            )}
          </>
        }
      />

      {liveError && !loading && (
        <p className="mb-4 text-xs text-amber-600 dark:text-amber-400">
          Live data could not be refreshed: {liveError}
        </p>
      )}

      {loading ? (
        <LinearProgress position="absolute" thickness="h-1" duration={3000} />
      ) : error && tables.length === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            label="Retry"
            variant="secondary"
            rounded="lg"
            onClick={actions.fetchTables}
          />
        </div>
      ) : tables.length === 0 ? (
        <EmptyState icon={<IconMoodEmpty size={48} />} message="No tables yet." />
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.label} className="space-y-3">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {section.label}{' '}
                <span className="text-gray-400 font-normal">
                  ({section.items.length})
                </span>
              </h2>

              <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                {section.items.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    live={byTableId.get(table.id)}
                    now={now}
                    starting={startingId === table.id}
                    disabled={startingId !== null || deactivatingId !== null}
                    onStart={handleStart}
                    onOpen={(sessionId) =>
                      navigate(`/billiard/sessions/${sessionId}`)
                    }
                    onEdit={canManage ? openEditForm : undefined}
                    onDeactivate={canManage ? openDeactivateConfirmation : undefined}
                    deactivating={deactivatingId === table.id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {canManage && (
        <TableFormModal
          isOpen={formOpen}
          onClose={closeForm}
          table={editingTable}
          loading={creating || updating}
          onSubmit={handleFormSubmit}
        />
      )}

      <Modal
        isOpen={canManage && tableToDeactivate !== null}
        onClose={closeDeactivateConfirmation}
        title={t('billiard_tables.modals.deactivate.title', {
          defaultValue: 'Deactivate table?',
        })}
        size="small"
        showCloseButton={deactivatingId === null}
        content={
          <div className="px-7 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>
              {t('billiard_tables.modals.deactivate.description', {
                table: tableToDeactivate?.name ?? '',
                defaultValue: `Are you sure you want to deactivate "${tableToDeactivate?.name}"?`,
              })}
            </p>

            <p>
              {t('billiard_tables.modals.deactivate.note', {
                defaultValue:
                  'The table will no longer appear in the active table list. Historical sessions and billing records will be preserved.',
              })}
            </p>
          </div>
        }
        actions={
          <div className="flex justify-end gap-2">
            <Button
              label={t('btn.cancel')}
              variant="secondary"
              rounded="lg"
              disabled={deactivatingId !== null}
              onClick={closeDeactivateConfirmation}
            />

            <Button
              label={
                deactivatingId !== null
                  ? t('btn.deactivating', { defaultValue: 'Deactivating...' })
                  : t('btn.deactivate', { defaultValue: 'Deactivate' })
              }
              variant="danger"
              rounded="lg"
              disabled={deactivatingId !== null}
              onClick={handleDeactivate}
              icon={
                deactivatingId !== null ? (
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                ) : undefined
              }
              iconPosition="left"
            />
          </div>
        }
      />

    </div>
  );
};

export default TablesPage;
