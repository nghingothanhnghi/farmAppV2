export const ACTUATOR_TYPES = [
    { label: "Pump", value: "pump" },
    { label: "Fan", value: "fan" },
    { label: "Light", value: "light" },
    { label: "Water Pump", value: "water_pump" },
    { label: "Valve", value: "valve" },
    { label: "Sliding Door", value: "sliding_door" },
] as const;

export const ACTUATOR_TYPE_VALUES = ACTUATOR_TYPES.map(
    (t) => t.value
);