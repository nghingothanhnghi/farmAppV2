// src/hooks/useAiVision.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import { aiVisionService } from "../services/aiVisionService";
import type {
  VisionPlant,
  VisionCamera,
  VisionImage,
  InferenceJob,
  PlantHealthRecord,
  PlantGrowthRecord,
  PlantAnomaly,
  AIRecommendation,
} from "../models/interfaces/AiVision";

// module-level cache so switching tabs / remounting doesn't re-link the
// same batch over and over
const batchLinkCache = new Map<number, VisionPlant>();

export function useAiVision(hydroBatchId?: number) {
  const [plant, setPlant] = useState<VisionPlant | null>(
    hydroBatchId ? batchLinkCache.get(hydroBatchId) ?? null : null
  );
  const [linking, setLinking] = useState(false);

  const [plants, setPlants] = useState<VisionPlant[]>([]);
  const [cameras, setCameras] = useState<VisionCamera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<number | undefined>(undefined);

  const [health, setHealth] = useState<PlantHealthRecord | null>(null);
  const [growthHistory, setGrowthHistory] = useState<PlantGrowthRecord[]>([]);
  const [anomalies, setAnomalies] = useState<PlantAnomaly[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [lastImage, setLastImage] = useState<VisionImage | null>(null);
  const [lastJob, setLastJob] = useState<InferenceJob | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const camerasForPlant = useMemo(
    () => cameras.filter((c) => !c.plant_id || c.plant_id === plant?.id),
    [cameras, plant?.id]
  );

  const fetchCameras = useCallback(async () => {
    try {
      setCameras(await aiVisionService.getCameras());
    } catch (err) {
      console.error("Failed to fetch cameras", err);
    }
  }, []);

  const createCamera = useCallback(async (name: string, location?: string) => {
    const created = await aiVisionService.createCamera({
      name,
      plant_id: plant?.id,
      location,
    });
    setCameras((prev) => [...prev, created]);
    setSelectedCameraId(created.id);
    return created;
  }, [plant?.id]);

  const fetchHealth = useCallback(async (id: number) => {
    try {
      setHealth((await aiVisionService.getLatestHealth(id)) ?? null);
    } catch {
      setHealth(null);
    }
  }, []);

  const fetchGrowth = useCallback(async (id: number) => {
    try {
      setGrowthHistory(await aiVisionService.getGrowthHistory(id));
    } catch (err) {
      console.error("Failed to fetch growth history", err);
    }
  }, []);

  const fetchAnomalies = useCallback(async (id: number) => {
    try {
      setAnomalies(await aiVisionService.getAnomalies(id));
    } catch (err) {
      console.error("Failed to fetch anomalies", err);
    }
  }, []);

  const fetchRecommendations = useCallback(async (id: number) => {
    try {
      setRecommendations(await aiVisionService.getRecommendations(id));
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    }
  }, []);

  const refreshPlantData = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        await Promise.all([
          fetchHealth(id),
          fetchGrowth(id),
          fetchAnomalies(id),
          fetchRecommendations(id),
        ]);
        setError(null);
      } finally {
        setLoading(false);
      }
    },
    [fetchHealth, fetchGrowth, fetchAnomalies, fetchRecommendations]
  );

  // Resolve hydro batch → ai_vision plant, then load everything keyed on
  // plant.id. Cached per batch so repeat mounts don't re-link.
  const resolvePlant = useCallback(async (batchId: number) => {
    const cached = batchLinkCache.get(batchId);
    if (cached) {
      setPlant(cached);
      await refreshPlantData(cached.id);
      return cached;
    }

    setLinking(true);
    setError(null);
    try {
      const linked = await aiVisionService.linkBatch(batchId);
      batchLinkCache.set(batchId, linked);
      setPlant(linked);
      await refreshPlantData(linked.id);
      return linked;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to link plant batch to AI Vision");
      throw err;
    } finally {
      setLinking(false);
    }
  }, [refreshPlantData]);

  const uploadAndAnalyze = useCallback(
    async (file: File, cameraId?: number) => {
      if (!plant) throw new Error("No linked vision plant yet");
      setError(null);
      try {
        setUploading(true);
        const image = await aiVisionService.uploadImage(plant.id, file, cameraId);
        setLastImage(image);
        setUploading(false);

        setAnalyzing(true);
        const job = await aiVisionService.analyzeNow(image.id);
        setLastJob(job);

        if (job.status === "failed") {
          setError(job.error_message ?? "Analysis failed");
        } else {
          await refreshPlantData(plant.id);
        }

        return { image, job };
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to upload or analyze image");
        throw err;
      } finally {
        setUploading(false);
        setAnalyzing(false);
      }
    },
    [plant, refreshPlantData]
  );

  const checkJobStatus = useCallback(async (jobId: number) => {
    const job = await aiVisionService.getInferenceJob(jobId);
    setLastJob(job);
    return job;
  }, []);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  useEffect(() => {
    if (hydroBatchId) resolvePlant(hydroBatchId);
  }, [hydroBatchId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    plant,           // the ai_vision Plant, once linked
    linking,         // true while link-batch is in flight
    plants,
    cameras,
    camerasForPlant,
    selectedCameraId,
    setSelectedCameraId,
    health,
    growthHistory,
    anomalies,
    recommendations,
    lastImage,
    lastJob,
    loading,
    uploading,
    analyzing,
    error,
    actions: {
      resolvePlant,
      fetchCameras,
      createCamera,
      refreshPlantData,
      uploadAndAnalyze,
      checkJobStatus,
    },
  };
}