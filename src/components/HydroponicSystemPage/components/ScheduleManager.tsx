import React, { useEffect, useState, useRef } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import Spinner from '../../common/Spinner';
import { IconPencil, IconTrash, IconPlus, IconMoodEmpty } from '@tabler/icons-react';
import { useSchedule } from '../../../hooks/useSchedule';
import { useAlert } from '../../../contexts/alertContext';
import { useTranslation } from 'react-i18next';
import { getDayLabel } from '../../../constants/days';
import ScheduleForm from './ScheduleForm';
import EmptyState from '../../common/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
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
    const { t, i18n } = useTranslation();

    const [schedules, setSchedules] = useState<HydroScheduleOut[]>([]);
    const [loading, setLoading] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<HydroScheduleOut | null>(null);

    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const scheduleRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const refresh = async () => {
        setLoading(true);
        const data = await actions.fetchByActuator(actuatorId);
        setSchedules(data ?? []);
        setLoading(false);
        onChanged?.();
    };

    const focusSchedule = (id: number) => {
        setHighlightedId(id);

        requestAnimationFrame(() => {
            scheduleRefs.current[id]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        });

        setTimeout(() => {
            setHighlightedId(null);
        }, 2000);
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
                showCloseButton={false}
                title={`Lịch trình - ${actuatorName}`}
                size="small"
                position="bottom"
                content={
                    <div className="px-6 py-4 space-y-3">
                        {loading && <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"><Spinner size={20} /></div>}
                        {!loading && schedules.length === 0 && (
                            <EmptyState
                                icon={<IconMoodEmpty size={48} />}
                                message={t("info.actuator.message_01")}
                            />
                        )}
                        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                            <AnimatePresence>
                                {schedules.map((s) => {
                                    const isHighlighted = s.id === highlightedId;
                                    return (
                                        <motion.div
                                            key={s.id}
                                            ref={(el) => {
                                                scheduleRefs.current[s.id] = el;
                                            }}
                                            layout
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                backgroundColor: isHighlighted
                                                    ? "rgba(168, 85, 247, 0.15)"
                                                    : "rgba(0, 0, 0, 0)",
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -10,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center justify-between rounded-lg bg-white shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] px-3 py-2"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    {s.start_time.slice(0, 5)} → {s.end_time.slice(0, 5)}
                                                </div>

                                                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                                                    {s.repeat_days
                                                        .split(",")
                                                        .map((d) => getDayLabel(d, i18n.language))
                                                        .join(", ")}

                                                    {!s.is_active && (
                                                        <Badge
                                                            label="Inactive"
                                                            variant="warning"
                                                            size="xsmall"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="secondary"
                                                    icon={<IconPencil size={14} />}
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
                                                    variant="secondary"
                                                    icon={<IconTrash size={14} />}
                                                    iconOnly
                                                    rounded="full"
                                                    size="xs"
                                                    onClick={() => handleDelete(s.id)}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                        <Button
                            label={t("btn.add_schedule")}
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
                    <Button label={t("btn.cancel")} variant="secondary" onClick={onClose} className="min-w-[150px]" rounded="lg" />
                }
            />

            <ScheduleForm
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    // refresh();
                }}
                actuatorId={actuatorId}
                actuatorName={actuatorName}
                mode={formMode}
                initialData={editing ?? undefined}
                scheduleId={editing?.id}
                // onSubmit={actions.createSchedule}
                onSubmit={async (data) => {
                    const created = await actions.createSchedule(data);

                    setFormOpen(false);

                    await refresh();

                    if (created?.id) {
                        focusSchedule(created.id);
                    }

                    return created;
                }}
                onUpdate={actions.updateSchedule}
            />
        </>
    );
};

export default ScheduleManager;