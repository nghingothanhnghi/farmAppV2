// src/components/CMS/CmsMediaManagementPage.tsx
import React, { useCallback, useEffect, useState } from "react";
import { IconPlus, IconAlertCircle, IconMoodEmpty, IconPencil, IconTrash, IconCopy } from "@tabler/icons-react";
import { mediaService } from "../../services/mediaService";
import { useAlert } from "../../contexts/alertContext";
import type { CmsMedia } from "../../models/interfaces/Post";
import PageTitle from "../common/PageTitle";
import LinearProgress from "../common/LinearProgress";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";
import Button from "../common/Button";
import MediaUploadModal from "./components/MediaUploadModal";
import MediaEditModal from "./components/MediaEditModal";

const PAGE_SIZE = 50;

const CmsMediaManagementPage: React.FC = () => {
    const { setAlert } = useAlert();

    const [media, setMedia] = useState<CmsMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMedia, setEditingMedia] = useState<CmsMedia | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<CmsMedia | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchMedia = useCallback(async (skip = 0) => {
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
    }, [setAlert]);

    useEffect(() => {
        fetchMedia(0);
    }, [fetchMedia]);

    const handleUpload = async (file: File, altText?: string) => {
        try {
            const created = await mediaService.upload(file, altText);
            setMedia((prev) => [created, ...prev]);
            setAlert({ type: "success", message: `"${created.filename}" uploaded successfully.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to upload media.",
            });
            throw err;
        }
    };

    const handleEditSubmit = async (altText?: string) => {
        if (!editingMedia) return;
        try {
            const updated = await mediaService.update(editingMedia.id, altText);
            setMedia((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            setAlert({ type: "success", message: "Media updated successfully." });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to update media.",
            });
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedMedia) return;
        setDeleting(true);
        try {
            await mediaService.delete(selectedMedia.id);
            setMedia((prev) => prev.filter((m) => m.id !== selectedMedia.id));
            setAlert({ type: "success", message: `"${selectedMedia.filename}" deleted.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message:
                    err.response?.data?.detail ??
                    "Failed to delete media. It may still be in use by a post.",
            });
        } finally {
            setDeleting(false);
            setConfirmModalOpen(false);
            setSelectedMedia(null);
        }
    };

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setAlert({ type: "success", message: "URL copied to clipboard." });
        } catch {
            setAlert({ type: "error", message: "Failed to copy URL." });
        }
    };

    if (loading && media.length === 0) {
        return <LinearProgress position="absolute" thickness="h-1" duration={3000} />;
    }

    return (
        <div className="">
            <PageTitle
                title="Media Library"
                subtitle="Upload and manage images used across your CMS posts."
                actions={
                    <Button
                        type="button"
                        label="Upload Media"
                        onClick={() => setUploadModalOpen(true)}
                        variant="secondary"
                        icon={<IconPlus size={16} className="text-gray-500" />}
                        iconPosition="left"
                        rounded="lg"
                    />
                }
            />

            {media.length === 0 ? (
                <EmptyState
                    icon={<IconMoodEmpty size={48} />}
                    message="No media uploaded yet."
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {media.map((item) => (
                            <div
                                key={item.id}
                                className="group relative rounded-lg overflow-hidden bg-white shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                            >
                                <div className="aspect-square w-full bg-gray-100 dark:bg-gray-950 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={item.url}
                                        alt={item.alt_text || item.filename}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="p-2">
                                    <p
                                        className="text-[0.625rem] text-gray-700 dark:text-gray-300 truncate"
                                        title={item.filename}
                                    >
                                        {item.filename}
                                    </p>
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-900 rounded-full shadow-md p-1">
                                    <Button
                                        variant="secondary"
                                        icon={<IconCopy size={14} />}
                                        iconOnly
                                        label="Copy URL"
                                        size="xxs"
                                        rounded="full"
                                        className="bg-transparent"
                                        onClick={() => handleCopyUrl(item.url)}
                                    />
                                    <Button
                                        variant="secondary"
                                        icon={<IconPencil size={14} />}
                                        iconOnly
                                        label="Edit"
                                        size="xxs"
                                        rounded="full"
                                        className="bg-transparent"
                                        onClick={() => {
                                            setEditingMedia(item);
                                            setEditModalOpen(true);
                                        }}
                                    />
                                    <Button
                                        variant="secondary"
                                        icon={<IconTrash size={14} />}
                                        iconOnly
                                        label="Delete"
                                        size="xxs"
                                        rounded="full"
                                        className="bg-transparent"
                                        onClick={() => {
                                            setSelectedMedia(item);
                                            setConfirmModalOpen(true);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <Button
                                label={loadingMore ? "Loading..." : "Load More"}
                                variant="secondary"
                                onClick={() => fetchMedia(media.length)}
                                disabled={loadingMore}
                                rounded="lg"
                            />
                        </div>
                    )}
                </>
            )}

            <MediaUploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onSubmit={handleUpload}
            />

            <MediaEditModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditingMedia(null);
                }}
                media={editingMedia}
                onSubmit={handleEditSubmit}
            />

            <Modal
                showCloseButton={false}
                size="xsmall"
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedMedia(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        Are you sure you want to delete{" "}
                        <strong>{selectedMedia?.filename}</strong>?
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            This cannot be undone. Posts referencing this image may break.
                        </p>
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label={deleting ? "Deleting..." : "Yes, Delete"}
                            variant="danger"
                            onClick={handleConfirmDelete}
                            className="min-w-[150px]"
                            rounded="lg"
                            disabled={deleting}
                        />
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onClick={() => setConfirmModalOpen(false)}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                    </div>
                }
            />
        </div>
    );
};

export default CmsMediaManagementPage;