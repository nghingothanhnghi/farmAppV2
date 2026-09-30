// src/hooks/useGrowthPlans.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { growthPlanService } from "../services/growthPlanService";
import type {
  GrowthPlan,
  GrowthPlanCreate,
  GrowthPlanUpdate,
  GrowthPlanWithStages,
  GrowthPlanValidation
} from "../models/interfaces/GrowthPlan";

// ------------------------------------------------------------------
// Typed error for DELETE 409 ("plan is in use by N batch(es)")
// ------------------------------------------------------------------
export class GrowthPlanInUseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GrowthPlanInUseError";
  }
}

// ------------------------------------------------------------------
// Tiny invalidation bus (no query cache in this codebase, so mutations
// notify mounted list/detail hooks to refetch).
// ------------------------------------------------------------------
const listeners = new Map<string, Set<() => void>>();

const subscribe = (key: string, fn: () => void) => {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => {
    listeners.get(key)?.delete(fn);
  };
};

const invalidate = (...keys: string[]) => {
  keys.forEach((k) => listeners.get(k)?.forEach((fn) => fn()));
};

const plansKey = (plantId: number) => `growth-plans:plant:${plantId}`;
const planKey = (planId: number) => `growth-plans:plan:${planId}`;
const validationKey = (planId: number) => `growth-plans:validation:${planId}`;

const getDetail = (err: any, fallback: string): string => {
  const detail = err?.response?.data?.detail;
  return typeof detail === "string" ? detail : err?.message || fallback;
};

export const invalidatePlanDetail = (planId: number) =>
  invalidate(planKey(planId), validationKey(planId));

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------

/**
 * List of plans for a plant. `plans` only ever contains data for the
 * *current* plantId (never stale data from a previous plant), and
 * `loaded` tells you when that data has actually arrived.
 */
export function useGrowthPlansByPlant(plantId?: number | null) {
  const [state, setState] = useState<{ plantId: number | null; items: GrowthPlan[] }>({
    plantId: null,
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    if (!plantId) return;
    const id = ++requestId.current;
    try {
      setLoading(true);
      setError(null);
      const items = await growthPlanService.getGrowthPlansByPlant(plantId);
      if (id === requestId.current) setState({ plantId, items });
    } catch (err) {
      if (id === requestId.current) setError(getDetail(err, "Failed to load growth plans"));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    if (!plantId) return;
    refetch();
    return subscribe(plansKey(plantId), refetch);
  }, [plantId, refetch]);

  const matches = !!plantId && state.plantId === plantId;

  return {
    plans: matches ? state.items : ([] as GrowthPlan[]),
    loaded: !plantId || matches,
    loading,
    error,
    refetch,
  };
}

/** Single plan + nested stages (each with recipes). */
export function useGrowthPlanWithStages(planId?: number | null) {
  const [state, setState] = useState<{ planId: number | null; data: GrowthPlanWithStages | null }>({
    planId: null,
    data: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    if (!planId) return;
    const id = ++requestId.current;
    try {
      setLoading(true);
      setError(null);
      const data = await growthPlanService.getGrowthPlanWithStages(planId);
      if (id === requestId.current) setState({ planId, data });
    } catch (err) {
      if (id === requestId.current) setError(getDetail(err, "Failed to load growth plan"));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (!planId) return;
    refetch();
    return subscribe(planKey(planId), refetch);
  }, [planId, refetch]);

  return {
    plan: planId && state.planId === planId ? state.data : null,
    loading,
    error,
    refetch,
  };
}

// ------------------------------------------------------------------
// Mutations
// ------------------------------------------------------------------

export function useCreateGrowthPlan() {
  const [loading, setLoading] = useState(false);

  const createGrowthPlan = useCallback(async (data: GrowthPlanCreate) => {
    try {
      setLoading(true);
      const created = await growthPlanService.createGrowthPlan(data);
      invalidate(plansKey(created.plant_id));
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGrowthPlan, loading };
}

export function useUpdateGrowthPlan() {
  const [loading, setLoading] = useState(false);

  const updateGrowthPlan = useCallback(async (planId: number, data: GrowthPlanUpdate) => {
    try {
      setLoading(true);
      const updated = await growthPlanService.updateGrowthPlan(planId, data);
      // list refetch also picks up the backend clearing the previous default
      invalidate(planKey(planId), plansKey(updated.plant_id));
      return updated;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateGrowthPlan, loading };
}

export function useDeleteGrowthPlan() {
  const [loading, setLoading] = useState(false);

  /** Throws GrowthPlanInUseError on 409, the original error otherwise. */
  const deleteGrowthPlan = useCallback(async (planId: number, plantId: number) => {
    try {
      setLoading(true);
      await growthPlanService.deleteGrowthPlan(planId);
      invalidate(plansKey(plantId));
    } catch (err: any) {
      if (err?.response?.status === 409) {
        throw new GrowthPlanInUseError(
          getDetail(err, "This plan is still in use by one or more batches.")
        );
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteGrowthPlan, loading };
}

export function useDuplicateGrowthPlan() {
  const [loading, setLoading] = useState(false);

  /** Omit `name` to get the server's auto "<name> (copy)". */
  const duplicateGrowthPlan = useCallback(async (planId: number, name?: string) => {
    try {
      setLoading(true);
      const created = await growthPlanService.duplicateGrowthPlan(planId, name);
      invalidate(plansKey(created.plant_id));
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  return { duplicateGrowthPlan, loading };
}

export function useGrowthPlanValidation(planId?: number | null) {
  const [state, setState] = useState<{ planId: number | null; data: GrowthPlanValidation | null }>({
    planId: null,
    data: null,
  });
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    if (!planId) return;
    const id = ++requestId.current;
    try {
      const data = await growthPlanService.getGrowthPlanValidation(planId);
      if (id === requestId.current) setState({ planId, data });
    } catch {
      if (id === requestId.current) setState({ planId, data: null }); // advisory only
    }
  }, [planId]);

  useEffect(() => {
    if (!planId) return;
    refetch();
    return subscribe(validationKey(planId), refetch);
  }, [planId, refetch]);

  return { validation: planId && state.planId === planId ? state.data : null, refetch };
}