// src/components/HydroponicSystemPage/components/ScheduleForm.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { FormToggle, FormInput, FormGroup, FormLabel } from '../../common/Form';
import Button from '../../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import type { HydroScheduleCreate } from '../../../models/interfaces/HydroSchedule';

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface Props {
    isOpen: boolean;
    actuatorId: number;
    onSubmit: (data: HydroScheduleCreate) => void;
    onClose: () => void;
}

const ScheduleForm: React.FC<Props> = ({
    isOpen,
    actuatorId,
    onSubmit,
    onClose
}) => {
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("20:00");
    const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
    const [isActive, setIsActive] = useState(true);

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

    const handleSubmit = () => {
        const payload: HydroScheduleCreate = {
            actuator_id: actuatorId,
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`,
            repeat_days: selectedDays.join(","),
            is_active: isActive,
        };

        onSubmit(payload);
        onClose(); // ✅ close modal after submit
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
                        {/* <div className="flex-1">
                            <label className="text-sm">Start</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            />
                        </div> */}
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
                        {/* <div className="flex-1">
                            <label className="text-sm">End</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            />
                        </div> */}
                    </div>

                    {/* 📅 Repeat Days (Animated) */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm">Repeat Days</label>
                            <span className="text-xs text-gray-500">
                                {selectedDays.length}/7 selected
                            </span>
                        </div>

                        {/* Selected Days Preview */}
                        <AnimatePresence initial={false}>
                            {selectedDays.length > 0 && (
                                <motion.div
                                    className="flex flex-wrap gap-2 mb-3"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {selectedDays.map((day, index) => (
                                        <motion.div
                                            key={`${day}-${index}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Button
                                                label={`${day.toUpperCase()} ✕`}
                                                size="xxs"
                                                rounded="full"
                                                onClick={() => toggleDay(day)}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                                            size="xs"
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
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="xxs"
                                label="Weekdays"
                                onClick={() => setSelectedDays(["mon", "tue", "wed", "thu", "fri"])}
                            />
                            <Button
                                size="xxs"
                                label="Weekend"
                                onClick={() => setSelectedDays(["sat", "sun"])}
                            />
                            <Button
                                size="xxs"
                                label="All"
                                onClick={() => setSelectedDays(DAYS)}
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
                        label='Save Schedule'
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