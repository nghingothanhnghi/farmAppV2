import apiClient from '../api/client';
import type { PlantBatch } from '../models/interfaces/PlantBatch';
import type { GrowthStage } from '../models/interfaces/GrowthStage';
import type { GrowthRecipe } from '../models/interfaces/GrowthRecipe';


export const plantBatchService = {
  // 🌱 BATCH
  async createBatch(data: Partial<PlantBatch>) {
    const res = await apiClient.post('/batches', data);
    return res.data;
  },

  async getBatches(): Promise<PlantBatch[]> {
    const res = await apiClient.get('/batches');
    return res.data;
  },

  async getBatch(id: number): Promise<PlantBatch> {
    const res = await apiClient.get(`/batches/${id}`);
    return res.data;
  },

  async setStage(batchId: number, stageId: number) {
    const res = await apiClient.post(
      `/batches/${batchId}/set-stage/${stageId}`
    );
    return res.data;
  },

  // 🌿 STAGES
  async createStage(data: Partial<GrowthStage>) {
    const res = await apiClient.post('/batches/stages', data);
    return res.data;
  },

  async getStagesByPlant(plantId: number): Promise<GrowthStage[]> {
    const res = await apiClient.get(`/batches/stages/plant/${plantId}`);
    return res.data;
  },

  // ⚙️ RECIPES
  async createRecipe(data: Partial<GrowthRecipe>) {
    const res = await apiClient.post('/batches/recipes', data);
    return res.data;
  }
};