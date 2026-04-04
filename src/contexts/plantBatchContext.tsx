// src/context/PlantBatchContext.tsx
import React, { createContext, useContext } from "react";
import { usePlantBatches } from "../hooks/usePlantBatches";
import type { PlantBatch } from "../models/interfaces/PlantBatch";

type PlantBatchContextType = {
  batches: PlantBatch[];
  currentBatch: PlantBatch | null;
  loading: boolean;
  error: string | null;

  fetchBatches: () => Promise<void>;
  fetchBatch: (id: number) => Promise<PlantBatch | null>;
  createBatch: (data: Partial<PlantBatch>) => Promise<PlantBatch>;
  setStage: (batchId: number, stageId: number) => Promise<void>;
};

const PlantBatchContext = createContext<PlantBatchContextType | undefined>(undefined);

export const PlantBatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = usePlantBatches();

  return (
    <PlantBatchContext.Provider value={value}>
      {children}
    </PlantBatchContext.Provider>
  );
};

export const usePlantBatchContext = () => {
  const ctx = useContext(PlantBatchContext);
  if (!ctx) throw new Error("usePlantBatchContext must be used inside provider");
  return ctx;
};