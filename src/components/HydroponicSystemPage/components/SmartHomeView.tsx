// src/components/HydroponicSystemPage/components/SmartHomeView.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { IconHome2, IconChevronUp, IconChevronDown, IconPlayerStop, IconArtboard, IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useHydroSystem } from '../../../hooks/useHydroSystem';
import { useSchedule } from '../../../hooks/useSchedule';
import useHasAnyRole from '../../../hooks/useHasAnyRole';
import { getActuatorIcon, getActuatorReason } from '../../../utils/actuator';
import { FormToggle } from '../../common/Form';
import Button from '../../common/Button';
import DropdownButton from '../../common/DropdownButton';
import Spinner from '../../common/Spinner';
import ScheduleManager from './ScheduleManager';
import type { HydroActuator, SystemStatusPerDevice } from '../../../models/interfaces/HydroSystem';
import ButtonGroup from '../../common/ButtonGroup';

interface SmartHomeViewProps {
    /** Optional — pick a specific device. Defaults to the first device found. */
    deviceId?: number;
    /** Roles allowed to actually control actuators. Reuses existing role system. */
    allowedRoles?: string[];
}

const DEFAULT_CONTROL_ROLES = ['admin', 'super_admin', 'moderator', 'user'];

const SmartHomeView: React.FC<SmartHomeViewProps> = ({
    deviceId,
    allowedRoles = DEFAULT_CONTROL_ROLES,
}) => {

    const { t } = useTranslation();
    const { deviceStatusList, loading, actions } = useHydroSystem();
    const { actions: scheduleActions } = useSchedule();

    // ✅ Reuse existing role/permission hook — no new permission system
    const canControl = useHasAnyRole(allowedRoles);

    // Local selection state — starts from the prop/route param, falls back to first device
    const [activeDeviceId, setActiveDeviceId] = useState<number | null>(deviceId ?? null);

    useEffect(() => {
        if (deviceId) {
            setActiveDeviceId(deviceId);
        } else if (!activeDeviceId && deviceStatusList.length > 0) {
            setActiveDeviceId(deviceStatusList[0].device_id);
        }
    }, [deviceId, deviceStatusList, activeDeviceId]);

    const device: SystemStatusPerDevice | null = useMemo(() => {
        if (!deviceStatusList.length) return null;
        return (
            deviceStatusList.find((d) => d.device_id === activeDeviceId) ?? deviceStatusList[0]
        );
    }, [deviceStatusList, activeDeviceId]);

    // sliding_door has its own UP/STOP/DOWN controls, excluded from the simple on/off master switch
    const controllableActuators = useMemo(
        () => (device?.actuators || []).filter((a) => a.type !== 'sliding_door'),
        [device]
    );

    const allOn =
        controllableActuators.length > 0 && controllableActuators.every((a) => a.current_state);

    const handleMasterToggle = (checked: boolean) => {
        if (!canControl) return;
        controllableActuators.forEach((a) => {
            actions.setActuatorManualMode(a.id, checked);
        });
    };

    const handleToggle = (actuator: HydroActuator, checked: boolean) => {
        if (!canControl) return;
        actions.setActuatorManualMode(actuator.id, checked);
    };

    // ✅ NEW — set back to automatic (manual_state = null), same semantics as ActuatorCard
    const handleAuto = (actuator: HydroActuator) => {
        if (!canControl) return;
        actions.setActuatorManualMode(actuator.id, null);
    };

    const handleSlidingDoor = (actuator: HydroActuator, direction: 'up' | 'stop' | 'down') => {
        if (!canControl) return;
        if (direction === 'stop') {
            actions.stopActuator(actuator.id);
        } else {
            actions.setActuatorManualMode(actuator.id, direction === 'up');
        }
    };

    // ✅ Schedule counts per actuator — same fetch pattern as ActuatorCard
    const [scheduleCounts, setScheduleCounts] = useState<Record<number, number>>({});
    const [scheduleManagerActuator, setScheduleManagerActuator] = useState<HydroActuator | null>(null);

    useEffect(() => {
        if (!device?.actuators?.length) return;
        let mounted = true;

        Promise.all(
            device.actuators.map((a) =>
                scheduleActions.fetchByActuator(a.id).then((data) => [a.id, data?.length ?? 0] as const)
            )
        ).then((results) => {
            if (!mounted) return;
            setScheduleCounts(Object.fromEntries(results));
        });

        return () => {
            mounted = false;
        };
    }, [device?.actuators]);

    const refreshScheduleCount = (actuatorId: number) => {
        scheduleActions.fetchByActuator(actuatorId).then((data) => {
            setScheduleCounts((prev) => ({ ...prev, [actuatorId]: data?.length ?? 0 }));
        });
    };

    if (loading && !device) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size={32} />
            </div>
        );
    }

    if (!device) {
        return (
            <div className="text-center py-20 text-sm text-gray-500 dark:text-gray-400">
                {t('noDevicesFound')}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header — location name + device switcher + master switch */}
            <div className="flex items-center justify-between px-1 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <IconHome2 size={22} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                        {device.location || device.device_name}
                    </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* ✅ Device switcher — same pattern as HydroponicSystemPage */}
                    {deviceStatusList.length > 1 && (
                        <DropdownButton
                            label={
                                <div className="flex items-center gap-2">
                                    <IconArtboard size={16} />
                                    <span className="hidden sm:inline">
                                        {device.device_name || `Device ${device.device_id}`}
                                    </span>
                                </div>
                            }
                            items={deviceStatusList.map((d) => ({
                                label: d.device_name || `Device ID ${d.device_id}`,
                                value: d.device_id.toString(),
                            }))}
                            onSelect={(item) => setActiveDeviceId(Number(item.value))}
                            size="sm"
                            className="bg-transparent"
                        />
                    )}

                    {canControl ? (
                        <FormToggle
                            id="master-switch"
                            checked={allOn}
                            onChange={(e) => handleMasterToggle(e.target.checked)}
                        />
                    ) : (
                        <span className="text-xs text-gray-400">Read only</span>
                    )}
                </div>
            </div>

            {/* Body — responsive card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {device.actuators.map((actuator) => {
                    const { Icon, color, animation } = getActuatorIcon(actuator.type);
                    const isSlidingDoor = actuator.type === 'sliding_door';
                    const isActive = actuator.current_state;
                    const scheduleCount = scheduleCounts[actuator.id] ?? 0;
                    // ✅ NEW — same mode derivation as ActuatorCard
                    const manualState = actuator.manual_state ?? null;
                    const modeManual =
                        manualState === null
                            ? "AUTO"
                            : manualState
                                ? "MANUAL_ON"
                                : "MANUAL_OFF";
                    const reasonMeta = getActuatorReason(actuator.automation_reason);

                    // ✅ NEW — status label: sliding doors read as Up/Down, everything else On/Off
                    const statusLabel = isSlidingDoor
                        ? (isActive ? t('badge_status.up') : t('badge_status.down'))
                        : (isActive ? t('badge_status.on') : t('badge_status.off'));
                    return (
                        <div
                            key={actuator.id}
                            className={`
                                        rounded-2xl p-4 flex flex-col justify-between aspect-square
                                        border border-gray-100 dark:border-white/5 shadow-sm transition-colors
                                        ${isActive
                                    ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900'
                                    : 'bg-white dark:bg-gray-900'}
                        `}
                        >
                            <div className="flex items-start justify-between">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-white/70 dark:bg-white/10' : 'bg-gray-100 dark:bg-gray-800'}
                  `}
                                >
                                    <Icon size={20} className={`
            ${isActive ? color : 'text-gray-400'}
            transition-all duration-300
            ${isActive ? animation : ""}
        `} />
                                </div>

                                <div className="flex items-center gap-2">

                                    {/* ✅ Schedule button — opens ScheduleManager, shows count badge */}
                                    {canControl && (
                                        <div className="relative">
                                            <Button
                                                variant="secondary"
                                                icon={<IconClock size={14} />}
                                                iconOnly
                                                label="Schedules"
                                                className="bg-transparent"
                                                size="xs"
                                                rounded="full"
                                                onClick={() => setScheduleManagerActuator(actuator)}
                                            />
                                            {scheduleCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[0.55rem] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                                    {scheduleCount}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* ✅ CHANGED — non-sliding-door actuators now get Auto/On/Off instead of a plain toggle */}
                                    {!isSlidingDoor && canControl && (
                                        <ButtonGroup>
                                            <Button
                                                label="Auto"
                                                variant="secondary"
                                                size="xxs"
                                                onClick={() => handleAuto(actuator)}
                                                disabled={!actuator.is_active || modeManual === "AUTO"}
                                            />
                                            <Button
                                                label="On"
                                                variant="secondary"
                                                size="xxs"
                                                onClick={() => handleToggle(actuator, true)}
                                                disabled={!actuator.is_active || modeManual === "MANUAL_ON"}
                                            />
                                            <Button
                                                label="Off"
                                                variant="secondary"
                                                size="xxs"
                                                onClick={() => handleToggle(actuator, false)}
                                                disabled={!actuator.is_active || modeManual === "MANUAL_OFF"}
                                            />
                                        </ButtonGroup>
                                    )}

                                    {/* Read-only fallback keeps a disabled toggle for quick visual state */}
                                    {!isSlidingDoor && !canControl && (
                                        <FormToggle
                                            id={`toggle-${actuator.id}`}
                                            checked={isActive}
                                            onChange={() => { }}
                                            className="opacity-50 pointer-events-none"
                                        />
                                    )}
                                </div>


                            </div>

                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                    {actuator.name}
                                </p>
                                {/* <p className={`text-xs ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                    {isActive ? t('badge_status.on') : t('badge_status.off')}
                                </p>
                                 */}
                                <p className={`text-xs ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                    {statusLabel}
                                </p>

                                {/* ✅ NEW — mode line (Auto / Manual On / Manual Off), with reason when Auto + active */}
                                <p className="text-[10px] mt-0.5">
                                    <span
                                        className={
                                            modeManual === "AUTO"
                                                ? "text-blue-500"
                                                : modeManual === "MANUAL_ON"
                                                    ? "text-green-600"
                                                    : "text-red-500"
                                        }
                                    >
                                        {modeManual === "AUTO"
                                            ? "Auto"
                                            : modeManual === "MANUAL_ON"
                                                ? "Manual On"
                                                : "Manual Off"}
                                    </span>
                                    {modeManual === "AUTO" && isActive && reasonMeta.label && (
                                        <span className={`ml-1 ${reasonMeta.color}`}>
                                            ({reasonMeta.label})
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* sliding_door special control */}
                            {isSlidingDoor && (
                                <div className="flex items-center justify-between gap-1 mt-3">
                                    <Button
                                        icon={<IconChevronUp size={14} />}
                                        iconOnly
                                        label="Up"
                                        variant="secondary"
                                        size="xs"
                                        rounded="full"
                                        disabled={!canControl}
                                        onClick={() => handleSlidingDoor(actuator, 'up')}
                                    />
                                    <Button
                                        icon={<IconPlayerStop size={14} />}
                                        iconOnly
                                        label="Stop"
                                        variant="secondary"
                                        size="xs"
                                        rounded="full"
                                        disabled={!canControl}
                                        onClick={() => handleSlidingDoor(actuator, 'stop')}
                                    />
                                    <Button
                                        icon={<IconChevronDown size={14} />}
                                        iconOnly
                                        label="Down"
                                        variant="secondary"
                                        size="xs"
                                        rounded="full"
                                        disabled={!canControl}
                                        onClick={() => handleSlidingDoor(actuator, 'down')}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ✅ Reused as-is from the dashboard — handles the schedule list + ScheduleForm add/edit internally */}
            {scheduleManagerActuator && (
                <ScheduleManager
                    isOpen={!!scheduleManagerActuator}
                    onClose={() => setScheduleManagerActuator(null)}
                    actuatorId={scheduleManagerActuator.id}
                    actuatorName={scheduleManagerActuator.name}
                    onChanged={() => refreshScheduleCount(scheduleManagerActuator.id)}

                />
            )}

        </div>
    );
};

export default SmartHomeView;