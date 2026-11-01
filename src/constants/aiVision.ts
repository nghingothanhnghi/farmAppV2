// src/constants/aiVision.ts
export const HEALTH_SENSORS = [
  { key: "temperature", label: "Temp", unit: "°C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "light", label: "Light", unit: "lux" },
  { key: "moisture", label: "Moisture", unit: "%" },
  { key: "water_level", label: "Water", unit: "%" },
  { key: "ec", label: "EC", unit: "mS/cm", optional: true },
  { key: "ppm", label: "PPM", unit: "", optional: true },
  { key: "flow_rate", label: "Flow", unit: "L/min" },
] as const;

export const AI_POLL_INTERVAL_MS = 2000; // currently local to useAiVision