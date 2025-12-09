// src/hooks/useHydroDevices.ts
import { useState, useEffect, useCallback } from "react";
import { deviceService } from "../services/hydroDeviceService";
import type { HydroDevice } from "../models/interfaces/HydroSystem";

export function useHydroDevices() {
    const [devices, setDevices] = useState<HydroDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -----------------------------
    // Fetch All Devices
    // -----------------------------
    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const list = await deviceService.getAll();
            setDevices(list);
        } catch (err: any) {
            setError(err?.message || "Failed to load devices");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    // inside useHydroDevices()

    const createDevice = async (data: Partial<HydroDevice>) => {
        try {
            setLoading(true);
            const item = await deviceService.create(data);
            setDevices(prev => [...prev, item]);
            return item;
        } finally {
            setLoading(false);
        }
    };

    const updateDevice = async (id: number, data: Partial<HydroDevice>) => {
        try {
            setLoading(true);
            const updated = await deviceService.update(id, data);
            setDevices(prev => prev.map(d => (d.id === id ? updated : d)));
            return updated;
        } finally {
            setLoading(false);
        }
    };

const deleteDevice = async (id: number) => {
  try {
    setLoading(true);
    await deviceService.delete(id);
    setDevices(prev => prev.filter(d => d.id !== id));
  } finally {
    setLoading(false);
  }
};



    // -----------------------------
    // Activate Device
    // -----------------------------
    const activate = async (id: number) => {
        try {
            setLoading(true);
            const updated = await deviceService.activateDevice(id);

            setDevices((prev) =>
                prev.map((d) => (d.id === id ? updated : d))
            );

            return updated;
        } catch (err: any) {
            setError(err?.message || "Failed to activate device");
            throw err; // allow UI to handle errors (modals, toasts, etc.)
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // Deactivate Device
    // -----------------------------
    const deactivate = async (id: number) => {
        try {
            setLoading(true);
            const updated = await deviceService.deactivateDevice(id);

            setDevices((prev) =>
                prev.map((d) => (d.id === id ? updated : d))
            );

            return updated;
        } catch (err: any) {
            setError(err?.message || "Failed to deactivate device");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // 🔥 Toggle Active / Inactive
    // -----------------------------
    const toggleActive = async (device: HydroDevice) => {
        const previous = device.is_active;

        // Optimistic update
        setDevices(prev =>
            prev.map(d => (d.id === device.id ? { ...d, is_active: !previous } : d))
        );

        try {
            if (previous) {
                return await deactivate(device.id);
            } else {
                return await activate(device.id);
            }
        } catch (err) {
            // revert on failure
            setDevices(prev =>
                prev.map(d => (d.id === device.id ? { ...d, is_active: previous } : d))
            );
            throw err;
        }
    };

    // -----------------------------
    // Refresh Single Device After Modal
    // -----------------------------
    const refreshDevice = async (id: number) => {
        const item = await deviceService.get(id);
        setDevices((prev) =>
            prev.map((d) => (d.id === id ? item : d))
        );
    };

    return {
        devices,
        loading,
        error,
        fetchDevices,
        activate,
        deactivate,
        toggleActive,
        refreshDevice,
        createDevice,
        updateDevice,
        deleteDevice,
    };
}
