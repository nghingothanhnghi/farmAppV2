// src/components/billiard/TablesPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {useTranslation} from 'react-i18next';
import { IconChartBar, IconMoodEmpty, IconPlus } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import LinearProgress from '../common/LinearProgress';
import EmptyState from '../common/EmptyState';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { useTables } from '../../hooks/useTables';
import { useActiveTables } from '../../hooks/useActiveTables';
import { useNow } from '../../hooks/useNow';
import TableCard from './components/TableCard';
import TableFormModal from './components/TableFormModal';
import type { BilliardTable, TableStatus } from '../../models/interfaces/Billiard';

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

  const { tables, loading, error, startingId, creating, actions } = useTables();
  const { byTableId, error: liveError, refetch: refetchLive } = useActiveTables(30000);
  const now = useNow(1000); // local 1s tick for elapsed timers
  const [formOpen, setFormOpen] = useState(false);

  const handleStart = async (table: BilliardTable) => {
    const session = await actions.startTable(table.id);
    if (session) navigate(`/billiard/sessions/${session.session_id}`);
    else refetchLive(); // 409 → live data is stale too (tables are refetched in the hook)
  };

  const knownStatuses = GROUPS.map((g) => g.status as string);
  const sections = [
    ...GROUPS.map((g) => ({ label: g.label, items: tables.filter((t) => t.status === g.status) })),
    { label: 'Other', items: tables.filter((t) => !knownStatuses.includes(t.status)) },
  ].filter((s) => s.items.length > 0);

  return (
    <div>
      <PageTitle
        title={t('billiard_tables.billiard_tables_title')}
        subtitle={t('billiard_tables.billiard_tables_description')}
        actions={
          canManage ? (
            <>
              <Button
                label={t("btn.table_report")}
                variant="secondary"
                icon={<IconChartBar size={16} className="text-gray-500" />}
                iconPosition="left"
                rounded="lg"
                onClick={() => navigate('/billiard/reports')}
              />
              <Button
                label={t("btn.add_table")}
                variant="secondary"
                icon={<IconPlus size={16} className="text-gray-500" />}
                iconPosition="left"
                rounded="lg"
                onClick={() => setFormOpen(true)}
              />
            </>
          ) : undefined
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
          <Button label="Retry" variant="secondary" rounded="lg" onClick={actions.fetchTables} />
        </div>
      ) : tables.length === 0 ? (
        <EmptyState icon={<IconMoodEmpty size={48} />} message="No tables yet." />
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.label} className="space-y-3">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {section.label} <span className="text-gray-400 font-normal">({section.items.length})</span>
              </h2>
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                {section.items.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    live={byTableId.get(table.id)}
                    now={now}
                    starting={startingId === table.id}
                    disabled={startingId !== null}
                    onStart={handleStart}
                    onOpen={(sessionId) => navigate(`/billiard/sessions/${sessionId}`)}
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
          onClose={() => setFormOpen(false)}
          loading={creating}
          onSubmit={actions.createTable}
        />
      )}
    </div>
  );
};

export default TablesPage;
