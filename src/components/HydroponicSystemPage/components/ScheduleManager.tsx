import React, { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useSchedule } from '../../../hooks/useSchedule';
import { useAlert } from '../../../contexts/alertContext';
import ScheduleForm from './ScheduleForm';
import type { HydroScheduleOut } from '../../../models/interfaces/HydroSchedule';

interface Props {
    isOpen: boolean;
    actuatorId: number;
    actuatorName: string;
    onClose: () => void;
    onChanged?: () => void;
}

const ScheduleManager: React.FC<Props> = ({ isOpen, actuatorId, actuatorName, onClose, onChanged }) => {
    const { actions } = useSchedule();
    const { setAlert } = useAlert();

    const [schedules, setSchedules] = useState<HydroScheduleOut[]>([]);
    const [loading, setLoading] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<HydroScheduleOut | null>(null);

    const refresh = async () => {
        setLoading(true);
        const data = await actions.fetchByActuator(actuatorId);
        setSchedules(data ?? []);
        setLoading(false);
        onChanged?.();
    };

    useEffect(() => {
        if (isOpen) refresh();
    }, [isOpen, actuatorId]);

    const handleDelete = async (id: number) => {
        try {
            await actions.deleteSchedule(id);
            setAlert({ message: "Schedule deleted", type: "success" });
            refresh();
        } catch (e: any) {
            setAlert({ message: e?.message || "Failed to delete schedule", type: "error" });
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Lịch trình - ${actuatorName}`}
                size="small"
                content={
                    <div className="px-6 pb-4 space-y-3">
                        {loading && <p className="text-sm text-gray-500">Loading...</p>}

                        {!loading && schedules.length === 0 && (
                            <p className="text-sm text-gray-500">No schedules yet for this actuator.</p>
                        )}

                        {schedules.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between rounded-lg dark:bg-gray-800 border border-gray-200 dark:border-white/5 px-3 py-2"
                            >
                                <div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {s.start_time.slice(0, 5)} → {s.end_time.slice(0, 5)}
                                    </div>
                                    <div className="text-[11px] text-gray-500 flex items-center gap-2">
                                        {s.repeat_days.split(",").join(", ")}
                                        {!s.is_active && <Badge label="Inactive" variant="warning" size="xsmall" />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="secondary"
                                        icon={<IconEdit size={14} />}
                                        iconOnly
                                        rounded="full"
                                        size="xs"
                                        onClick={() => {
                                            setFormMode("edit");
                                            setEditing(s);
                                            setFormOpen(true);
                                        }}
                                    />
                                    <Button
                                        variant="danger"
                                        icon={<IconTrash size={14} />}
                                        iconOnly
                                        rounded="full"
                                        size="xs"
                                        onClick={() => handleDelete(s.id)}
                                    />
                                </div>
                            </div>
                        ))}

                        <Button
                            label="Add schedule window"
                            icon={<IconPlus size={14} />}
                            variant="outline"
                            iconPosition='left'
                            rounded="lg"
                            className="w-full"
                            onClick={() => {
                                setFormMode("create");
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        />
                    </div>
                }
                actions={
                    <Button label="Close" variant="secondary" onClick={onClose} className="min-w-[150px]" rounded="lg" />
                }
            />

            <ScheduleForm
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    refresh();
                }}
                actuatorId={actuatorId}
                actuatorName={actuatorName}
                mode={formMode}
                initialData={editing ?? undefined}
                scheduleId={editing?.id}
                onSubmit={actions.createSchedule}
                onUpdate={actions.updateSchedule}
            />
        </>
    );
};

export default ScheduleManager;