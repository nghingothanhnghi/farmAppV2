import React from 'react';
import type { HydroActuator } from '../../../models/interfaces/HydroSystem';
import Button from '../../common/Button';
import ButtonGroup from '../../common/ButtonGroup';
import Badge from '../../common/Badge';
import { FormToggle } from '../../../components/common/Form';
import { IconClock, IconEdit } from '@tabler/icons-react';

import { useSchedule } from '../../../hooks/useSchedule';
import { useHydroSystem } from '../../../hooks/useHydroSystem';
import { getActuatorIcon, getActuatorReason } from '../../../utils/actuator';

import { HoverSlideIn } from "../../common/HoverSlideIn";

import ScheduleManager from './ScheduleManager';
import ActuatorModalConfig from './ActuatorModalConfig';

interface ActuatorCardProps {
    actuator: HydroActuator;
    allActuators: HydroActuator[];
    loading?: boolean;
    variant?: "control" | "linked"; // control = buttons, linked = toggle
    onToggle?: (id: number, active: boolean) => void;
    onManualModeChange?: (id: number, state: boolean | null) => void;
    onUpdated?: () => void; // callback to parent after actuator is updated
}

const ActuatorCard: React.FC<ActuatorCardProps> = ({
    actuator,
    allActuators,
    loading = false,
    variant = "control",
    onToggle,
    onManualModeChange,
    onUpdated,
}) => {

    const isActive = actuator.current_state; // real-time ON/OFF state

    const { Icon, color } = getActuatorIcon(actuator.type);

    console.log('Rendering ActuatorCard State:', {
        variant,
        current_state: actuator.current_state,
        is_active: actuator.is_active,
        isActive
    });

    const { actions } = useHydroSystem();

    const [openEdit, setOpenEdit] = React.useState(false);

    // ✅ single state for the schedule manager modal
    const [openScheduleManager, setOpenScheduleManager] = React.useState(false);
    const { actions: scheduleActions } = useSchedule();

    const [scheduleCount, setScheduleCount] = React.useState<number>(0);

    React.useEffect(() => {
        let mounted = true;
        scheduleActions.fetchByActuator(actuator.id).then((data) => {
            if (mounted) setScheduleCount(data?.length ?? 0);
        });
        return () => { mounted = false; };
    }, [actuator.id]);

    const [isHovered, setIsHovered] = React.useState(false);

    const manualState = actuator.manual_state ?? null;

    const modeManual =
        manualState === null
            ? "AUTO"
            : manualState
                ? "MANUAL_ON"
                : "MANUAL_OFF";

    const reasonMeta = getActuatorReason(actuator.automation_reason);

    return (
        <div
            className="bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-2 relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <HoverSlideIn
                isHovered={isHovered}
                from="right"
                className="absolute right-2 top-2 z-10"
            >
                <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 py-0.5 px-1 rounded-full shadow-md">
                    {variant === "control" && onManualModeChange && (
                        <ButtonGroup className='ms-1'>
                            {/* AUTO */}
                            <Button
                                label="Auto"
                                variant='secondary'
                                onClick={() => onManualModeChange?.(actuator.id, null)}
                                disabled={loading || !actuator.is_active || modeManual === "AUTO"}
                                size="xs"
                            />

                            {/* MANUAL ON */}
                            <Button
                                label="On"
                                variant='secondary'
                                onClick={() => onManualModeChange?.(actuator.id, true)}
                                disabled={loading || !actuator.is_active || modeManual === "MANUAL_ON"}
                                size="xs"
                            />

                            {/* MANUAL OFF */}
                            <Button
                                label="Off"
                                variant='secondary'
                                onClick={() => onManualModeChange?.(actuator.id, false)}
                                disabled={loading || !actuator.is_active || modeManual === "MANUAL_OFF"}
                                size="xs"
                            />
                        </ButtonGroup>

                    )}
                    {variant === "linked" && onToggle && (
                        <FormToggle
                            id={`toggle-${actuator.id}`}
                            checked={actuator.is_active}
                            onChange={(e) => onToggle(actuator.id, e.target.checked)}
                        />
                    )}

                    {/* ✅ ONE clock button, opens ScheduleManager, shows count badge */}
                    <div className="relative">
                        <Button
                            variant="secondary"
                            icon={<IconClock size={16} />}
                            iconOnly
                            className='bg-transparent'
                            onClick={() => setOpenScheduleManager(true)}
                            rounded='full'
                            size='sm'
                        />
                        {scheduleCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[0.55rem] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                {scheduleCount}
                            </span>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        icon={<IconEdit size={16} />}
                        iconOnly
                        className="bg-transparent"
                        onClick={() => setOpenEdit(true)}
                        rounded="full"
                        size="sm"
                    />
                </div>
            </HoverSlideIn>
            <div className='flex items-center justify-between mb-1'>
                <div className="flex items-center space-x-2">
                    <span className="text-lg"><Icon size={18} className={color} /></span>
                    <div className='flex-1'>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-[0.625rem] font-medium text-gray-700 dark:text-gray-300">{actuator.name}</h3>
                            <div className="flex items-center space-x-1">
                                {/* STATUS DOT */}
                                <div
                                    className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                />

                                {/* STATUS TEXT */}
                                <span
                                    className={`text-[0.625rem] ${isActive ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                >
                                    {isActive ? 'Running' : 'Stopped'}
                                </span>
                                {/* MODE */}
                                <span
                                    className={
                                        modeManual === "AUTO"
                                            ? "text-blue-500 text-[0.625rem]"
                                            : modeManual === "MANUAL_ON"
                                                ? "text-green-600 text-[0.625rem]"
                                                : "text-red-500 text-[0.625rem]"
                                    }
                                >
                                    {modeManual === "AUTO"
                                        ? "Auto"
                                        : modeManual === "MANUAL_ON"
                                            ? "Manual On"
                                            : "Manual Off"}
                                </span>
                                {modeManual === "AUTO" && isActive && reasonMeta.label && (
                                    <span className={`text-[0.6rem] ml-1 ${reasonMeta.color}`}>
                                        ({reasonMeta.label})
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-[0.625rem] text-gray-500">
                            Kênh: Pin {actuator.pin} • Port {actuator.port}
                        </p>
                        {!actuator.is_active && (
                            <Badge label='Interrupted' variant='warning' size='xsmall' />
                        )}
                    </div>
                </div>
            </div>

            {actuator.sensor_key && (
                <p className="text-xs text-gray-600">
                    Linked to: {actuator.sensor_key}
                    {actuator.linked_sensor_value !== null && (
                        <> (Value: {actuator.linked_sensor_value})</>
                    )}
                </p>
            )}

            {/* ✅ Only ScheduleManager here — it owns its own ScheduleForm internally */}
            <ScheduleManager
                isOpen={openScheduleManager}
                onClose={() => setOpenScheduleManager(false)}
                actuatorId={actuator.id}
                actuatorName={actuator.name}
                onChanged={() => {
                    scheduleActions.fetchByActuator(actuator.id).then((d) => setScheduleCount(d?.length ?? 0));
                }}
            />

            <ActuatorModalConfig
                isOpen={openEdit}
                onClose={() => setOpenEdit(false)}
                actuator={actuator}
                usedPins={allActuators
                    .filter(a => a.id !== actuator.id)
                    .map(a => `${a.pin}`)
                    .filter(Boolean)}
                onSubmit={async (id, data) => {
                    await actions.patchActuator(id, data);
                    await onUpdated?.(); // 👈 REFRESH LIST
                }}
            />
        </div>
    );
};

export default ActuatorCard;
