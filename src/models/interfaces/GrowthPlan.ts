// src/models/interfaces/GrowthPlan.ts
import type { GrowthStage } from "./GrowthStage";

export interface GrowthPlan {
  id: number;
  plant_id: number;
  name: string;
  description?: string | null;
  is_default: boolean;
  batch_count: number; // ✅ NEW:
}

// ✅ NEW: item shape unconfirmed, formatted defensively in the UI
export interface GrowthPlanValidation {
  plan_id: number;
  stage_count: number;
  gaps: unknown[];
  overlaps: unknown[];
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