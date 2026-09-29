// src/hooks/usePlanStages.ts
import { useEffect, useState } from "react";
import { growthPlanService } from "../services/growthPlanService";
import { plantBatchService } from "../services/plantBatchService";
import type { GrowthStage } from "../models/interfaces/GrowthStage";

const cache = new Map<string, GrowthStage[]>();
const inflight = new Map<string, Promise<GrowthStage[]>>();
const listeners = new Set<() => void>();

const sortStages = (list: GrowthStage[]) =>
  [...list].sort((a, b) => a.day_start - b.day_start);

const keyOf = (planId?: number | null, plantId?: number | null) =>
  planId ? `plan:${planId}` : plantId ? `plant:${plantId}` : null;

const load = (key: string, planId?: number | null, plantId?: number | null) => {
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = planId
    ? growthPlanService
        .getGrowthPlanWithStages(planId)
        .then((plan) => sortStages(plan.stages ?? []))
    : // legacy batches without plan: only stages that belong to no plan
      plantBatchService
        .getStagesByPlant(plantId as number)
        .then((all) => sortStages(all.filter((s) => s.plan_id == null)));

  const p = request
    .then((stages) => {
      cache.set(key, stages);
      return stages;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
};

/** Call after stages/recipes of any plan are saved or deleted. */
export const invalidatePlanStages = () => {
  cache.clear();
  listeners.forEach((fn) => fn());
};

export function usePlanStages(planId?: number | null, plantId?: number | null) {
  const key = keyOf(planId, plantId);
  const [stages, setStages] = useState<GrowthStage[]>(() =>
    key ? cache.get(key) ?? [] : []
  );
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (!key) {
      setStages([]);
      return;
    }
    let cancelled = false;
    setLoading(!cache.has(key));
    load(key, planId, plantId)
      .then((s) => !cancelled && setStages(s))
      .catch(() => !cancelled && setStages([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return { stages, loading };
}