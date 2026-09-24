// src/models/interfaces/AiVision.ts
// ⚠️ Field names are inferred from model names referenced in the routers
// (Plant, Camera, PlantImage, InferenceJob, PlantHealthRecord,
// PlantGrowthRecord, PlantAnomaly, AIRecommendation). Confirm against the
// actual Pydantic schemas in app/ai_vision/schemas/*.py and adjust.

export interface VisionPlant {
  id: number;
  hydro_batch_id: number;
  species?: string;  
  name: string;
  status?: string;
  created_at: string;
}

export interface VisionCamera {
  id: number;
  name: string;
  plant_id?: number;
  location?: string;
}

export interface PlantCreatePayload {
  name: string;
  status?: string;
}

export type PlantUpdatePayload = Partial<PlantCreatePayload>;

export interface CameraCreatePayload {
  name: string;
  plant_id?: number;
  location?: string;
}

export interface VisionImage {
  id: number;
  plant_id: number;
  camera_id?: number | null;
  public_url: string;
  width: number | null;
  height: number | null;
  processing_status: string;
  captured_at: string;
}

export type InferenceJobStatus = "queued" | "processing" | "completed" | "failed";

export interface InferenceJob {
  id: number;
  image_id: number;
  status: InferenceJobStatus;
  error_message?: string | null;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
}

export interface PossibleIssue {
  issue: string;
  confidence: number;
}

export interface HealthSensorSnapshot {
  window_start: string;
  window_end: string;
  temperature?: number;
  humidity?: number;
  light?: number;
  moisture?: number;
  water_level?: number;
  ec?: number;
  ppm?: number;
  flow_rate?: number;
}

export interface PlantHealthRecord {
  id?: number;
  plant_id: number;
  image_id?: number;
  health_score: number;
  status: "healthy" | "stressed" | "diseased" | "unknown" | "normal" | string;
  visual_indicators?: string[];
  possible_issues?: PossibleIssue[];
  sensor_snapshot?: HealthSensorSnapshot;
  confidence?: number;
  model_name?: string;
  model_version?: string;
  created_at: string;
}



export interface PlantGrowthRecord {
  id: number;
  plant_id: number;
  image_id?: number;
  canopy_area_px?: number;
  canopy_area_cm2?: number;
  growth_rate_pct?: number;
  created_at: string;
}

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export interface PlantAnomaly {
  id: number;
  plant_id: number;
  // image_id?: number;
  anomaly_type: string;
  severity: AnomalySeverity;
  description?: string;
  evidence?: Record<string, any>;
  detected_at: string;
  is_resolved: boolean;
}

export interface AIRecommendation {
  id: number;
  plant_id: number;
  image_id?: number;
  recommendation: string;
  reasons?: string[];
  severity?: "low" | "medium" | "high" | "critical";
  confidence?: number;
  status: "pending_review" | "approved" | "rejected" | "applied";
  created_at: string;
}