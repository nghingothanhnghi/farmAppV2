// src/components/HydroponicSystemPage/components/AiMediaDetectionCard.tsx
import React, { useRef, useState } from "react";
import type { RefObject } from "react";
import { useCamera } from "../../../../hooks/useCamera";
import {
    IconCamera,
    IconPhoto,
    IconRefresh,
} from "@tabler/icons-react";
import Badge from "../../../common/Badge";
import AddCameraModal from "./AddCameraModal";
import FileInput from "../../../common/FileInput";
import { getJobVariant } from "../../../../utils/aiVision";
import { getImageUrl } from "../../../../utils/getImageUrl";
import type { VisionCamera, VisionImage } from "../../../../models/interfaces/AiVision";

interface Props {
    // camera props
    cameras: VisionCamera[];
    selectedCameraId?: number;
    onSelectCamera: (id?: number) => void;
    onCreateCamera: (name: string) => Promise<unknown>;
    onAnalyze: (file: File, cameraId?: number) => Promise<unknown>;

    // upload props
    inputRef: RefObject<HTMLInputElement | null>;
    uploading: boolean;
    lastImage: VisionImage | null;
    lastJob: {
        status: string;
        error_message?: string | null;
    } | null;
    displayImageUrl?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type MediaMode = "camera" | "image";

const AiMediaDetectionCard: React.FC<Props> = ({
    selectedCameraId,
    onCreateCamera,
    onAnalyze,

    inputRef,
    uploading,
    lastImage,
    lastJob,
    displayImageUrl,
    onChange,
}) => {
    const [mediaMode, setMediaMode] = useState<MediaMode>("camera");
    const [showAddCameraModal, setShowAddCameraModal] =
        useState(false);
    const [showLiveCapture, setShowLiveCapture] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { startCamera, stopCamera, isStreaming } = useCamera({
        videoRef,
        facingMode: "environment",
    });

    const handleCapture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext("2d")?.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

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

    const handleOpenCamera = () => {
        setMediaMode("camera");
        setShowLiveCapture(true);
        startCamera();
    };

    const handleOpenUpload = () => {
        setMediaMode("image");
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMediaMode("image");
        stopCamera();
        setShowLiveCapture(false);
        onChange(e);
    };

    const handleResetCamera = () => {
        setMediaMode("camera");
        setShowLiveCapture(true);
        startCamera();
    };

    return (


        <>
            <AddCameraModal
                isOpen={showAddCameraModal}
                onClose={() => setShowAddCameraModal(false)}
                onCreateCamera={onCreateCamera}
            />

            <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_500px] auto-rows-fr gap-6">
                    <div className="left-media-button flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center align-middle">
                            <div className="text-gray-400 mb-2">
                                <IconCamera size={64} />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tab to take a photo</h4>
                            <p className="text-gray-500 mb-4">
                                or select from gallery
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                type="button"
                                onClick={handleOpenCamera}
                                // className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                className={[
                                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                                    mediaMode === "camera"
                                        ? "border-blue-500/50 bg-blue-50/50 dark:border-blue-400/40 dark:bg-blue-500/5"
                                        : "border-gray-100 bg-white hover:border-gray-200 dark:border-white/5 dark:bg-gray-900 dark:hover:border-white/10",
                                ].join(" ")}
                            >
                                <div
                                    className={[
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                                        mediaMode === "camera"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                                    ].join(" ")}
                                >
                                    <IconCamera size={20} />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                            Camera
                                        </h3>

                                        {mediaMode === "camera" && (
                                            <Badge
                                                label="Active"
                                                variant="success"
                                                size="xsmall"
                                            />
                                        )}
                                    </div>

                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        Tag uploads with a camera, or add a new one.
                                    </p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={handleOpenUpload}
                                className={[
                                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                                    mediaMode === "image"
                                        ? "border-blue-500/50 bg-blue-50/50 dark:border-blue-400/40 dark:bg-blue-500/5"
                                        : "border-gray-100 bg-white hover:border-gray-200 dark:border-white/5 dark:bg-gray-900 dark:hover:border-white/10",
                                ].join(" ")}
                            >
                                <div
                                    className={[
                                        "flex h-9 w-9 items-center justify-center rounded-lg",
                                        mediaMode === "image"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                                    ].join(" ")}
                                >
                                    <IconPhoto size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                            Gallery
                                        </span>

                                        {mediaMode === "image" && (
                                            <Badge
                                                label="Active"
                                                variant="success"
                                                size="xsmall"
                                            />
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Analyze an existing plant photo.
                                    </p>
                                </div>

                                <IconPhoto
                                    size={18}
                                    className="text-gray-400"
                                />
                            </button>
                        </div>
                    </div>
                    <div className="right-media-preview relative overflow-hidden rounded-xl border border-gray-100 bg-black dark:border-white/5">
                        {mediaMode === "camera" && showLiveCapture ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="aspect-[4/3] w-full object-cover"
                                />

                                {/* Live badge */}
                                <div className="absolute right-3 top-3">
                                    <Badge
                                        label="LIVE"
                                        variant="danger"
                                        size="xsmall"
                                    />
                                </div>

                                {/* Camera controls */}
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/70 to-transparent px-4 pb-5 pt-12">
                                    {/* Upload */}
                                    <button
                                        type="button"
                                        onClick={handleOpenUpload}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                                        aria-label="Upload image"
                                    >
                                        <IconPhoto size={20} />
                                    </button>

                                    {/* Capture */}
                                    <button
                                        type="button"
                                        onClick={handleCapture}
                                        disabled={!isStreaming}
                                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Take photo"
                                    >
                                        <span className="h-12 w-12 rounded-full bg-white border border-gray-300" />
                                    </button>

                                    {/* Spacer keeps capture centered */}
                                    <div className="h-11 w-11" />
                                </div>
                            </>
                        ) : lastImage ? (
                            <>
                                <img
                                    // src={getImageUrl(lastImage.public_url)}
                                    src={getImageUrl(displayImageUrl || lastImage.public_url)}
                                    alt="AI vision result"
                                    className="aspect-[4/3] w-full object-cover"
                                />

                                <div className="absolute right-3 top-3">
                                    <Badge
                                        label={
                                            lastJob?.status === "completed"
                                                ? "ANNOTATED"
                                                : "IMAGE"
                                        }
                                        variant={
                                            lastJob?.status === "completed"
                                                ? "success"
                                                : "info"
                                        }
                                        size="xsmall"
                                    />
                                </div>

                                {/* Result status */}
                                {lastJob && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-medium text-white">
                                                    AI Vision Analysis
                                                </p>

                                                {lastJob.error_message && (
                                                    <p className="mt-1 text-xs text-red-300">
                                                        {lastJob.error_message}
                                                    </p>
                                                )}
                                            </div>

                                            <Badge
                                                label={lastJob.status}
                                                variant={getJobVariant(
                                                    lastJob.status
                                                )}
                                                size="xsmall"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Change source */}
                                <div className="absolute left-3 top-3">
                                    <button
                                        type="button"
                                        onClick={handleResetCamera}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
                                        aria-label="Use camera"
                                    >
                                        <IconRefresh size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex aspect-[4/3] items-center justify-center">
                                <FileInput
                                    id="ai-vision-upload"
                                    inputRef={inputRef}
                                    accept="image/*"
                                    label={
                                        uploading
                                            ? "Uploading..."
                                            : "Upload Photo"
                                    }
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <canvas ref={canvasRef} hidden />
                    </div>
                </div>
            </div>
            {/* Hidden reusable file input */}
            <div className="hidden">
                <FileInput
                    id="ai-vision-upload-hidden"
                    inputRef={inputRef}
                    accept="image/*"
                    label={uploading ? "Uploading..." : "Upload Photo"}
                    onChange={handleChange}
                />
            </div>
        </>

    );
};

export default AiMediaDetectionCard;