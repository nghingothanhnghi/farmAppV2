export interface PlantBatch {
  id: number;
  plant_id: number;
  current_stage_id: number;
  zone_id: number;
  start_date: string;
  status: string;

  // 👇 ADD THESE (from BatchDetail API)
  plant_name?: string;
  current_stage_name?: string;
  days_growing?: number;

  device_name?: string;
  device_location?: string;

}