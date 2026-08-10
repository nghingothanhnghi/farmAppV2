// src/components/common/MediaPickerModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { IconPhotoPlus } from "@tabler/icons-react";
import Modal from "./Modal";
import Button from "./Button";
import Spinner from "./Spinner";
import EmptyState from "./EmptyState";
import { mediaService } from "../../services/mediaService";
import { getImageUrl } from "../../utils/getImageUrl";
import { useAlert } from "../../contexts/alertContext";
import type { CmsMedia } from "../../models/interfaces/Post";

const PAGE_SIZE = 30;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string, altText?: string) => void;
}

const MediaPickerModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
    const { setAlert } = useAlert();

    const [media, setMedia] = useState<CmsMedia[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fetchMedia = async (skip = 0) => {
        try {
            if (skip === 0) setLoading(true);
            else setLoadingMore(true);

            const data = await mediaService.getAll({ skip, limit: PAGE_SIZE });
            setMedia((prev) => (skip === 0 ? data : [...prev, ...data]));
            setHasMore(data.length === PAGE_SIZE);
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to load media library.",
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMedia(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const created = await mediaService.upload(file);
            setAlert({ type: "success", message: `"${created.filename}" uploaded.` });
            onSelect(getImageUrl(created.url), created.alt_text);
            onClose();
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to upload image.",
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSelectMedia = (item: CmsMedia) => {
        onSelect(getImageUrl(item.url), item.alt_text);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Insert Image"
            size="medium"
            content={
                <div className="px-10 pb-4 space-y-4">
                    {/* Upload row */}
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <IconPhotoPlus size={20} className="text-gray-400" />
                            <span>Upload a new image, or pick one from the library below.</span>
                        </div>
                        <Button
                            label={uploading ? "Uploading..." : "Upload"}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            icon={uploading ? <Spinner size={14} colorClass="border-white" /> : undefined}
                            variant="primary"
                            rounded="lg"
                            size="sm"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelected}
                        />
                    </div>

                    {/* Library grid */}
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Spinner size={32} />
                        </div>
                    ) : media.length === 0 ? (
                        <EmptyState message="No media uploaded yet." />
                    ) : (
                        <>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[45vh] overflow-y-auto pr-1">
                                {media.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => handleSelectMedia(item)}
                                        className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-white/5 hover:ring-2 hover:ring-orange-500 transition-all"
                                        title={item.filename}
                                    >
                                        <img
                                            src={getImageUrl(item.url)}
                                            alt={item.alt_text || item.filename}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium transition-opacity">
                                                Select
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center pt-2">
                                    <Button
                                        label={loadingMore ? "Loading..." : "Load More"}
                                        variant="secondary"
                                        onClick={() => fetchMedia(media.length)}
                                        disabled={loadingMore}
                                        rounded="lg"
                                        size="sm"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            }
            actions={
                <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={onClose}
                    className="min-w-[150px]"
                    rounded="lg"
                />
            }
        />
    );
};

export default MediaPickerModal;