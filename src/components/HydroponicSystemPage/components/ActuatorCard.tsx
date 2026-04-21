import React from 'react';
import type { HydroActuator } from '../../../models/interfaces/HydroSystem';
import Button from '../../common/Button';
import ButtonGroup from '../../common/ButtonGroup';
import Badge from '../../common/Badge';
import { FormToggle } from '../../../components/common/Form';
import { IconClock, IconEdit } from '@tabler/icons-react';
import ScheduleForm from './ScheduleForm';
import { useSchedule } from '../../../hooks/useSchedule';
import { useHydroSystem } from '../../../hooks/useHydroSystem';
import { getActuatorIcon } from '../../../utils/actuator';

import ActuatorModalConfig from './ActuatorModalConfig';

interface ActuatorCardProps {
    actuator: HydroActuator;
    loading?: boolean;
    variant?: "control" | "linked"; // control = buttons, linked = toggle
    onToggle?: (id: number, active: boolean) => void;
    onControl?: (id: number, turnOn: boolean) => void;
}

const ActuatorCard: React.FC<ActuatorCardProps> = ({
    actuator,
    loading = false,
    variant = "control",
    onToggle,
    onControl,
}) => {

    const isActive = actuator.current_state; // real-time ON/OFF state

    const { Icon, color, bg, hover } = getActuatorIcon(actuator.type);

    // const colors = getActuatorColor(actuator.type);

    console.log('Rendering ActuatorCard State:', {
        variant,
        current_state: actuator.current_state,
        is_active: actuator.is_active,
        isActive
    });

    const { actions } = useHydroSystem();

    const [openEdit, setOpenEdit] = React.useState(false);

    const [openSchedule, setOpenSchedule] = React.useState(false);
    const [mode, setMode] = React.useState<"create" | "edit">("create");
    const [selectedSchedule, setSelectedSchedule] = React.useState<any>(null);
    const { actions: scheduleActions } = useSchedule();

    return (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-2">
            <div className='flex items-center justify-between mb-1'>
                <div className="flex items-center space-x-2">
                    <span className="text-lg"><Icon size={18} className={color} /></span>
                    <div className='flex-1'>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-[0.625rem] font-medium text-gray-700 dark:text-gray-300">{actuator.name}</h3>
                            <div className="flex items-center space-x-1">
                                <div
                                    className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-400'}`}
                                />
                                <span className="text-[0.625rem] text-gray-600">
                                    <span
                                        className={` ${isActive ? 'text-green-600' : 'text-gray-400'}`}
                                    >
                                        {isActive ? 'Opened' : 'Off'}
                                    </span>
                                </span>
                            </div>
                            {!actuator.is_active && (
                                <Badge label='Interrupted' variant='warning' size='xsmall' />
                            )}
                        </div>
                        <p className="text-[0.625rem] text-gray-500">
                            {actuator.type} • Pin {actuator.pin} • Port {actuator.port}
                        </p>
                    </div>
                </div>
                <div className='flex flex-1 justify-end items-center space-x-2'>
                    {variant === "control" && onControl && (
                        <ButtonGroup>
                            <Button
                                label="On"
                                onClick={() => onControl(actuator.id, true)}
                                disabled={loading || isActive || !actuator.is_active}
                                className={`flex-1 ${isActive || !actuator.is_active
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : `${bg} ${hover} text-white`
                                    }`}
                                size="xs"
                                variant="secondary"
                            />
                            <Button
                                label="Off"
                                onClick={() => onControl(actuator.id, false)}
                                disabled={loading || !isActive || !actuator.is_active}
                                className={`flex-1 ${!isActive || !actuator.is_active
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                                size="xs"
                                variant="secondary"
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
                    <Button
                        variant="secondary"
                        icon={<IconClock size={16} />}
                        iconOnly
                        className='bg-transparent'
                        onClick={async () => {
                            const data = await scheduleActions.fetchByActuator(actuator.id);

                            if (data && data.length > 0) {
                                setMode("edit");
                                setSelectedSchedule(data[0]);
                            } else {
                                setMode("create");
                                setSelectedSchedule(null);
                            }

                            setOpenSchedule(true);
                        }}
                        rounded='full'
                        size='sm'
                    />
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

            </div>

            {actuator.sensor_key && (
                <p className="text-xs text-gray-600">
                    Linked to: {actuator.sensor_key}
                    {actuator.linked_sensor_value !== null && (
                        <> (Value: {actuator.linked_sensor_value})</>
                    )}
                </p>
            )}

            <ScheduleForm
                isOpen={openSchedule}
                onClose={() => setOpenSchedule(false)}
                actuatorId={actuator.id}
                actuatorName={actuator.name}
                mode={mode}
                initialData={selectedSchedule}
                scheduleId={selectedSchedule?.id}
                onSubmit={scheduleActions.createSchedule}
                onUpdate={scheduleActions.updateSchedule}
            />

            <ActuatorModalConfig
                isOpen={openEdit}
                onClose={() => setOpenEdit(false)}
                actuator={actuator}
                onSubmit={async (id, data) => {
                    await actions.patchActuator(id, data);

                    // optional but recommended for instant refresh
                    await actions.refreshData();
                }}
            />
        </div>
    );
};

export default ActuatorCard;
