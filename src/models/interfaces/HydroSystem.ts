// src/models/interfaces/HydroSystem.ts

import type { GrowthStage } from "./GrowthStage";

// actuators as sensors: pump, light, fan, water_pump, valve
export interface HydroActuator {
  id: number;
  type: string; // e.g., 'pump', 'light', 'fan', 'water_pump', 'valve'
  sensor_key: string | null;
  name: string;
  pin: string;
  port: number;
  is_active: boolean;
  default_state: boolean;
  current_state: boolean;
  linked_sensor_value?: number | null;
  device_id?: number;
  created_at?: string;
  updated_at?: string;
}

// device as (esp32 mainboard, etc....)
export interface HydroDevice {
  id: number;
  name: string;
  device_id: string;
  location: string;
  type: string;
  is_active: boolean;
  client_id: string;
  user_id: number;
  thresholds: Record<string, any>;
  created_at: string;
  updated_at: string | null;
}

export interface SensorReading {
  id: number;
  temperature: number;
  humidity: number;
  light: number;
  moisture: number;
  ec: number | null;
  ppm: number | null;
  water_level: number;
  created_at: string;
}

export type DeviceActuatorState = Record<string, boolean>;

export interface SchedulerState {
  scheduler_state: boolean;
}
export interface WaterStatus {
  status: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  current_level: number;
  min_threshold: number;
  critical_threshold: number;
}
export interface AutomationRulesResult {
  actions: {
    pump: boolean;
    light: boolean;
    fan: boolean;
    water_refill: boolean;
  };
  alerts: string[];
  water_status: WaterStatus;
}

export interface AutomationConfig {
  rules_result: AutomationRulesResult;
  thresholds: SystemThresholds;
}
export interface SystemStatusPerDevice {
  device_id: number;
  device_name: string;
  location: string;
  sensors: Omit<SensorReading, 'id' | 'created_at'> & { device_id: number; device_name: string };
  actuators: HydroActuator[];
  growing_batch?: {
    id: number;
    plant_name: string;
    start_date: string;
    days_growing: number;
    current_stage: string;
    current_stage_id?: number;
    stages: GrowthStage[];
    status: string;
  };
  system: SchedulerState;
  automation: AutomationConfig;
}
export interface SystemThresholds {
  moisture_min: number;
  light_min: number;
  temperature_max: number;
  water_level_min: number;
  water_level_critical: number;
  ec_min: number;
  ec_max: number;
  ppm_min: number;
  ppm_max: number;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export interface SensorChartData {
  temperature: ChartDataPoint[];
  humidity: ChartDataPoint[];
  light: ChartDataPoint[];
  moisture: ChartDataPoint[];
  water_level: ChartDataPoint[];
}

export interface ControlAction {
  action: string;
  timestamp: string;
  success: boolean;
  message?: string;
}

