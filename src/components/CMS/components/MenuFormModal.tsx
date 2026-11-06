// src/components/CMS/components/MenuFormModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { FormGroup, FormLabel, FormInput } from "../../common/Form";
import { slugify } from "../../../utils/slug";
import { getApiErrorMessage } from "../../../utils/apiError";
import type { CmsMenuSummary, MenuInput } from "../../../models/interfaces/Menu";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    initialData?: CmsMenuSummary | null;
    /** Throws on failure; the modal stays open and shows the message (e.g. 400 "location already in use"). */
    onSubmit: (data: MenuInput) => Promise<void>;
}

// Locations are free-form keys agreed with the site (guide §6); these are just hints.
const LOCATION_SUGGESTIONS = ["header", "footer"];

const MenuFormModal: React.FC<Props> = ({ isOpen, onClose, mode, initialData, onSubmit }) => {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);

        if (mode === "edit" && initialData) {
            setName(initialData.name);
            setSlug(initialData.slug);
            setSlugTouched(true);
            setLocation(initialData.location ?? "");
        } else {
            setName("");
            setSlug("");
            setSlugTouched(false);
            setLocation("");
        }
    }, [isOpen, mode, initialData]);

    useEffect(() => {
        if (!slugTouched) setSlug(slugify(name));
    }, [name, slugTouched]);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            setLoading(true);
            setError(null);
            await onSubmit({
                name: name.trim(),
                slug: slug.trim() || undefined,
                location: location.trim() || null,
            });
            onClose();
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to save menu."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Menu" : "New Menu"}
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="menu_name">Name</FormLabel>
                        <FormInput
                            id="menu_name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="menu_slug">Slug</FormLabel>
                        <FormInput
                            id="menu_slug"
                            type="text"
                            value={slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setSlug(e.target.value);
                            }}
                        />
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="menu_location">Location</FormLabel>
                        <FormInput
                            id="menu_location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. header, footer"
                        />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            The site renders the menu that has this location (commonly{" "}
                            {LOCATION_SUGGESTIONS.join(" or ")}). Each location can belong to one menu only,
                            and changing it changes which menu the site shows.
                        </p>
                    </FormGroup>

                    {error && <p className="text-xs text-red-500">{error}</p>}
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

export default MenuFormModal;
