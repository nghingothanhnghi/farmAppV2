export interface GrowthRecipe {
  id: number;
  stage_id: number;
  actuator_type: string;
  action: string;
  start_time?: string;
  end_time?: string;
  interval_on_min?: number;
  interval_off_min?: number;
}