export interface GrowthStage {
  id: number;
  plant_id: number;
  name: string;
  day_start: number;
  day_end: number;
}

export type GrowthStageCreate = Omit<GrowthStage, "id" | "plant_id">;