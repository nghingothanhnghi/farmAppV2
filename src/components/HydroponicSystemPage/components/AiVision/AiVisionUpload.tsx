import React from "react";
import Badge from "../../../common/Badge";
import FileInput from "../../../common/FileInput";
import type { RefObject } from "react";
import { getJobVariant } from "../../../../utils/aiVision";

interface Props {
    inputRef: RefObject<HTMLInputElement | null>;
    uploading: boolean;
    lastImage: {
        url: string;
    } | null;
    lastJob: {
        status: string;
        error_message?: string | null;
    } | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AiVisionUpload: React.FC<Props> = ({
    inputRef,
    uploading,
    lastImage,
    lastJob,
    onChange,
}) => (
    <>
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
                onChange={onChange}
            />
        </div>

        {lastImage && lastJob && (
            <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 flex items-center gap-4">
                <img
                    src={lastImage.url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg"
                />

                <div className="text-sm">
                    <p className="font-medium text-gray-700 dark:text-gray-100">
                        Last analysis
                    </p>

                    <Badge
                        label={lastJob.status}
                        variant={getJobVariant(lastJob.status)}
                        size="xsmall"
                    />

                    {lastJob.error_message && (
                        <p className="text-xs text-red-500 mt-1">
                            {lastJob.error_message}
                        </p>
                    )}
                </div>
            </div>
        )}
    </>
);

export default AiVisionUpload;