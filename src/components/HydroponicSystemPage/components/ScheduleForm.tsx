// src/components/HydroponicSystemPage/components/ScheduleForm.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { FormToggle, FormInput, FormGroup, FormLabel } from '../../common/Form';
import Button from '../../common/Button';
import { motion } from 'framer-motion';
import { useAlert } from "../../../contexts/alertContext";
import type { HydroScheduleCreate } from '../../../models/interfaces/HydroSchedule';

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface Props {
    isOpen: boolean;
    actuatorId: number;
    actuatorName: string;
    onSubmit: (data: HydroScheduleCreate) => Promise<void>; // ✅ async
    onClose: () => void;
}

const ScheduleForm: React.FC<Props> = ({
    isOpen,
    actuatorId,
    actuatorName,
    onSubmit,
    onClose
}) => {
    const { setAlert } = useAlert();

    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("20:00");
    const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    // ✅ Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setStartTime("08:00");
            setEndTime("20:00");
            setSelectedDays(DAYS);
            setIsActive(true);
        }
    }, [isOpen]);

    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

        // ✅ Convert HH:mm → minutes
    const toMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };


    const handleSubmit = async () => {
        // ✅ Validate days
        if (selectedDays.length === 0) {
            setAlert({
                message: "Please select at least one day.",
                type: "error",
            });
            return;
        }

        // ✅ Validate time input
        if (!startTime || !endTime) {
            setAlert({
                message: "Start time and end time are required.",
                type: "error",
            });
            return;
        }

        const start = toMinutes(startTime);
        const end = toMinutes(endTime);

        // ✅ Validate logical time
        if (start >= end) {
            setAlert({
                message: "End time must be after start time.",
                type: "error",
            });
            return;
        }

        const payload: HydroScheduleCreate = {
            actuator_id: actuatorId,
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`,
            repeat_days: selectedDays.join(","),
            is_active: isActive,
        };

        try {
            setLoading(true);

            await onSubmit(payload);

            setAlert({
                message: `${actuatorName} scheduled: ${startTime} → ${endTime}`,
                type: "success",
            });

            onClose();
        } catch (error: any) {
            setAlert({
                message: error?.message || "Failed to create schedule.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Schedule"
            size="small"
            content={
                <div className="px-10 pb-4 space-y-5">
                    {/* ⏰ Time Picker */}
                    <div className="flex gap-4">
                        <FormGroup className="flex-1">
                            <FormLabel htmlFor="start-time">Start</FormLabel>
                            <FormInput
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup className="flex-1">
                            <FormLabel htmlFor="end-time">End</FormLabel>
                            <FormInput
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </FormGroup>
                    </div>
                    {/* 📅 Repeat Days (Animated) */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm">Repeat Days</label>
                            <span className="text-xs text-gray-500">
                                {selectedDays.length}/7 selected
                            </span>
                        </div>

                        {/* Day Selector Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {DAYS.map((day) => {
                                const selected = selectedDays.includes(day);
                                return (
                                    <motion.div
                                        key={day}
                                        whileTap={{ scale: 0.9 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <Button
                                            label={day.toUpperCase()}
                                            size="xxs"
                                            rounded="full"
                                            variant={selected ? "primary" : "secondary"}
                                            onClick={() => toggleDay(day)}
                                            className="w-full"
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Optional Quick Presets */}
                        <div className="flex justify-end gap-2 mt-3">
                            <Button
                                size="xxs"
                                label="Weekdays"
                                onClick={() => setSelectedDays(["mon", "tue", "wed", "thu", "fri"])}
                                variant='outline'
                                rounded='full'
                            />
                            <Button
                                size="xxs"
                                label="Weekend"
                                onClick={() => setSelectedDays(["sat", "sun"])}
                                variant='outline'
                                rounded='full'
                            />
                            <Button
                                size="xxs"
                                label="All"
                                onClick={() => setSelectedDays(DAYS)}
                                variant='outline'
                                rounded='full'
                            />
                        </div>
                    </div>

                    {/* ✅ Active Toggle */}
                    <div className="flex items-center gap-2">
                        <FormToggle
                            id="schedule-active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span className="text-sm">Active</span>
                    </div>

                </div>
            }
            actions={
                <div className="flex gap-4">
                    <Button
                        label={loading ? 'Saving...' : 'Save Schedule'}
                        variant="danger"
                        onClick={handleSubmit}
                        className='min-w-[150px]'
                        rounded='lg'
                    />
                    <Button
                        label="Cancel"
                        variant="secondary"
                        onClick={onClose}
                        className='min-w-[150px]'
                        rounded='lg'
                    />
                </div>
            }
        />
    );
};

export default ScheduleForm;