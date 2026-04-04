// src/hooks/usePlantBatches.ts
import { useState, useEffect, useCallback } from "react";
import { plantBatchService } from "../services/plantBatchService";
import type { PlantBatch } from "../models/interfaces/PlantBatch";

export function usePlantBatches() {
    const [batches, setBatches] = useState<PlantBatch[]>([]);
    const [currentBatch, setCurrentBatch] = useState<PlantBatch | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -----------------------------
    // Fetch All
    // -----------------------------
    const fetchBatches = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const data: PlantBatch[] = await plantBatchService.getBatches();
            setBatches(data);
            setError(null);
        } catch (err: any) {
            setError(err?.message || "Failed to load batches");
        } finally {
            setLoading(false);
        }
    }, []);

    // -----------------------------
    // Fetch One
    // -----------------------------
    const fetchBatch = useCallback(async (id: number): Promise<PlantBatch | null> => {
        try {
            setLoading(true);
            const data = await plantBatchService.getBatch(id);
            setCurrentBatch(data);
            return data;
        } catch (err: any) {
            setError(err?.message || "Failed to load batch");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // -----------------------------
    // Create
    // -----------------------------
    const createBatch = async (data: Partial<PlantBatch>): Promise<PlantBatch> => {
        try {
            setLoading(true);
            const newBatch: PlantBatch = await plantBatchService.createBatch(data);
            setBatches(prev => [...prev, newBatch]);
            return newBatch;
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // Set Stage (IMPORTANT)
    // -----------------------------
    const setStage = async (batchId: number, stageId: number) => {
        try {
            setLoading(true);

            await plantBatchService.setStage(batchId, stageId);

            // refresh current batch
            await fetchBatch(batchId);

        } catch (err: any) {
            setError(err?.message || "Failed to change stage");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    return {
        batches,
        currentBatch,
        loading,
        error,
        fetchBatches,
        fetchBatch,
        createBatch,
        setStage,
    };
}