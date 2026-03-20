// src/models/interfaces/HydroSchedule.ts

export interface HydroScheduleBase {
  actuator_id: number;
  start_time: string; // "08:00:00"
  end_time: string;   // "20:00:00"
  repeat_days: string; // "mon,tue,..."
  is_active: boolean;
}

export interface HydroScheduleCreate extends HydroScheduleBase {}

export interface HydroScheduleUpdate {
  start_time?: string;
  end_time?: string;
  repeat_days?: string;
  is_active?: boolean;
}

export interface HydroScheduleOut extends HydroScheduleBase {
  id: number;
  created_at: string; // ISO datetime
  updated_at?: string | null;
}