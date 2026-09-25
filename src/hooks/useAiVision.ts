// src/hooks/useAiVision.ts
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
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

const POLL_INTERVAL_MS = 2000;
const isTerminal = (status: string) => status === "completed" || status === "failed";

export function useAiVision(hydroBatchId?: number) {
  const [plant, setPlant] = useState<VisionPlant | null>(
    hydroBatchId ? batchLinkCache.get(hydroBatchId) ?? null : null
  );
  const [linking, setLinking] = useState(false);

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

  // ✅ NEW — polling handle
  const pollTimerRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Always stop polling on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const camerasForPlant = useMemo(
    () => cameras.filter((c) => !c.plant_id || c.plant_id === plant?.id),
    [cameras, plant?.id]
  );

  // ✅ NEW — the URL the UI should actually render:
  // annotated_url once the job is completed, otherwise the raw upload.
  const displayImageUrl = useMemo(() => {
    if (lastJob?.status === "completed" && lastJob.annotated_url) {
      return lastJob.annotated_url;
    }
    return lastImage?.public_url;
  }, [lastJob, lastImage]);

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

  const checkJobStatus = useCallback(async (jobId: number) => {
    const job = await aiVisionService.getInferenceJob(jobId);
    setLastJob(job);
    return job;
  }, []);

  // ✅ NEW — single poll loop: GET /api/v1/ai/inference/{id} every 2s until
  // status is "completed" or "failed". annotated_url arrives on that same
  // "completed" payload, so nothing else needs to be fetched here.
  const pollJobUntilComplete = useCallback(
    (jobId: number, plantId: number) => {
      stopPolling();

      pollTimerRef.current = window.setInterval(async () => {
        try {
          const job = await checkJobStatus(jobId);

          if (isTerminal(job.status)) {
            stopPolling();
            setAnalyzing(false);

            if (job.status === "failed") {
              setError(job.error_message ?? "Analysis failed");
            } else {
              await refreshPlantData(plantId);
            }
          }
        } catch (err) {
          console.error("Failed to poll inference job", err);
          stopPolling();
          setAnalyzing(false);
          setError("Lost connection while checking analysis status");
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, checkJobStatus, refreshPlantData]
  );

  // const uploadAndAnalyze = useCallback(
  //   async (file: File, cameraId?: number) => {
  //     if (!plant) throw new Error("No linked vision plant yet");
  //     setError(null);
  //     stopPolling();
  //     try {
  //       setUploading(true);
  //       const image = await aiVisionService.uploadImage(plant.id, file, cameraId);
  //       setLastImage(image);
  //       setUploading(false);

  //       setAnalyzing(true);
  //       const job = await aiVisionService.analyzeNow(image.id);
  //       setLastJob(job);

  //       if (job.status === "failed") {
  //         setError(job.error_message ?? "Analysis failed");
  //       } else {
  //         await refreshPlantData(plant.id);
  //       }

  //       return { image, job };
  //     } catch (err: any) {
  //       setError(err?.response?.data?.detail ?? "Failed to upload or analyze image");
  //       throw err;
  //     } finally {
  //       setUploading(false);
  //       setAnalyzing(false);
  //     }
  //   },
  //   [plant, refreshPlantData]
  // );

  const uploadAndAnalyze = useCallback(
    async (file: File, cameraId?: number) => {
      if (!plant) throw new Error("No linked vision plant yet");
      setError(null);
      stopPolling();

      try {
        setUploading(true);
        // POST /api/v1/vision/images → public_url, show immediately
        const image = await aiVisionService.uploadImage(plant.id, file, cameraId);
        setLastImage(image);
        setUploading(false);

        setAnalyzing(true);
        const job = await aiVisionService.analyzeNow(image.id);
        setLastJob(job);

        if (isTerminal(job.status)) {
          setAnalyzing(false);
          if (job.status === "failed") {
            setError(job.error_message ?? "Analysis failed");
          } else {
            await refreshPlantData(plant.id);
          }
        } else {
          // queued / processing — start the poll loop
          pollJobUntilComplete(job.id, plant.id);
        }

        return { image, job };
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to upload or analyze image");
        setAnalyzing(false);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [plant, refreshPlantData, pollJobUntilComplete, stopPolling]
  );



  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  useEffect(() => {
    if (hydroBatchId) resolvePlant(hydroBatchId);
  }, [hydroBatchId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    plant,           // the ai_vision Plant, once linked
    linking,         // true while link-batch is in flight
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
    displayImageUrl,
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