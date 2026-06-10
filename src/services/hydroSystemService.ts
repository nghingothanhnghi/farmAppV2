// src/services/hydroSystemService.ts

import apiClient from '../api/client';
import type {
  SensorReading,
  SystemStatusPerDevice,
  SystemThresholds as Thresholds,
} from '../models/interfaces/HydroSystem';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const systemService = {
  // Get Hydro System Status
  async getSystemStatus(device_id?: number): Promise<SystemStatusPerDevice[]> {
    const response = await apiClient.get<SystemStatusPerDevice[]>('/hydro/status', {
      params: device_id ? { device_id } : {},
    });
    return response.data;
  },

  // Manual Mode Control
  async setActuatorManualMode(
    actuatorId: number,
    state: boolean | null
  ): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/hydro/actuator/${actuatorId}/manual`,
      { state } // IMPORTANT: must match Body(embed=True)
    );
    return response.data;
  },

  async getActuatorStatus(actuatorId: number): Promise<{ current_state: boolean }> {
    const response = await apiClient.get<{ current_state: boolean }>(
      `/hydro/actuator/${actuatorId}/status`
    );
    return response.data;
  },

  // Scheduler Controls
  async startScheduler(device_id: number): Promise<{ status: string }> {
    const response = await apiClient.post<{ status: string }>(
      '/hydro/scheduler/start',
      null,
      { params: { device_id } }
    );
    return response.data;
  },

  async stopScheduler(device_id: number): Promise<{ status: string }> {
    const response = await apiClient.post<{ status: string }>(
      '/hydro/scheduler/stop',
      null,
      { params: { device_id } }
    );
    return response.data;
  },

  async restartScheduler(device_id: number): Promise<{ status: string }> {
    const response = await apiClient.post<{ status: string }>(
      '/hydro/scheduler/restart',
      null,
      { params: { device_id } }
    );
    return response.data;
  },

  // Sensor Data
  async getLatestSensorData(): Promise<SensorReading[]> {
    const response = await apiClient.get<SensorReading[]>('/sensor/data');
    return response.data;
  },

  // Thresholds
  // async getThresholds(): Promise<Thresholds> {
  //   const response = await apiClient.get<Thresholds>('/sensor/thresholds');
  //   return response.data;
  // },
  async getThresholds(
  device_id: number
): Promise<Thresholds> {
  const response = await apiClient.get<Thresholds>(
    `/sensor/thresholds/${device_id}`
  );

  return response.data;
},

  // async updateThresholds(
  //   device_id: number,
  //   thresholds: Partial<Thresholds>
  // ): Promise<ApiResponse<Thresholds>> {
  //   const response = await apiClient.post<ApiResponse<Thresholds>>(
  //     '/sensor/thresholds',
  //     thresholds,
  //     { params: { device_id } }
  //   );
  //   return response.data;
  // }
async updateThresholds(
  device_id: number,
  thresholds: Partial<Thresholds>
): Promise<any> {

  const response = await apiClient.post(
    `/sensor/thresholds/${device_id}`,
    thresholds
  );

  return response.data;
}


};
