// src/components/CMS/components/MediaEditModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { FormGroup, FormLabel, FormInput } from "../../common/Form";
import type { CmsMedia } from "../../../models/interfaces/Post";
import { getImageUrl } from "../../../utils/getImageUrl";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    media: CmsMedia | null;
    onSubmit: (altText?: string) => Promise<void>;
}

const MediaEditModal: React.FC<Props> = ({ isOpen, onClose, media, onSubmit }) => {
    const [altText, setAltText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAltText(media?.alt_text || "");
        }
    }, [isOpen, media]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onSubmit(altText.trim() || undefined);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Media"
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    {media?.url && (
                        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-950 flex items-center justify-center overflow-hidden rounded-lg">
                            <img
                                src={getImageUrl(media.url)}
                                alt={media.alt_text || media.filename}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="media_edit_filename">Filename</FormLabel>
                        <FormInput
                            id="media_edit_filename"
                            type="text"
                            value={media?.filename || ""}
                            onChange={() => {}}
                            disabled
                        />
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="media_edit_alt">Alt Text</FormLabel>
                        <FormInput
                            id="media_edit_alt"
                            type="text"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="Description for accessibility / SEO"
                        />
                    </FormGroup>
                </div>
            }
            actions={
                <div className="flex gap-4">
                    <Button
                        label={loading ? "Saving..." : "Save"}
                        onClick={handleSubmit}
                        disabled={loading}
                        className="min-w-[150px]"
                        rounded="lg"
                    />
                    <Button
                        label="Cancel"
                        variant="secondary"
                        onClick={onClose}
                        className="min-w-[150px]"
                        rounded="lg"
                    />
                </div>
            }
        />
    );
};

export default MediaEditModal;