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

  useEffect(() => {
    fetchPlants();
  }, []);

  return {
    plants,
    loading,
    fetchPlants,
  };
}