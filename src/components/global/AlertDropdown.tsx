// src/components/global/AlertDropdown.tsx
import React, { useState } from 'react';
import { IconBell } from '@tabler/icons-react';
import ActivityLog from '../HydroponicSystemPage/components/ActivityLog';
import AlertsPanel from '../HydroponicSystemPage/components/AlertsPanel';
import Button from '../common/Button';
import type { SystemAlert, ControlAction } from '../../models/interfaces/HydroSystem';
interface AlertDropdownProps {
    alerts: SystemAlert[];
    controlActions: ControlAction[];
    onResolveAlert: (alertId: string) => void;
}

const AlertDropdown: React.FC<AlertDropdownProps> = ({
    alerts,
    controlActions,
    onResolveAlert,
}) => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<'alerts' | 'activity'>('alerts');

    const getTabClass = (key: 'alerts' | 'activity') => {
        const base = 'flex-1 p-2 text-sm font-medium text-center';
        if (tab === key) {
            return `${base} bg-blue-100 text-blue-600`;
        }
        return `${base} hover:bg-gray-50 text-gray-600`;
    };

    return (
        <div className="relative">
            <Button
                variant="secondary"
                icon={
                    <div className="relative">
                        <IconBell size={18} />
                        {alerts.some((a) => !a.resolved) && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-[1px] rounded-full min-w-[18px] text-center leading-tight">
                                {alerts.filter((a) => !a.resolved).length}
                            </span>
                        )}
                    </div>
                }
                iconOnly
                rounded="full"
                className="relative bg-transparent hover:bg-gray-100"
                onClick={() => setOpen(!open)}
            />

            {open && (
                <div className="absolute left-0 z-50 mt-2 w-[360px] bg-white border border-gray-200 dark:bg-gray-700 dark:border-white/5 rounded-xl shadow-lg overflow-hidden">
                    <div className="flex border-b border-gray-200 dark:border-white/5">
                        <button className={getTabClass('alerts')} onClick={() => setTab('alerts')}>
                            Alerts
                        </button>
                        <button className={getTabClass('activity')} onClick={() => setTab('activity')}>
                            Activity Log
                        </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {tab === 'alerts' ? (
                            <AlertsPanel alerts={alerts} onResolveAlert={onResolveAlert} />
                        ) : (
                            <ActivityLog actions={controlActions} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertDropdown;
