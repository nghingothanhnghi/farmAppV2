// src/components/HydroponicSystemPage/components/AiVisionPanel.tsx
import React, { useRef, useState } from "react";
import { IconAlertTriangle, IconBulb, IconLeaf, IconCamera, IconPlus } from "@tabler/icons-react";
import { useAiVision } from "../../../hooks/useAiVision";
import Badge from "../../common/Badge";
import Spinner from "../../common/Spinner";
import EmptyState from "../../common/EmptyState";
import FileInput from "../../common/FileInput";
import Button from "../../common/Button";
import {FormInput} from '../../../components/common/Form';
import DropdownButton from "../../common/DropdownButton";
import { useCamera } from "../../../hooks/useCamera";

interface Props {
    plantId: number;
    cameraId?: number;
}

const severityVariant = {
    low: "info",
    medium: "warning",
    high: "danger",
    critical: "danger",
} as const;

const AiVisionPanel: React.FC<Props> = ({ plantId, cameraId }) => {
    const {
        health,
        growthHistory,
        anomalies,
        recommendations,
        lastImage,
        lastJob,
        uploading,
        analyzing,
        error,
        camerasForPlant,
        selectedCameraId,
        setSelectedCameraId,
        actions,
    } = useAiVision(plantId);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const latestGrowth = growthHistory[0];

    const [showLiveCapture, setShowLiveCapture] = useState(false);
    const [newCameraName, setNewCameraName] = useState("");
    const [creatingCamera, setCreatingCamera] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { startCamera, stopCamera, isStreaming } = useCamera({
        videoRef,
        facingMode: "environment",
    });

    const handleAddCamera = async () => {
        if (!newCameraName.trim()) return;
        setCreatingCamera(true);
        try {
            await actions.createCamera(newCameraName.trim(), plantId);
            setNewCameraName("");
        } finally {
            setCreatingCamera(false);
        }
    };

    const handleCaptureAndAnalyze = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
            await actions.uploadAndAnalyze(plantId, file, selectedCameraId);
            stopCamera();
            setShowLiveCapture(false);
        }, "image/jpeg", 0.9);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await actions.uploadAndAnalyze(plantId, file, cameraId);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">Camera</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tag uploads with a camera, or add a new one.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownButton
                            label={
                                camerasForPlant.find((c) => c.id === selectedCameraId)?.name ?? "No camera"
                            }
                            items={[
                                { label: "No camera", value: "" },
                                ...camerasForPlant.map((c) => ({ label: c.name, value: String(c.id) })),
                            ]}
                            onSelect={(item) => setSelectedCameraId(item.value ? Number(item.value) : undefined)}
                            size="sm"
                        />

                        <FormInput
                            id="new-camera-name"
                            type="text"
                            placeholder="New camera name"
                            value={newCameraName}
                            onChange={(e) => setNewCameraName(e.target.value)}
                            className="w-40"
                        />
                        <Button
                            label={creatingCamera ? "Adding..." : "Add"}
                            icon={<IconPlus size={14} />}
                            iconPosition="left"
                            size="sm"
                            variant="secondary"
                            rounded="lg"
                            disabled={creatingCamera || !newCameraName.trim()}
                            onClick={handleAddCamera}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        label={showLiveCapture ? "Close Camera" : "Use Live Camera"}
                        icon={<IconCamera size={14} />}
                        iconPosition="left"
                        variant="secondary"
                        size="sm"
                        rounded="lg"
                        onClick={() => {
                            if (showLiveCapture) {
                                stopCamera();
                                setShowLiveCapture(false);
                            } else {
                                setShowLiveCapture(true);
                                startCamera();
                            }
                        }}
                    />
                </div>

                {showLiveCapture && (
                    <div className="space-y-2">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-sm rounded-lg bg-black" />
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        <Button
                            label="Capture & Analyze"
                            onClick={handleCaptureAndAnalyze}
                            disabled={!isStreaming}
                            rounded="lg"
                            size="sm"
                        />
                    </div>
                )}
            </div>
            {/* Upload */}
            <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
                        AI Vision Analysis
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload a plant photo to detect growth, health and anomalies.
                    </p>
                </div>
                <FileInput
                    id="ai-vision-upload"
                    inputRef={inputRef}
                    accept="image/*"
                    label={uploading ? "Uploading..." : "Upload Photo"}
                    onChange={handleFileChange}
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

            {lastImage && lastJob && (
                <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 flex items-center gap-4">
                    <img src={lastImage.url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    <div className="text-sm">
                        <p className="font-medium text-gray-700 dark:text-gray-100">Last analysis</p>
                        <Badge
                            label={lastJob.status}
                            variant={
                                lastJob.status === "completed"
                                    ? "success"
                                    : lastJob.status === "failed"
                                        ? "danger"
                                        : "warning"
                            }
                            size="xsmall"
                        />
                        {lastJob.error_message && (
                            <p className="text-xs text-red-500 mt-1">{lastJob.error_message}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Health & Growth */}
            <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                    <IconLeaf size={16} /> Health & Growth
                </h4>
                {health ? (
                    <div className="flex items-center justify-between text-sm">
                        <span>Health Score</span>
                        <Badge
                            label={`${health.health_score}/100 — ${health.status}`}
                            variant={health.status === "healthy" ? "success" : "warning"}
                        />
                    </div>
                ) : (
                    <p className="text-xs text-gray-500">No health record yet.</p>
                )}
                {latestGrowth?.growth_rate_pct != null && (
                    <div className="flex items-center justify-between text-sm">
                        <span>Latest Growth Rate</span>
                        <span className="font-medium">{latestGrowth.growth_rate_pct.toFixed(1)}%</span>
                    </div>
                )}
            </div>

            {/* Anomalies + Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <IconAlertTriangle size={16} /> Anomalies
                    </h3>
                    {anomalies.length === 0 ? (
                        <EmptyState message="No anomalies detected." />
                    ) : (
                        anomalies.map((a) => (
                            <div
                                key={a.id}
                                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 text-sm"
                            >
                                <span>{a.type}</span>
                                <Badge label={a.severity} variant={severityVariant[a.severity]} size="xsmall" />
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <IconBulb size={16} /> Recommendations
                    </h3>
                    {recommendations.length === 0 ? (
                        <EmptyState message="No recommendations yet." />
                    ) : (
                        recommendations.map((r) => (
                            <div key={r.id} className="py-2 border-b border-gray-100 dark:border-white/5 text-sm space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{r.title}</p>
                                    <Badge
                                        label={r.status.replace("_", " ")}
                                        variant={r.status === "approved" ? "success" : "gray"}
                                        size="xsmall"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">{r.description}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiVisionPanel;