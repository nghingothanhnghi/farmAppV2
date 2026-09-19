// src/models/interfaces/AiVision.ts
// ⚠️ Field names are inferred from model names referenced in the routers
// (Plant, Camera, PlantImage, InferenceJob, PlantHealthRecord,
// PlantGrowthRecord, PlantAnomaly, AIRecommendation). Confirm against the
// actual Pydantic schemas in app/ai_vision/schemas/*.py and adjust.

export interface VisionPlant {
  id: number;
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
  url: string;
  created_at: string;
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

export interface PlantHealthRecord {
  id: number;
  plant_id: number;
  image_id?: number;
  health_score: number;
  status: "healthy" | "stressed" | "diseased" | "unknown";
  sensor_context?: Record<string, any>;
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
  image_id?: number;
  type: string;
  severity: AnomalySeverity;
  evidence?: Record<string, any>;
  detected_at: string;
  resolved?: boolean;
}

export interface AIRecommendation {
  id: number;
  plant_id: number;
  image_id?: number;
  title: string;
  description: string;
  reasoning?: string;
  status: "pending_review" | "approved" | "rejected" | "applied";
  created_at: string;
}