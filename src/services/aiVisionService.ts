// src/services/aiVisionService.ts
// Mirrors app/ai_vision/routes/*.py exactly. Do not add endpoints that
// aren't defined on the backend — several capabilities (per-image
// predictions, listing images by plant, resolving anomalies, updating
// recommendation status) simply aren't exposed yet.

import apiClient from "../api/client";
import type {
  VisionPlant,
  VisionCamera,
  PlantCreatePayload,
  PlantUpdatePayload,
  CameraCreatePayload,
  VisionImage,
  InferenceJob,
  PlantHealthRecord,
  PlantGrowthRecord,
  PlantAnomaly,
  AIRecommendation,
} from "../models/interfaces/AiVision";

export const aiVisionService = {
  // --- Plants: /api/v1/plants ---
  async createPlant(data: PlantCreatePayload): Promise<VisionPlant> {
    const res = await apiClient.post("/api/v1/plants", data);
    return res.data;
  },

  async getPlants(status?: string): Promise<VisionPlant[]> {
    const res = await apiClient.get("/api/v1/plants", {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  async getPlant(plantId: number): Promise<VisionPlant> {
    const res = await apiClient.get(`/api/v1/plants/${plantId}`);
    return res.data;
  },

  async updatePlant(plantId: number, data: PlantUpdatePayload): Promise<VisionPlant> {
    const res = await apiClient.patch(`/api/v1/plants/${plantId}`, data);
    return res.data;
  },

  // --- Cameras: /api/v1/cameras ---
  async createCamera(data: CameraCreatePayload): Promise<VisionCamera> {
    const res = await apiClient.post("/api/v1/cameras", data);
    return res.data;
  },

  async getCameras(): Promise<VisionCamera[]> {
    const res = await apiClient.get("/api/v1/cameras");
    return res.data;
  },

  // --- Images: /api/v1/vision/images ---
  // plant_id / camera_id are query params on the backend; only the file
  // itself goes in the multipart body.
  async uploadImage(plantId: number, file: File, cameraId?: number): Promise<VisionImage> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/api/v1/vision/images", formData, {
      params: { plant_id: plantId, camera_id: cameraId },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getImage(imageId: number): Promise<VisionImage> {
    const res = await apiClient.get(`/api/v1/vision/images/${imageId}`);
    return res.data;
  },

  // --- Inference: /api/v1/vision/analyze, /api/v1/ai/inference ---
  // Runs the pipeline synchronously and returns the finished (or failed)
  // job. Per the module README, this is the intended way to get an
  // immediate result instead of waiting for the 15s scheduler poll.
  async analyzeNow(imageId: number): Promise<InferenceJob> {
    const res = await apiClient.post(`/api/v1/vision/analyze/${imageId}`);
    return res.data;
  },

  async getInferenceJob(jobId: number): Promise<InferenceJob> {
    const res = await apiClient.get(`/api/v1/ai/inference/${jobId}`);
    return res.data;
  },

  // --- Health / Growth / Anomalies / Recommendations: /api/v1/plants/{id}/... ---
  async getLatestHealth(plantId: number): Promise<PlantHealthRecord> {
    const res = await apiClient.get(`/api/v1/plants/${plantId}/health`);
    return res.data;
  },

  async getGrowthHistory(plantId: number, limit = 50): Promise<PlantGrowthRecord[]> {
    const res = await apiClient.get(`/api/v1/plants/${plantId}/growth`, {
      params: { limit },
    });
    return res.data;
  },

  async getAnomalies(plantId: number): Promise<PlantAnomaly[]> {
    const res = await apiClient.get(`/api/v1/plants/${plantId}/anomalies`);
    return res.data;
  },

  async getRecommendations(plantId: number): Promise<AIRecommendation[]> {
    const res = await apiClient.get(`/api/v1/plants/${plantId}/recommendations`);
    return res.data;
  },
};