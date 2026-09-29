// src/hooks/useGrowthStages.ts
import { useState, useRef } from "react";
import { plantBatchService } from "../services/plantBatchService";
import { growthPlanService } from "../services/growthPlanService";
import type { GrowthStage, GrowthStageCreate } from "../models/interfaces/GrowthStage";
import type { GrowthRecipe, GrowthRecipeCreate } from "../models/interfaces/GrowthRecipe";

const sortStages = (list: GrowthStage[]) =>
  [...list].sort((a, b) => a.day_start - b.day_start);

export function useGrowthStages() {
  const [stages, setStages] = useState<GrowthStage[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

    // Legacy: all stages of a plant (every plan mixed). Avoid for plan editing.
  const fetchStages = async (plantId: number) => {
    try {
      setLoading(true);
      const data = await plantBatchService.getStagesByPlant(plantId);
      setStages(data);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Stages of ONE plan (with recipes). Returns the list so callers can use it directly.
  const fetchStagesByPlan = async (planId: number): Promise<GrowthStage[]> => {
    const id = ++requestId.current;
    try {
      setLoading(true);
      const plan = await growthPlanService.getGrowthPlanWithStages(planId);
      const list = sortStages(plan.stages ?? []);
      if (id === requestId.current) setStages(list); // ignore stale responses
      return list;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };  

  const clearStages = () => {
    requestId.current++; // invalidate in-flight requests
    setStages([]);
  };

const createStage = async (
  data: GrowthStageCreate & { plant_id: number }
) => {
  const stage = await plantBatchService.createStage(data);
  setStages(prev => [...prev, stage]);
  return stage;
};

const updateStage = async (id: number, data: Partial<GrowthStage>) => {
  const stage = await plantBatchService.updateStage(id, data);
  setStages(prev => prev.map(s => (s.id === id ? stage : s)));
  return stage;
};

const updateStageWithRecipes = async (
  stageId: number,
  stage: {
    name: string;
    day_start: number;
    day_end: number;
    plan_id: number;
    recipes: Omit<GrowthRecipe, "id" | "stage_id">[];
  }
) => {
  try {
    const updated = await plantBatchService.updateStageWithRecipes(
      stageId,
      stage
    );

    setStages(prev =>
      prev.map(s => (s.id === stageId ? updated : s))
    );

    return updated;
  } catch (err) {
    console.error("Update stage with recipes failed", err);
    throw err;
  }
};

const deleteStage = async (id: number) => {
  await plantBatchService.deleteStage(id);
  setStages(prev => prev.filter(s => s.id !== id));
};

const createRecipe = async (
  data: GrowthRecipeCreate & { stage_id: number }
) => {
  return await plantBatchService.createRecipe(data);
};

const updateRecipe = async (id: number, data: Partial<GrowthRecipe>) => {
  return await plantBatchService.updateRecipe(id, data);
};

const deleteRecipe = async (id: number) => {
  return await plantBatchService.deleteRecipe(id);
};

  return {
    stages,
    loading,
    fetchStages,
    fetchStagesByPlan,
    clearStages,
    createStage,
    updateStage,
    updateStageWithRecipes,
    deleteStage,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}