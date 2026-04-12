// src/hooks/useGrowthStages.ts
import { useState } from "react";
import { plantBatchService } from "../services/plantBatchService";
import type { GrowthStage } from "../models/interfaces/GrowthStage";
import type { GrowthStageCreate } from "../models/interfaces/GrowthStage";
import type { GrowthRecipe } from "../models/interfaces/GrowthRecipe";
import type { GrowthRecipeCreate } from "../models/interfaces/GrowthRecipe";

export function useGrowthStages() {
  const [stages, setStages] = useState<GrowthStage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStages = async (plantId: number) => {
    try {
      setLoading(true);
      const data = await plantBatchService.getStagesByPlant(plantId);
      setStages(data);
    } finally {
      setLoading(false);
    }
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
    createStage,
    updateStage,
    updateStageWithRecipes,
    deleteStage,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}