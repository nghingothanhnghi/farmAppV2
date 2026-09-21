// src/components/HydroponicSystemPage/components/AiVision/AiVisionCamera.tsx
import React, { useRef, useState } from "react";
import { IconCamera, IconPlus } from "@tabler/icons-react";
import Button from "../../../common/Button";
import DropdownButton from "../../../common/DropdownButton";
import { FormInput } from "../../../common/Form";
import { useCamera } from "../../../../hooks/useCamera";

interface Camera {
    id: number;
    name: string;
}

interface Props {
    cameras: Camera[];
    selectedCameraId?: number;
    onSelectCamera: (id?: number) => void;
    onCreateCamera: (name: string) => Promise<unknown>;
    onAnalyze: (file: File, cameraId?: number) => Promise<unknown>;
}

const AiVisionCamera: React.FC<Props> = ({
    cameras,
    selectedCameraId,
    onSelectCamera,
    onCreateCamera,
    onAnalyze,
}) => {
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
        const name = newCameraName.trim();
        if (!name) return;

        setCreatingCamera(true);

        try {
            await onCreateCamera(name);
            setNewCameraName("");
        } finally {
            setCreatingCamera(false);
        }
    };

    const handleCapture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext("2d")?.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const file = new File(
                [blob],
                `capture-${Date.now()}.jpg`,
                { type: "image/jpeg" }
            );

            await onAnalyze(file, selectedCameraId);

            stopCamera();
            setShowLiveCapture(false);
        }, "image/jpeg", 0.9);
    };

    const toggleLiveCamera = () => {
        if (showLiveCapture) {
            stopCamera();
            setShowLiveCapture(false);
            return;
        }

        setShowLiveCapture(true);
        startCamera();
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
                        Camera
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tag uploads with a camera, or add a new one.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <DropdownButton
                        label={
                            cameras.find((c) => c.id === selectedCameraId)?.name ??
                            "No camera"
                        }
                        items={[
                            { label: "No camera", value: "" },
                            ...cameras.map((c) => ({
                                label: c.name,
                                value: String(c.id),
                            })),
                        ]}
                        onSelect={(item) =>
                            onSelectCamera(
                                item.value ? Number(item.value) : undefined
                            )
                        }
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

            <Button
                label={showLiveCapture ? "Close Camera" : "Use Live Camera"}
                icon={<IconCamera size={14} />}
                iconPosition="left"
                variant="secondary"
                size="sm"
                rounded="lg"
                onClick={toggleLiveCamera}
            />

            {showLiveCapture && (
                <div className="space-y-2">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-sm rounded-lg bg-black"
                    />

                    <canvas ref={canvasRef} hidden />

                    <Button
                        label="Capture & Analyze"
                        onClick={handleCapture}
                        disabled={!isStreaming}
                        rounded="lg"
                        size="sm"
                    />
                </div>
            )}
        </div>
    );
};

export default AiVisionCamera;