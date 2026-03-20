import apiClient from '../api/client';
import type {
  HydroScheduleCreate,
  HydroScheduleUpdate,
  HydroScheduleOut
} from '../models/interfaces/HydroSchedule';

export const scheduleService = {
  create: async (data: HydroScheduleCreate): Promise<HydroScheduleOut> => {
    const res = await apiClient.post('/schedules/', data);
    return res.data;
  },

  getById: async (id: number): Promise<HydroScheduleOut> => {
    const res = await apiClient.get(`/schedules/${id}`);
    return res.data;
  },

  getByActuator: async (actuatorId: number): Promise<HydroScheduleOut[]> => {
    const res = await apiClient.get(`/schedules/actuator/${actuatorId}`);
    return res.data;
  },

  update: async (id: number, data: HydroScheduleUpdate): Promise<HydroScheduleOut> => {
    const res = await apiClient.patch(`/schedules/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<{ detail: string }> => {
    const res = await apiClient.delete(`/schedules/${id}`);
    return res.data;
  },
};