// src/components/HydroponicSystemPage/components/ScheduleForm.tsx
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
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
      content={
        <div className="space-y-4">
          {/* Time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm">End</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>

          {/* Repeat Days */}
          <div>
            <label className="text-sm mb-1 block">Repeat Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-2 py-1 rounded text-sm border ${
                    selectedDays.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {day.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            <span>Active</span>
          </div>
        </div>
      }
      actions={
        <div className="flex gap-2">
          <Button
            label="Cancel"
            onClick={onClose}
            variant="secondary"
          />
          <Button
            label="Save Schedule"
            onClick={handleSubmit}
            className="bg-blue-500 text-white"
          />
        </div>
      }
    />
  );
};

export default ScheduleForm;