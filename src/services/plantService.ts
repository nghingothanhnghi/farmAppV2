import apiClient from '../api/client';
import type { Plant } from "../models/interfaces/Plant";

export const plantService = {
  // -----------------------------
  // Get all plants
  // -----------------------------
  async getPlants(): Promise<Plant[]> {
    const res = await apiClient.get("/batches/plants");
    return res.data;
  },

  // -----------------------------
  // Create plant
  // -----------------------------
  async createPlant(data: Partial<Plant>): Promise<Plant> {
    const res = await apiClient.post("/batches/plants", data);
    return res.data;
  },
};