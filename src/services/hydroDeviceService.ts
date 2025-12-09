// src/services/hydroDeviceService.ts
import apiClient from "../api/client";
import type { HydroDevice } from "../models/interfaces/HydroSystem";

export const deviceService = {
  async getAll(): Promise<HydroDevice[]> {
    const res = await apiClient.get("/hydro/devices");
    return res.data;
  },

  async get(id: number): Promise<HydroDevice> {
    const res = await apiClient.get(`/hydro/devices/${id}`);
    return res.data;
  },

  async create(data: Partial<HydroDevice>): Promise<HydroDevice> {
    const res = await apiClient.post("/hydro/devices", data);
    return res.data;
  },

  async update(id: number, data: Partial<HydroDevice>): Promise<HydroDevice> {
    const res = await apiClient.put(`/hydro/devices/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/hydro/devices/${id}`);
  },

  async activateDevice(device_id: number): Promise<HydroDevice> {
    const res = await apiClient.post(`/hydro/device/${device_id}/activate`);
    return res.data;
  },

  async deactivateDevice(device_id: number): Promise<HydroDevice> {
    const res = await apiClient.post(`/hydro/devices/${device_id}/deactivate`);
    return res.data;
  }

};
