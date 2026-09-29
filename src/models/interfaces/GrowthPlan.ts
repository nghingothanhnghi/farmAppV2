// src/models/interfaces/GrowthPlan.ts
import type { GrowthStage } from "./GrowthStage";

export interface GrowthPlan {
  id: number;
  plant_id: number;
  name: string;
  description?: string | null;
  is_default: boolean;
}

export interface GrowthPlanCreate {
  plant_id: number;
  name: string;
  description?: string;
  is_default?: boolean;
}

export interface GrowthPlanUpdate {
  name?: string;
  description?: string;
  is_default?: boolean;
}

export interface GrowthPlanWithStages extends GrowthPlan {
  stages: GrowthStage[];
}