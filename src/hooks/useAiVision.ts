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

export function useAiVision(plantId?: number) {
    const [plants, setPlants] = useState<VisionPlant[]>([]);
    const [cameras, setCameras] = useState<VisionCamera[]>([]);
    const [health, setHealth] = useState<PlantHealthRecord | null>(null);
    const [growthHistory, setGrowthHistory] = useState<PlantGrowthRecord[]>([]);
    const [anomalies, setAnomalies] = useState<PlantAnomaly[]>([]);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [lastImage, setLastImage] = useState<VisionImage | null>(null);
    const [lastJob, setLastJob] = useState<InferenceJob | null>(null);
    const [selectedCameraId, setSelectedCameraId] = useState<number | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlants = useCallback(async (status?: string) => {
        try {
            setPlants(await aiVisionService.getPlants(status));
        } catch (err) {
            console.error("Failed to fetch plants", err);
        }
    }, []);

    const fetchCameras = useCallback(async () => {
        try {
            setCameras(await aiVisionService.getCameras());
        } catch (err) {
            console.error("Failed to fetch cameras", err);
        }
    }, []);

    // Cameras aren't filterable by plant on the backend, so filter client-side.
    const camerasForPlant = useMemo(
        () => cameras.filter((c) => !c.plant_id || c.plant_id === plantId),
        [cameras, plantId]
    );

    useEffect(() => {
    setSelectedCameraId((currentId) => {
        if (
            currentId &&
            camerasForPlant.some((camera) => camera.id === currentId)
        ) {
            return currentId;
        }

        return camerasForPlant[0]?.id;
    });
}, [camerasForPlant]);

    const createCamera = useCallback(
        async (name: string, targetPlantId?: number, location?: string) => {
            const created = await aiVisionService.createCamera({
                name,
                plant_id: targetPlantId,
                location,
            });
            setCameras((prev) => [...prev, created]);
            setSelectedCameraId(created.id);
            return created;
        },
        []
    );

    // Latest health may 404/return null if no record exists yet — treat that
    // as "no data" rather than a hard error.
    const fetchHealth = useCallback(async (id: number) => {
        try {
            const data = await aiVisionService.getLatestHealth(id);
            setHealth(data ?? null);
        } catch (err) {
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

    // Upload, then immediately run the synchronous analyze endpoint so the
    // user gets a result without waiting on the 15s scheduler poll.
    const uploadAndAnalyze = useCallback(
        async (targetPlantId: number, file: File, cameraId?: number) => {
            setError(null);
            try {
                setUploading(true);
                const image = await aiVisionService.uploadImage(targetPlantId, file, cameraId);
                setLastImage(image);
                setUploading(false);

                setAnalyzing(true);
                const job = await aiVisionService.analyzeNow(image.id);
                setLastJob(job);

                if (job.status === "failed") {
                    setError(job.error_message ?? "Analysis failed");
                } else {
                    await refreshPlantData(targetPlantId);
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
        [refreshPlantData]
    );

    const checkJobStatus = useCallback(async (jobId: number) => {
        const job = await aiVisionService.getInferenceJob(jobId);
        setLastJob(job);
        return job;
    }, []);

    useEffect(() => {
        fetchPlants();
        fetchCameras();
    }, [fetchPlants, fetchCameras]);

    useEffect(() => {
        if (plantId) refreshPlantData(plantId);
    }, [plantId, refreshPlantData]);

    return {
        plants,
        cameras,
        camerasForPlant,
        health,
        growthHistory,
        anomalies,
        recommendations,
        lastImage,
        lastJob,
        selectedCameraId,
        setSelectedCameraId,
        loading,
        uploading,
        analyzing,
        error,
        actions: {
            fetchPlants,
            fetchCameras,
            refreshPlantData,
            uploadAndAnalyze,
            checkJobStatus,
            createCamera,
        },
    };
}