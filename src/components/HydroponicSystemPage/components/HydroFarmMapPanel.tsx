import { useState, useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { useHydroSystem } from "../../../hooks/useHydroSystem";
import type { SystemStatusPerDevice } from "../../../models/interfaces/HydroSystem";
import { Popover } from "../../common/Popover";

// Status colors
const statusColors = {
    healthy: "#4CAF50",
    warning: "#FFC107",
    error: "#F44336",
    offline: "#9E9E9E",
};

// Simple channel colors — you can extend this dynamically
const channelColors = ["#E3F2FD", "#FCE4EC", "#E8F5E9", "#FFF8E1"];

// Utility: derive status color
function getDeviceStatusColor(device: SystemStatusPerDevice) {
    if (!device.sensors) return statusColors.offline;
    const t = device.automation?.thresholds;
    if (!t) return statusColors.healthy;

    if (device.sensors.water_level < t.water_level_critical) return statusColors.error;
    if (device.sensors.temperature > t.temperature_max) return statusColors.warning;
    if (device.sensors.moisture < t.moisture_min) return statusColors.warning;

    return statusColors.healthy;
}

export default function HydroFarmMapPanel() {
    const { deviceStatusList } = useHydroSystem();
    const [popover, setPopover] = useState<{
        device: SystemStatusPerDevice;
        x: number;
        y: number;
    } | null>(null);

    // Map device list to coordinates (could also use stored x/y per device)
    const chartData = useMemo(
        () =>
            deviceStatusList.map((device, idx) => ({
                ...device,
                x: ((idx % 10) + 1) * 10, // simple layout
                y: 20 + Math.floor(idx / 10) * 25,
                channel: Math.floor(idx / 4), // assign channel index by row
            })),
        [deviceStatusList]
    );

    // derive unique channels from data
    const channels = useMemo(() => {
        const unique = Array.from(new Set(chartData.map((d) => d.channel)));
        return unique.map((ch) => ({
            id: ch,
            color: channelColors[ch % channelColors.length],
            yStart: 20 + ch * 25,
            yEnd: 20 + ch * 25 + 25,
        }));
    }, [chartData]);

    return (
        <>
            <ResponsiveContainer width="100%" height={100}>
                <ScatterChart>
                    <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                    <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                    {/* Background "map" channels */}
                    {channels.map((ch) => (
                        <ReferenceArea
                            key={ch.id}
                            y1={ch.yStart}
                            y2={ch.yEnd}
                            x1={0}
                            x2={120}
                            fill={ch.color}
                            fillOpacity={0.4}
                            ifOverflow="extendDomain"
                        />
                    ))}

                    <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ payload }) => {
                            if (!payload?.length) return null;
                            const d = payload[0].payload as SystemStatusPerDevice & {
                                x: number;
                                y: number;
                            };
                            return (
                                <div className="bg-white dark:bg-gray-800/80 dark:border-gray-700 shadow rounded p-2 text-xs dark:text-gray-200">
                                    <div className="font-semibold">{d.device_name}</div>
                                    <div className="text-gray-500 dark:text-gray-400">{d.location}</div>
                                    <div>🌡 {d.sensors.temperature}°C</div>
                                    <div>💧 {d.sensors.moisture}%</div>
                                    <div>📊 {d.sensors.water_level}%</div>
                                </div>
                            );
                        }}
                    />
                    <Scatter
                        data={chartData}
                        shape={(props: any) => {
                            const d = props.payload as SystemStatusPerDevice;
                            const fillColor = getDeviceStatusColor(d);

                            return (
                                <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={8}
                                    fill={fillColor}
                                    stroke="#fff"
                                    strokeWidth={1.5}
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        const rect = (e.target as SVGCircleElement).getBoundingClientRect();
                                        setPopover({
                                            device: d,
                                            x: rect.left + rect.width / 2,
                                            y: rect.top,
                                        });
                                    }}
                                />
                            );
                        }}
                    />
                </ScatterChart>
            </ResponsiveContainer>

            <Popover
                open={!!popover}
                anchorX={popover?.x ?? 0}
                anchorY={popover?.y ?? 0}
                onClose={() => setPopover(null)}
                placement="top"
            >
                {popover && (
                    <div>
                        <h3 className="text-sm font-semibold">{popover.device.device_name}</h3>
                        <p className="text-xs text-gray-500 mb-1">{popover.device.location}</p>

                        <div className="space-y-1 text-xs">
                            <div>🌡 Temp: {popover.device.sensors.temperature}°C</div>
                            <div>💧 Moisture: {popover.device.sensors.moisture}%</div>
                            <div>💡 Light: {popover.device.sensors.light} lx</div>
                            <div>📊 Water: {popover.device.sensors.water_level}%</div>
                        </div>

                        <div className="mt-2 border-t pt-1">
                            <h4 className="text-xs font-semibold">Actuators</h4>
                            {popover.device.actuators.length > 0 ? (
                                <ul className="space-y-1">
                                    {popover.device.actuators.map((a) => (
                                        <li key={a.id} className="text-xs">
                                            {a.type} –{" "}
                                            <span
                                                className={
                                                    a.current_state ? "text-green-600 font-medium" : "text-gray-500"
                                                }
                                            >
                                                {a.current_state ? "ON" : "OFF"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic text-xs">No actuators</p>
                            )}
                        </div>
                    </div>
                )}
            </Popover>
        </>
    );
}
