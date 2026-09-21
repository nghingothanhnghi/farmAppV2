// src/components/HydroponicSystemPage/components/AiVisionPanel.tsx
import React, { useRef } from "react";
import { useAiVision } from "../../../../hooks/useAiVision";
import Spinner from "../../../common/Spinner";
import AiVisionCamera from "./AiVisionCamera";
import AiVisionUpload from "./AiVisionUpload";
import HealthGrowthCard from "./HealthGrowthCard";
import AnomaliesCard from "./AnomaliesCard";
import RecommendationsCard from "./RecommendationsCard";

interface Props {
    hydroBatchId: number;
}

const AiVisionPanel: React.FC<Props> = ({ hydroBatchId }) => {
    const {
        plant,
        linking,
        camerasForPlant,
        selectedCameraId,
        setSelectedCameraId,
        health,
        growthHistory,
        anomalies,
        recommendations,
        lastImage,
        lastJob,
        uploading,
        analyzing,
        error,
        actions,
    } = useAiVision(hydroBatchId);

    const inputRef = useRef<HTMLInputElement | null>(null);

    if (linking) {
        return (
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300 py-10">
                <Spinner size={20} />
                Linking plant to AI Vision...
            </div>
        );
    }

    if (!plant) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error ?? "Could not link this batch to AI Vision."}
            </div>
        );
    }

    const handleUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        await actions.uploadAndAnalyze(file, selectedCameraId);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6 mx-auto max-w-4xl">
            <div className="grid grid-cols-2 auto-rows-fr gap-6">
                <AiVisionCamera
                    cameras={camerasForPlant}
                    selectedCameraId={selectedCameraId}
                    onSelectCamera={setSelectedCameraId}
                    onCreateCamera={actions.createCamera}
                    onAnalyze={actions.uploadAndAnalyze}
                />

                <AiVisionUpload
                    inputRef={inputRef}
                    uploading={uploading}
                    lastImage={lastImage}
                    lastJob={lastJob}
                    onChange={handleUpload}
                />
            </div>


            {(uploading || analyzing) && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Spinner size={20} />
                    {uploading ? "Uploading image..." : "Running analysis..."}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                    {error}
                </div>
            )}

            <HealthGrowthCard
                plant={plant}
                health={health}
                latestGrowth={growthHistory[0]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnomaliesCard anomalies={anomalies} />
                <RecommendationsCard recommendations={recommendations} />
            </div>
        </div>
    );
};

export default AiVisionPanel;