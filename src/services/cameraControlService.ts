import apiClient from "../api/client";
import type { Direction } from "../models/interfaces/Camera";

export const cameraControlService = {
  // ⚠️ Endpoint path is an assumption — align with your PTZ/device backend.
  async move(location: string, direction: Direction, step: number) {
    const res = await apiClient.post(
      `/camera-control/location/${encodeURIComponent(location)}/move`,
      { direction, step }
    );
    return res.data;
  },
};