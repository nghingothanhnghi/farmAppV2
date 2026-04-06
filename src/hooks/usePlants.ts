import { useEffect, useState } from "react";
import { plantService } from "../services/plantService";
import type { Plant } from "../models/interfaces/Plant";

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const data = await plantService.getPlants();
      setPlants(data);
    } catch (err) {
      console.error("Failed to fetch plants", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // ✅ Create plant (NEW)
  // -----------------------------
  const createPlant = async (data: Partial<Plant>): Promise<Plant> => {
    try {
      setLoading(true);

      const newPlant = await plantService.createPlant(data);

      // update local state immediately (no need refetch)
      setPlants(prev => [...prev, newPlant]);

      return newPlant;
    } catch (err) {
      console.error("Failed to create plant", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  return {
    plants,
    loading,
    fetchPlants,
    createPlant,
  };
}