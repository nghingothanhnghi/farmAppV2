// src/hooks/useGrowthStages.ts
import { useState } from "react";
import { plantBatchService } from "../services/plantBatchService";
import type { GrowthStage } from "../models/interfaces/GrowthStage";
import type { GrowthRecipe } from "../models/interfaces/GrowthRecipe";

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

  const createStage = async (data: Partial<GrowthStage>) => {
    const stage = await plantBatchService.createStage(data);
    setStages(prev => [...prev, stage]);
    return stage;
  };

  const createRecipe = async (data: Partial<GrowthRecipe>) => {
    return await plantBatchService.createRecipe(data);
  };

  return {
    stages,
    loading,
    fetchStages,
    createStage,
    createRecipe,
  };
}