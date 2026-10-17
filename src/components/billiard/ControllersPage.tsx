import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconArrowLeft, IconPlus, IconRefresh, IconServer } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import LinearProgress from '../common/LinearProgress';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { useBilliardControllers } from '../../hooks/useBilliardControllers';
import { formatDateTime } from '../../utils/billiard';
import RegisterControllerModal from './components/RegisterControllerModal';
import ControllerApiKeyModal from './components/ControllerApiKeyModal';
import type { BilliardControllerStatus, ControllerRegisterResponse } from '../../models/interfaces/Billiard';

const STATUS_VARIANT: Record<BilliardControllerStatus, 'success' | 'gray' | 'warning' | 'danger'> = {
  online: 'success',
  offline: 'gray',
  syncing: 'warning',
  error: 'danger',
};

const ControllersPage: React.FC = () => {
  const navigate = useNavigate();
  const canView = useHasAnyRole(['admin', 'super_admin', 'manager']);
  const { controllers, loading, error, refetch } = useBilliardControllers();
  const [registerOpen, setRegisterOpen] = useState(false);
  // Holds the one-time api_key; cleared on Done so it can never be shown again.
  const [registered, setRegistered] = useState<ControllerRegisterResponse | null>(null);

  const handleRegistered = (res: ControllerRegisterResponse) => {
    setRegisterOpen(false);
    setRegistered(res);
  };

  const handleKeyDone = () => {
    setRegistered(null);
    refetch();
  };

  if (!canView) {
    return <div className="mt-10 text-center font-semibold text-red-500">Unauthorized: You do not have access to view this page.</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Controller status"
        subtitle="Monitor the billiard controllers that send table and scoring events. Refreshes every 30 seconds."
        actions={
          <>
            {(controllers.length > 0 || !!error) && (
              <Button label="Register" icon={<IconPlus size={16} />} iconPosition="left" rounded="lg" onClick={() => setRegisterOpen(true)} />
            )}
            <Button label="Refresh" variant="secondary" icon={<IconRefresh size={16} />} iconPosition="left" rounded="lg" onClick={refetch} disabled={loading} />
            <Button label="Back to tables" variant="secondary" icon={<IconArrowLeft size={16} />} iconPosition="left" rounded="lg" onClick={() => navigate('/billiard')} />
          </>
        }
      />

      {loading && <LinearProgress position="absolute" thickness="h-1" duration={3000} />}

      {!loading && error ? (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <Button label="Retry" variant="secondary" rounded="lg" onClick={refetch} />
        </div>
      ) : !loading && controllers.length === 0 ? (
        <div className="flex flex-col items-center gap-2">
          <EmptyState icon={<IconServer size={48} />} message="No controller registered" />
          <Button label="Register" icon={<IconPlus size={16} />} iconPosition="left" rounded="lg" onClick={() => setRegisterOpen(true)} />
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {controllers.map((controller) => (
            <article key={controller.device_id} className="space-y-4 rounded-lg border border-gray-100 bg-gradient-to-b from-white to-zinc-50 p-4 shadow dark:border-white/5 dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{controller.name}</h2>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{controller.device_id}</p>
                </div>
                <Badge label={controller.status} variant={STATUS_VARIANT[controller.status] ?? 'gray'} size="xsmall" className="capitalize" />
              </div>
              <dl className="space-y-2 border-t border-gray-200 pt-3 text-xs dark:border-white/5">
                <div className="flex justify-between gap-4"><dt className="text-gray-500 dark:text-gray-400">Firmware</dt><dd className="text-right text-gray-800 dark:text-gray-200">{controller.firmware_version || '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-500 dark:text-gray-400">Last seen</dt><dd className="text-right text-gray-800 dark:text-gray-200">{formatDateTime(controller.last_seen)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-500 dark:text-gray-400">Synced event</dt><dd className="text-right font-medium text-gray-800 dark:text-gray-200">#{controller.last_applied_seq}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}

      <RegisterControllerModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} onRegistered={handleRegistered} />
      <ControllerApiKeyModal result={registered} onDone={handleKeyDone} />
    </div>
  );
};

export default ControllersPage;
