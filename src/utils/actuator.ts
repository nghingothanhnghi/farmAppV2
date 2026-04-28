
// src/utils/actuator.ts
import {
    IconBulb,
    IconDroplet,
    IconWindmill,
    IconRipple,
    IconEngine,
    IconClock,
    IconSettings
} from '@tabler/icons-react';

const actuatorConfig = {
    light: {
        icon: IconBulb,
        color: "text-yellow-500",
        bg: "bg-yellow-500",
        hover: "hover:bg-yellow-600",
    },
    // 🔧 Generic pump (mechanical)
    pump: {
        icon: IconEngine, // 👈 changed
        color: "text-orange-500",
        bg: "bg-orange-500",
        hover: "hover:bg-orange-600",
    },

    // 💧 Water pump (liquid)
    water_pump: {
        icon: IconDroplet, // 👈 keep water meaning
        color: "text-blue-500",
        bg: "bg-blue-500",
        hover: "hover:bg-blue-600",
    },
    fan: {
        icon: IconWindmill,
        color: "text-gray-500",
        bg: "bg-gray-500",
        hover: "hover:bg-gray-600",
    },
    valve: {
        icon: IconRipple,
        color: "text-cyan-500",
        bg: "bg-cyan-500",
        hover: "hover:bg-cyan-600",
    },
    motor: {
        icon: IconEngine,
        color: "text-orange-500",
        bg: "bg-orange-500",
        hover: "hover:bg-orange-600",
    },
    timer: {
        icon: IconClock,
        color: "text-purple-500",
        bg: "bg-purple-500",
        hover: "hover:bg-purple-600",
    },
};

export const getActuatorIcon = (type?: string) => {
    const config = actuatorConfig[type as keyof typeof actuatorConfig];

    return {
        Icon: config?.icon || IconSettings,
        color: config?.color || "text-gray-400",
        bg: config?.bg || "bg-gray-500",
        hover: config?.hover || "hover:bg-gray-600",
    };
};

// =========================
// ACTUATOR REASON MAP
// =========================
const actuatorReasonMap: Record<string, { label: string; color?: string }> = {
    off: {
        label: "Idle",
        color: "text-gray-400",
    },

    manual_on: {
        label: "Manual ON",
        color: "text-green-500",
    },
    manual_off: {
        label: "Manual OFF",
        color: "text-red-500",
    },

    safety_high_temp: {
        label: "High temperature",
        color: "text-red-500",
    },
    safety_low_water: {
        label: "Low water level",
        color: "text-red-500",
    },

    schedule: {
        label: "Scheduled",
        color: "text-blue-500",
    },
    interval: {
        label: "Interval mode",
        color: "text-purple-500",
    },
    oneshot: {
        label: "One-time run",
        color: "text-pink-500",
    },

    sensor: {
        label: "Sensor triggered",
        color: "text-orange-500",
    },
};

export const getActuatorReason = (reason?: string) => {
    if (!reason) {
        return {
            label: "",
            color: "text-gray-400",
        };
    }

    const mapped = actuatorReasonMap[reason];

    if (mapped) return mapped;

    // fallback (for unknown future reasons)
    return {
        label: reason.replace(/_/g, " "),
        color: "text-gray-400",
    };
};