import { useState, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import type {
  HydroScheduleOut,
  HydroScheduleCreate,
  HydroScheduleUpdate
} from '../models/interfaces/HydroSchedule';

export const useSchedule = () => {
  const [schedules, setSchedules] = useState<HydroScheduleOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByActuator = useCallback(async (actuatorId: number) => {
    setLoading(true);
    try {
      const data = await scheduleService.getByActuator(actuatorId);
      setSchedules(data);
    } catch {
      setError('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = async (data: HydroScheduleCreate) => {
    try {
      const newItem = await scheduleService.create(data);
      setSchedules(prev => [...prev, newItem]);
    } catch {
      setError('Failed to create schedule');
    }
  };

  const updateSchedule = async (id: number, data: HydroScheduleUpdate) => {
    try {
      const updated = await scheduleService.update(id, data);
      setSchedules(prev =>
        prev.map(s => (s.id === id ? updated : s))
      );
    } catch {
      setError('Failed to update schedule');
    }
  };

  const deleteSchedule = async (id: number) => {
    try {
      await scheduleService.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch {
      setError('Failed to delete schedule');
    }
  };

  return {
    schedules,
    loading,
    error,
    actions: {
      fetchByActuator,
      createSchedule,
      updateSchedule,
      deleteSchedule,
    },
  };
};