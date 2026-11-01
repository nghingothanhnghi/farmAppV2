// src/components/HydroponicSystemPage/components/HealthGrowthCard.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { IconLeaf } from "@tabler/icons-react";
import Badge from "../../../common/Badge";
import StatusCard from "../StatusCard";
import { getHealthVariant } from "../../../../utils/aiVision";
import { formatPercent, formatDateTime } from "../../../../utils/formatters";

interface Props {
    plant: {
        id?: number;
        species?: string;
    };
    health: any;
    latestGrowth?: {
        growth_rate_pct?: number | null;
    };
}

const HealthGrowthCard: React.FC<Props> = ({
    plant,
    health,
    latestGrowth,
}) => {

    const { t } = useTranslation();

    const sensorSnapshot = health?.sensor_snapshot;

    const sensors = sensorSnapshot
        ? [
            {
                label: "Temp",
                value: sensorSnapshot.temperature,
                unit: "°C",
            },
            {
                label: "Humidity",
                value: sensorSnapshot.humidity,
                unit: "%",
            },
            {
                label: "Light",
                value: sensorSnapshot.light,
                unit: "lux",
            },
            {
                label: "Moisture",
                value: sensorSnapshot.moisture,
                unit: "%",
            },
            {
                label: "Water",
                value: sensorSnapshot.water_level,
                unit: "%",
            },
            {
                label: "EC",
                value: sensorSnapshot.ec,
                unit: "mS/cm",
                noSensor: true,
            },
            {
                label: "PPM",
                value: sensorSnapshot.ppm,
                unit: "",
                noSensor: true,
            },
            {
                label: "Flow",
                value: sensorSnapshot.flow_rate,
                unit: "L/min",
            },
        ]
        : [];

    return (
        <div className="h-full row-span-2 bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <IconLeaf size={16} />
                    {t('hydro_system.cards.health_growth.label')}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {plant.id && `(Plant ID: ${plant.id})`}

                    {plant.species && ` - ${plant.species}`}
                </p>
            </div>
            {!health ? (
                <p className="text-xs text-gray-500">
                    No health record yet.
                </p>
            ) : (
                <div className="space-y-4 ">
                    {/* Health summary */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Left column: Health Score */}
                        <StatusCard
                            title="Health Score"
                            value={health.health_score ?? '--'}
                            unit="/100"
                            status={
                                health.health_score < 50
                                    ? 'error'
                                    : health.health_score < 75
                                        ? 'warning'
                                        : 'normal'
                            }
                            compact
                            className="border"
                        />
                        {/* Right column: Status + Confidence */}
                        <div className="grid grid-rows-2 gap-3">
                            <StatusCard
                                title="Status"
                                value=""
                                compact
                            >
                                <Badge
                                    label={health.status}
                                    variant={getHealthVariant(health.status)}
                                    size="small"
                                />
                            </StatusCard>
                            <StatusCard
                                title="Confidence"
                                value={formatPercent(health.confidence)}
                                compact
                                status="normal"
                            />
                        </div>

                    </div>

                    {/* Visual indicators */}
                    {health.visual_indicators?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Visual Indicators
                            </p>

                            <div className="flex flex-wrap gap-1.5">
                                {health.visual_indicators.map(
                                    (indicator: string, index: number) => (
                                        <Badge
                                            key={index}
                                            label={indicator.replace(/_/g, " ")}
                                            variant="warning"
                                            size="xsmall"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Possible issues */}
                    {health.possible_issues?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Possible Issues
                            </p>

                            <div className="space-y-1.5">
                                {health.possible_issues.map(
                                    (issue: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg px-3 py-1.5"
                                        >
                                            <span className="text-gray-700 dark:text-gray-200 capitalize">
                                                {issue.issue.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                            </span>

                                            <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                                                {formatPercent(issue.confidence)} confidence
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sensor snapshot */}
                    {sensorSnapshot && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Sensor Snapshot
                                </p>

                                <p className="text-[10px] text-gray-400">
                                    {new Date(
                                        sensorSnapshot.window_start
                                    ).toLocaleTimeString()}
                                    {" → "}
                                    {new Date(
                                        sensorSnapshot.window_end
                                    ).toLocaleTimeString()}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-2 gap-2">
                                {sensors.map((sensor) => (
                                    <div
                                        key={sensor.label}
                                        className="rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-white/5 px-2 py-1.5 text-center"
                                    >
                                        <p className="text-[9px] text-gray-500 dark:text-gray-400">
                                            {sensor.label}
                                        </p>

                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            {sensor.noSensor &&
                                                (!sensor.value ||
                                                    sensor.value === 0) ? (
                                                <span className="text-gray-400 font-normal">
                                                    N/A
                                                </span>
                                            ) : (
                                                <>
                                                    {sensor.value ?? "--"}

                                                    {sensor.unit && (
                                                        <span className="text-[9px] font-normal text-gray-400 ml-0.5">
                                                            {sensor.unit}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Growth rate */}
                    {latestGrowth?.growth_rate_pct != null && (
                        <div className="flex items-center justify-between text-sm border-t border-gray-100 dark:border-white/5 pt-3">
                            <span className="text-gray-600 dark:text-gray-300">
                                Latest Growth Rate
                            </span>

                            <span className="font-medium">
                                {latestGrowth.growth_rate_pct.toFixed(1)}%
                            </span>
                        </div>
                    )}

                    {/* Model metadata */}
                    {(health.model_name || health.created_at) && (
                        <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 dark:border-white/5 pt-2">
                            <span>
                                {health.model_name}

                                {health.model_version
                                    ? ` (${health.model_version})`
                                    : ""}
                            </span>

                            <span>
                                {formatDateTime(health.created_at)}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HealthGrowthCard;