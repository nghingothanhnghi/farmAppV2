// import React from "react";
// import { IconAlertTriangle } from "@tabler/icons-react";
// import Badge from "../../../common/Badge";
// import EmptyState from "../../../common/EmptyState";
// import { formatLabel, severityVariant } from "../../../../utils/aiVision";
// import type { PlantAnomaly } from "../../../../models/interfaces/AiVision";

// interface Props {
//     anomalies: PlantAnomaly[];
// }

// const AnomaliesCard: React.FC<Props> = ({ anomalies }) => (
//     <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4">
//         <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
//             <IconAlertTriangle size={16} />
//             Anomalies

//             {anomalies.length > 0 && (
//                 <span className="text-xs text-gray-400 font-normal">
//                     ({anomalies.length})
//                 </span>
//             )}
//         </h3>

//         {anomalies.length === 0 ? (
//             <EmptyState message="No anomalies detected." />
//         ) : (
//             <div className="space-y-3">
//                 {anomalies.map((a) => (
//                     <div
//                         key={a.id}
//                         className="rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-800/80 p-3 space-y-2"
//                     >
//                         <div className="flex items-start justify-between gap-2">
//                             <div>
//                                 <p className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
//                                     {formatLabel(a.anomaly_type)}
//                                 </p>

//                                 <p className="text-[10px] text-gray-400">
//                                     #{a.id} · {new Date(a.detected_at).toLocaleString()}
//                                 </p>
//                             </div>

//                             <div className="flex gap-1.5 shrink-0">
//                                 <Badge
//                                     label={a.severity}
//                                     variant={severityVariant[a.severity]}
//                                     size="xsmall"
//                                 />

//                                 <Badge
//                                     label={a.is_resolved ? "Resolved" : "Unresolved"}
//                                     variant={a.is_resolved ? "success" : "gray"}
//                                     size="xsmall"
//                                 />
//                             </div>
//                         </div>

//                         {a.description && (
//                             <p className="text-xs text-gray-600 dark:text-gray-300">
//                                 {a.description}
//                             </p>
//                         )}

//                         {a.evidence && Object.keys(a.evidence).length > 0 && (
//                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-gray-200 dark:border-white/5">
//                                 {Object.entries(a.evidence).map(([key, value]) => (
//                                     <div
//                                         key={key}
//                                         className="bg-white dark:bg-gray-900 rounded-md px-2 py-1 text-center"
//                                     >
//                                         <p className="text-[9px] text-gray-500 dark:text-gray-400 capitalize truncate">
//                                             {formatLabel(key)}
//                                         </p>

//                                         <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
//                                             {typeof value === "number"
//                                                 ? value.toLocaleString(undefined, {
//                                                     maximumFractionDigits: 2,
//                                                 })
//                                                 : String(value)}
//                                         </p>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>
//         )}
//     </div>
// );

// export default AnomaliesCard;


import React from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import Badge from "../../../common/Badge";
import EmptyState from "../../../common/EmptyState";
import { formatLabel, severityVariant } from "../../../../utils/aiVision";
import type { PlantAnomaly } from "../../../../models/interfaces/AiVision";

interface Props {
    anomalies: PlantAnomaly[];
}

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
        return "—";
    }

    if (typeof value === "number") {
        return value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
        });
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "string") {
        return value;
    }

    return String(value);
};

const renderEvidenceValue = (value: unknown) => {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return "—";
        }

        // Array of simple values
        if (value.every((item) => typeof item !== "object" || item === null)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px]"
                        >
                            {formatValue(item)}
                        </span>
                    ))}
                </div>
            );
        }

        // Array of objects
        return (
            <div className="space-y-1.5 text-left">
                {value.map((item, index) => {
                    if (
                        typeof item !== "object" ||
                        item === null ||
                        Array.isArray(item)
                    ) {
                        return (
                            <div
                                key={index}
                                className="text-[10px] text-gray-700 dark:text-gray-200"
                            >
                                {formatValue(item)}
                            </div>
                        );
                    }

                    return (
                        <div
                            key={index}
                            className="rounded border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-800 px-2 py-1.5"
                        >
                            {Object.entries(item).map(([key, nestedValue]) => (
                                <div
                                    key={key}
                                    className="flex items-start justify-between gap-2"
                                >
                                    <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                        {formatLabel(key)}
                                    </span>

                                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200 text-right">
                                        {formatValue(nestedValue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (typeof value === "object" && value !== null) {
        return (
            <div className="space-y-1 text-left">
                {Object.entries(value).map(([key, nestedValue]) => (
                    <div
                        key={key}
                        className="flex items-start justify-between gap-2"
                    >
                        <span className="text-[9px] text-gray-500 dark:text-gray-400">
                            {formatLabel(key)}
                        </span>

                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200 text-right">
                            {formatValue(nestedValue)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return formatValue(value);
};

const AnomaliesCard: React.FC<Props> = ({ anomalies }) => (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <IconAlertTriangle size={16} />
            Anomalies

            {anomalies.length > 0 && (
                <span className="text-xs text-gray-400 font-normal">
                    ({anomalies.length})
                </span>
            )}
        </h3>

        {anomalies.length === 0 ? (
            <EmptyState message="No anomalies detected." />
        ) : (
            <div className="space-y-3">
                {anomalies.map((a) => (
                    <div
                        key={a.id}
                        className="rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-800/80 p-3 space-y-2"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
                                    {formatLabel(a.anomaly_type)}
                                </p>

                                <p className="text-[10px] text-gray-400">
                                    #{a.id}
                                    {a.plant_id !== undefined &&
                                        ` · Plant #${a.plant_id}`}
                                    {" · "}
                                    {new Date(a.detected_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                                <Badge
                                    label={a.severity}
                                    variant={severityVariant[a.severity]}
                                    size="xsmall"
                                />

                                <Badge
                                    label={
                                        a.is_resolved
                                            ? "Resolved"
                                            : "Unresolved"
                                    }
                                    variant={
                                        a.is_resolved ? "success" : "gray"
                                    }
                                    size="xsmall"
                                />
                            </div>
                        </div>

                        {a.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                {a.description}
                            </p>
                        )}

                        {a.evidence &&
                            Object.keys(a.evidence).length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-gray-200 dark:border-white/5">
                                    {Object.entries(a.evidence).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className={`bg-white dark:bg-gray-900 rounded-md px-2 py-1 ${
                                                    Array.isArray(value) ||
                                                    (typeof value ===
                                                        "object" &&
                                                        value !== null)
                                                        ? "text-left col-span-2 sm:col-span-2"
                                                        : "text-center"
                                                }`}
                                            >
                                                <p className="text-[9px] text-gray-500 dark:text-gray-400 capitalize truncate mb-0.5">
                                                    {formatLabel(key)}
                                                </p>

                                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                    {renderEvidenceValue(
                                                        value
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default AnomaliesCard;

