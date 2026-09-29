// src/models/interfaces/GrowthStage.ts
import type { GrowthRecipe } from "./GrowthRecipe";

export interface GrowthStage {
  id: number;
  plant_id: number;
  plan_id?: number | null;
  name: string;
  day_start: number;
  day_end: number;

  recipes?: GrowthRecipe[];
}

export type GrowthStageCreate = Omit<GrowthStage, "id" | "plant_id">;