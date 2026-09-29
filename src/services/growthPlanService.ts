// src/services/growthPlanService.ts
import apiClient from '../api/client';
import type {
  GrowthPlan,
  GrowthPlanCreate,
  GrowthPlanUpdate,
  GrowthPlanWithStages,
} from '../models/interfaces/GrowthPlan';

export const growthPlanService = {
  async createGrowthPlan(data: GrowthPlanCreate): Promise<GrowthPlan> {
    const res = await apiClient.post('/growth-plans/', data);
    return res.data;
  },

  async getGrowthPlansByPlant(plantId: number): Promise<GrowthPlan[]> {
    const res = await apiClient.get(`/growth-plans/plant/${plantId}`);
    return res.data;
  },

  async getGrowthPlan(planId: number): Promise<GrowthPlan> {
    const res = await apiClient.get(`/growth-plans/${planId}`);
    return res.data;
  },

  async getGrowthPlanWithStages(planId: number): Promise<GrowthPlanWithStages> {
    const res = await apiClient.get(`/growth-plans/${planId}/stages`);
    return res.data;
  },

  async updateGrowthPlan(planId: number, data: GrowthPlanUpdate): Promise<GrowthPlan> {
    const res = await apiClient.put(`/growth-plans/${planId}`, data);
    return res.data;
  },

  async deleteGrowthPlan(planId: number): Promise<void> {
    await apiClient.delete(`/growth-plans/${planId}`);
  },
};