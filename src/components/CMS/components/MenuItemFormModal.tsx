// src/components/CMS/components/MenuItemFormModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { FormGroup, FormLabel, FormInput, FormSelect, FormCheckbox } from "../../common/Form";
import { getApiErrorMessage } from "../../../utils/apiError";
import { countChildren, flattenForSelect } from "../../../utils/menuTree";
import { MENU_LIMITS, type CmsMenuItem, type MenuItemInput, type MenuItemTargetType } from "../../../models/interfaces/Menu";
import type { CmsCategory } from "../../../models/interfaces/Post";

export interface PostOption {
    id: number;
    title: string;
    post_type: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    initialData?: CmsMenuItem | null;
    /** Current item tree: used for the parent picker (excluding the item and its subtree) and to append. */
    items: CmsMenuItem[];
    categories: CmsCategory[];
    posts: PostOption[];
    /** Optional server-side search for the post picker (published posts/pages matching the text). */
    searchPosts?: (query: string) => Promise<PostOption[]>;
    /** Throws on failure; the modal stays open and shows the message. */
    onSubmit: (data: MenuItemInput) => Promise<void>;
}

const TARGET_LABELS: Record<MenuItemTargetType, string> = {
    custom: "Custom link",
    category: "Category",
    post: "Post / page",
};

const MenuItemFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    mode,
    initialData,
    items,
    categories,
    posts,
    searchPosts,
    onSubmit,
}) => {
    const [label, setLabel] = useState("");
    const [targetType, setTargetType] = useState<MenuItemTargetType>("custom");
    const [url, setUrl] = useState("");
    const [targetId, setTargetId] = useState("");
    const [parentId, setParentId] = useState("");
    const [openInNewTab, setOpenInNewTab] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Post picker: starts with the preloaded list; typing searches the server (debounced).
    const [postQuery, setPostQuery] = useState("");
    const [postOptions, setPostOptions] = useState<PostOption[]>(posts);
    const [postSearching, setPostSearching] = useState(false);

    useEffect(() => { setPostOptions(posts); }, [posts]);

    useEffect(() => {
        if (!isOpen) setPostQuery("");
    }, [isOpen]);

    useEffect(() => {
        if (!searchPosts || targetType !== "post") return;
        if (!postQuery.trim()) { setPostOptions(posts); return; }
        let cancelled = false;
        const timer = setTimeout(async () => {
            setPostSearching(true);
            try {
                const found = await searchPosts(postQuery);
                if (!cancelled) setPostOptions(found);
            } catch {
                // keep the previous options; the picker is only a convenience
            } finally {
                if (!cancelled) setPostSearching(false);
            }
        }, 300);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [postQuery, searchPosts, targetType, posts]);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);

        if (mode === "edit" && initialData) {
            setLabel(initialData.label);
            setTargetType(initialData.target_type);
            setUrl(initialData.url ?? "");
            setTargetId(initialData.target_id != null ? String(initialData.target_id) : "");
            setParentId(initialData.parent_id != null ? String(initialData.parent_id) : "");
            setOpenInNewTab(initialData.open_in_new_tab);
            setIsActive(initialData.is_active);
        } else {
            setLabel("");
            setTargetType("custom");
            setUrl("");
            setTargetId("");
            setParentId("");
            setOpenInNewTab(false);
            setIsActive(true);
        }
    }, [isOpen, mode, initialData]);

    const parentOptions = useMemo(
        () => flattenForSelect(items, mode === "edit" ? initialData?.id : undefined),
        [items, mode, initialData]
    );

    const targetMissing =
        targetType === "custom" ? !url.trim() : !targetId;
    const canSubmit = !!label.trim() && !targetMissing && !loading;

    const handleTargetTypeChange = (next: MenuItemTargetType) => {
        setTargetType(next);
        setTargetId(""); // ids of another type are meaningless
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;

        const newParent = parentId ? Number(parentId) : null;
        const payload: MenuItemInput = {
            label: label.trim(),
            target_type: targetType,
            url: targetType === "custom" ? url.trim() : null,
            target_id: targetType === "custom" ? null : Number(targetId),
            parent_id: newParent,
            open_in_new_tab: openInNewTab,
            is_active: isActive,
        };
        // New items, and items moved to another parent, go last among their new siblings.
        if (mode === "create" || newParent !== (initialData?.parent_id ?? null)) {
            payload.order = countChildren(items, newParent);
        }

        try {
            setLoading(true);
            setError(null);
            await onSubmit(payload);
            onClose();
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to save menu item."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Menu Item" : "New Menu Item"}
            size="small"
            content={
                <div className="px-10 pb-4 space-y-4">
                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="mi_label">Label</FormLabel>
                        <FormInput
                            id="mi_label"
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            maxLength={MENU_LIMITS.itemLabel}
                            required
                        />
                    </FormGroup>

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="mi_type">Links to</FormLabel>
                        <FormSelect
                            id="mi_type"
                            value={targetType}
                            onChange={(e) => handleTargetTypeChange(e.target.value as MenuItemTargetType)}
                        >
                            {(Object.keys(TARGET_LABELS) as MenuItemTargetType[]).map((t) => (
                                <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                            ))}
                        </FormSelect>
                    </FormGroup>

                    {targetType === "custom" && (
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="mi_url">URL</FormLabel>
                            <FormInput
                                id="mi_url"
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                maxLength={MENU_LIMITS.itemUrl}
                                placeholder="/about or https://example.com"
                            />
                        </FormGroup>
                    )}

                    {targetType === "category" && (
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="mi_category">Category</FormLabel>
                            <FormSelect
                                id="mi_category"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                            >
                                <option value="">Select a category…</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </FormSelect>
                        </FormGroup>
                    )}

                    {targetType === "post" && (
                        <FormGroup className="space-y-1">
                            <FormLabel htmlFor="mi_post">Post / page</FormLabel>
                            {searchPosts && (
                                <FormInput
                                    id="mi_post_search"
                                    type="text"
                                    value={postQuery}
                                    onChange={(e) => setPostQuery(e.target.value)}
                                    placeholder="Search published posts by title or excerpt…"
                                />
                            )}
                            <FormSelect
                                id="mi_post"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                            >
                                <option value="">Select a published post or page…</option>
                                {/* keep the current target selectable even if it is no longer in the list */}
                                {targetId && !postOptions.some((p) => String(p.id) === targetId) && (
                                    <option value={targetId}>Current target (#{targetId})</option>
                                )}
                                {postOptions.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title}{p.post_type === "page" ? " (page)" : ""}
                                    </option>
                                ))}
                            </FormSelect>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {postSearching ? "Searching… " : ""}Only published items are listed. A link to an unpublished post is hidden on the site.
                            </p>
                        </FormGroup>
                    )}

                    <FormGroup className="space-y-1">
                        <FormLabel htmlFor="mi_parent">Parent item</FormLabel>
                        <FormSelect
                            id="mi_parent"
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                        >
                            <option value="">No parent (top level)</option>
                            {parentOptions.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {"— ".repeat(o.depth)}{o.label}
                                </option>
                            ))}
                        </FormSelect>
                    </FormGroup>

                    <div className="flex flex-col gap-2">
                        <FormCheckbox
                            id="mi_new_tab"
                            name="open_in_new_tab"
                            checked={openInNewTab}
                            onChange={(e) => setOpenInNewTab(e.target.checked)}
                            label="Open in a new tab"
                        />
                        <FormCheckbox
                            id="mi_active"
                            name="is_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            label="Active (shown on the site)"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
            }
            actions={
                <div className="flex gap-4">
                    <Button
                        label={loading ? "Saving..." : mode === "edit" ? "Update" : "Add item"}
                        onClick={handleSubmit}
                        disabled={!canSubmit}
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

export default MenuItemFormModal;
