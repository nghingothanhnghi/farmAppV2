// src/components/CMS/components/CategoryFormModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { FormGroup, FormLabel, FormInput, FormSelect } from "../../common/Form";
import { slugify } from "../../../utils/slug";
import type { CmsCategory } from "../../../models/interfaces/Post";
import type { CategoryInput } from "../../../hooks/useCategory";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    initialData?: CmsCategory | null;
    categories: CmsCategory[]; // for parent picker, excludes self
    onSubmit: (data: CategoryInput) => Promise<void>;
}

const CategoryFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    mode,
    initialData,
    categories,
    onSubmit,
}) => {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [parentId, setParentId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setName(initialData.name);
            setSlug(initialData.slug);
            setSlugTouched(true);
            setParentId(initialData.parent_id ? String(initialData.parent_id) : "");
        } else {
            setName("");
            setSlug("");
            setSlugTouched(false);
            setParentId("");
        }
    }, [isOpen, mode, initialData]);

    // auto-generate slug from name until the user manually edits slug
    useEffect(() => {
        if (!slugTouched) {
            setSlug(slugify(name));
        }
    }, [name, slugTouched]);

    const selectableParents = categories.filter(
        (c) => !initialData || c.id !== initialData.id
    );

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            setLoading(true);
            await onSubmit({
                name: name.trim(),
                slug: slug.trim() || undefined,
                parent_id: parentId ? Number(parentId) : null,
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Category" : "New Category"}
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="cat_name">Name</FormLabel>
                        <FormInput
                            id="cat_name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="cat_slug">Slug</FormLabel>
                        <FormInput
                            id="cat_slug"
                            type="text"
                            value={slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setSlug(e.target.value);
                            }}
                        />
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="cat_parent">Parent Category</FormLabel>
                        <FormSelect
                            id="cat_parent"
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                        >
                            <option value="">No parent (top level)</option>
                            {selectableParents.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </FormSelect>
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

export default CategoryFormModal;