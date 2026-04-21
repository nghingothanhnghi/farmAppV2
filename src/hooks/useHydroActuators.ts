// src/hooks/useHydroActuators.ts

import { useEffect, useState, useCallback } from "react";
import { actuatorService } from "../services/hydroActuatorService";
import type { HydroActuator } from "../models/interfaces/HydroSystem";

export function useHydroActuators(deviceId?: number | null) {
    const [actuators, setActuators] = useState<HydroActuator[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ---------------- FETCH ----------------
    const fetchActuators = useCallback(async () => {
        if (!deviceId) {
            setActuators([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await actuatorService.getByDevice(deviceId);

            console.log("📥 ACTUATORS FROM API:", data);

            setActuators(data);
        } catch (err: any) {
            console.error("❌ Fetch actuators error:", err);
            setError(err?.message || "Failed to fetch actuators");
        } finally {
            setLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        fetchActuators();
    }, [fetchActuators]);

    // ---------------- UPDATE (PATCH) ----------------
    const updateActuator = async (
        id: number,
        updates: Partial<HydroActuator>
    ) => {
        try {
            console.log("📤 PATCH actuator:", id, updates);

            const updated = await actuatorService.patch(id, updates);

            // ✅ Optimistic UI update
            setActuators(prev =>
                prev.map(a => (a.id === id ? { ...a, ...updated } : a))
            );

            return updated;
        } catch (err) {
            console.error("❌ Update actuator failed:", err);
            throw err;
        }
    };

    // ---------------- TOGGLE ----------------
    const toggleActuator = async (id: number, current: boolean) => {
        return updateActuator(id, {
            default_state: !current,
        });
    };

    // ---------------- BULK UPDATE ----------------
    const updateMany = async (
        updates: { id: number; data: Partial<HydroActuator> }[]
    ) => {
        try {
            const results = await Promise.all(
                updates.map(u => actuatorService.patch(u.id, u.data))
            );

            // update UI
            setActuators(prev =>
                prev.map(a => {
                    const found = results.find(r => r.id === a.id);
                    return found ? { ...a, ...found } : a;
                })
            );

            return results;
        } catch (err) {
            console.error("❌ Bulk update failed:", err);
            throw err;
        }
    };

    // ---------------- CREATE ----------------
    const createActuator = async (data: Partial<HydroActuator>) => {
        try {
            const created = await actuatorService.create(data);

            setActuators(prev => [...prev, created]);

            return created;
        } catch (err) {
            console.error("❌ Create actuator failed:", err);
            throw err;
        }
    };

    // ---------------- DELETE ----------------
    const deleteActuator = async (id: number) => {
        try {
            await actuatorService.delete(id);

            setActuators(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("❌ Delete actuator failed:", err);
            throw err;
        }
    };

    // ---------------- HELPERS ----------------
    const getByType = (type: string) =>
        actuators.find(a => a.type === type);

    const getByPin = (pin: string) =>
        actuators.find(a => a.pin === pin);

    // ---------------- RETURN ----------------
    return {
        actuators,
        loading,
        error,

        // actions
        refetch: fetchActuators,
        updateActuator,
        toggleActuator,
        updateMany,
        createActuator,
        deleteActuator,

        // helpers
        getByType,
        getByPin,
    };
}