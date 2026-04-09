// src/hooks/useHydroActuators.ts

import { useEffect, useState } from "react";
import { actuatorService } from "../services/hydroActuatorService";
import type { HydroActuator } from "../models/interfaces/HydroSystem";

export function useHydroActuators(deviceId?: number | null) {
    const [actuators, setActuators] = useState<HydroActuator[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!deviceId) {
            setActuators([]);
            return;
        }

        const fetch = async () => {
            try {
                setLoading(true);
                const data = await actuatorService.getByDevice(deviceId);
                setActuators(data);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [deviceId]);

    return { actuators, loading };
}