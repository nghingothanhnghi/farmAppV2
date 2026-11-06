// src/components/CMS/components/MediaUploadModal.tsx
import React, { useEffect, useRef, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { FormGroup, FormLabel, FormInput } from "../../common/Form";
import FileInput from "../../common/FileInput";
import { CMS_IMAGE_ACCEPT, CMS_MAX_MEDIA_SIZE_MB, validateMediaFile } from "../../../utils/mediaValidation";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File, altText?: string) => Promise<void>;
}

const MediaUploadModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
    const [file, setFile] = useState<File | null>(null);
    const [altText, setAltText] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setFileError(null);
            setAltText("");
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] || null;
        const error = picked ? validateMediaFile(picked, { imagesOnly: true }) : null;
        setFileError(error);
        setFile(error ? null : picked);
        if (error && fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!file) return;

        try {
            setLoading(true);
            await onSubmit(file, altText.trim() || undefined);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Upload Media"
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="media_file">File</FormLabel>
                        <FileInput
                            id="media_file"
                            inputRef={fileInputRef}
                            accept={CMS_IMAGE_ACCEPT}
                            multiple={false}
                            label="Choose image"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            JPG, PNG, GIF or WebP, up to {CMS_MAX_MEDIA_SIZE_MB} MB.
                        </p>
                        {fileError && <p className="text-xs text-red-500">{fileError}</p>}
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="media_alt">Alt Text (optional)</FormLabel>
                        <FormInput
                            id="media_alt"
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
                        label={loading ? "Uploading..." : "Upload"}
                        onClick={handleSubmit}
                        disabled={loading || !file}
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

export default MediaUploadModal;