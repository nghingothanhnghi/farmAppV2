// src/components/CMS/components/TagFormModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { FormGroup, FormLabel, FormInput } from "../../common/Form";
import { slugify } from "../../../utils/slug";
import type { TagInput } from "../../../hooks/useTag";
import type { CmsTag } from "../../../models/interfaces/Post";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mode?: "create" | "edit";
    initialData?: CmsTag | null;
    /** Throws on failure; the page already showed the error, so the modal just stays open. */
    onSubmit: (data: TagInput) => Promise<void>;
}

const TagFormModal: React.FC<Props> = ({ isOpen, onClose, mode = "create", initialData, onSubmit }) => {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (mode === "edit" && initialData) {
            setName(initialData.name);
            setSlug(initialData.slug);
            setSlugTouched(true); // renaming must not rewrite the public slug
        } else {
            setName("");
            setSlug("");
            setSlugTouched(false);
        }
    }, [isOpen, mode, initialData]);

    useEffect(() => {
        if (!slugTouched) {
            setSlug(slugify(name));
        }
    }, [name, slugTouched]);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            setLoading(true);
            await onSubmit({ name: name.trim(), slug: slug.trim() || undefined });
            onClose();
        } catch {
            // the page already showed the error alert; keep the modal open so nothing is lost
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Tag" : "New Tag"}
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="tag_name">Name</FormLabel>
                        <FormInput
                            id="tag_name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="tag_slug">Slug</FormLabel>
                        <FormInput
                            id="tag_slug"
                            type="text"
                            value={slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setSlug(e.target.value);
                            }}
                        />
                    </FormGroup>
                </div>
            }
            actions={
                <div className="flex gap-4">
                    <Button
                        label={loading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
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

export default TagFormModal;