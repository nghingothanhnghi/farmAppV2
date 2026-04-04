// src/context/PlantBatchContext.tsx
import React, { createContext, useContext } from "react";
import { usePlantBatches } from "../hooks/usePlantBatches";

const PlantBatchContext = createContext<any>(null);

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