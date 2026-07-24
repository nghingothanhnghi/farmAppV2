// src/components/CMS/components/PostForm.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PostType, PostStatus, CmsCategory, CmsTag } from "../../../models/interfaces/Post";
import { categoryService } from "../../../services/categoryService";
import { tagService } from "../../../services/tagService";
import Form, { FormGroup, FormLabel, FormInput, FormActions, FormCheckbox, FormSelect } from '../../../components/common/Form';
import Button from '../../common/Button';
import FileInput from '../../common/FileInput';
import DropdownButton from '../../common/DropdownButton';
import MultiSelectDropdown from '../../common/MultiSelectDropdown';

// ✅ Own shape for the form — compatible with both Create and Update payloads.
export interface PostFormData {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    post_type?: PostType;
    status?: PostStatus;
    category_id?: number | null;
    featured_image_id?: number | null;
    tag_ids?: number[];
    meta_title?: string;
    meta_description?: string;
    is_featured?: boolean;
    published_at?: string | null;
}

interface Props {
    formData: PostFormData;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel?: () => void;
    loading: boolean;
    isEdit: boolean;
    fieldErrors: Record<string, string>;

    featuredImageUrl?: string | null;   // current/preview URL to display
    onImageChange?: (file: File | null) => void; // lifts the selected File to the parent

    onCategoryChange?: (categoryId: number | null) => void;
    onTagsChange?: (tagIds: number[]) => void;
}

export default function PostForm({
    formData,
    onChange,
    onSubmit,
    onCancel,
    loading,
    isEdit,
    fieldErrors,
    featuredImageUrl,
    onImageChange,
    onCategoryChange,
    onTagsChange,
}: Props) {

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // ✅ NEW — category & tag data
    const [categories, setCategories] = useState<CmsCategory[]>([]);
    const [tags, setTags] = useState<CmsTag[]>([]);
    const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [cats, tgs] = await Promise.all([
                    categoryService.getAll(),
                    tagService.getAll(),
                ]);
                if (mounted) {
                    setCategories(cats);
                    setTags(tgs);
                }
            } catch (err) {
                console.error("Failed to load categories/tags", err);
            } finally {
                if (mounted) setLoadingTaxonomy(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const categoryItems = useMemo(() => [
        { label: "No category", value: "" },
        ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
    ], [categories]);

    const selectedCategory = categories.find((c) => c.id === formData.category_id);

    const tagOptions = useMemo(() => (
        tags.map((t) => ({
            label: t.name,
            value: String(t.id),
            checked: (formData.tag_ids ?? []).includes(t.id),
        }))
    ), [tags, formData.tag_ids]);

    const fields = [
        [
            "title",
            "Title",
            "text",
            true,
            "The main title displayed to visitors.",
        ],
        [
            "slug",
            "Slug",
            "text",
            true,
            "Unique URL slug. Leave empty to auto-generate.",
        ],
        [
            "excerpt",
            "Excerpt",
            "textarea",
            false,
            "Short summary shown on blog listing.",
        ],
    ] as const;

    if (loading) {

        return <div>Loading...</div>;

    }


    return (
        <Form onSubmit={onSubmit} className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left */}
                <div className="lg:col-span-2 space-y-6">

                    {fields.map(([name, label, type, required, helper]) => (
                        <FormGroup
                            key={name}
                            className="grid gap-x-8 gap-y-6 sm:grid-cols-2"
                        >
                            <div className="space-y-1">
                                <FormLabel htmlFor={name}>
                                    {label}
                                </FormLabel>

                                {helper && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {helper}
                                    </p>
                                )}
                            </div>

                            <div>
                                {type === "textarea" ? (
                                    <textarea
                                        id={name}
                                        name={name}
                                        rows={4}
                                        value={(formData[name] as string) ?? ""}
                                        onChange={onChange}
                                        required={required}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                                    />
                                ) : (
                                    <FormInput
                                        id={name}
                                        name={name}
                                        type={type}
                                        value={(formData[name] as string) ?? ""}
                                        onChange={onChange}
                                        required={required}
                                    />
                                )}

                                {fieldErrors[name] && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {fieldErrors[name]}
                                    </p>
                                )}
                            </div>
                        </FormGroup>
                    ))}

                    {/* Content */}
                    <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormLabel htmlFor="content">
                                Content
                            </FormLabel>

                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Main content of the article.
                            </p>
                        </div>

                        <div>
                            <textarea
                                id="content"
                                name="content"
                                rows={12}
                                value={formData.content ?? ""}
                                onChange={onChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                            />

                            {fieldErrors.content && (
                                <p className="mt-1 text-xs text-red-500">
                                    {fieldErrors.content}
                                </p>
                            )}
                        </div>
                    </FormGroup>

                    <FormGroup className="grid gap-x-8 gap-y-2 lg:gap-y-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormLabel htmlFor="featured_image">Featured Image</FormLabel>
                        </div>
                        <div className="space-y-1">
                            <div className="aspect-video w-full lg:w-[255px] bg-gray-100 dark:bg-gray-950 flex items-center justify-center overflow-hidden rounded-lg">
                                {featuredImageUrl ? (
                                    <img
                                        src={featuredImageUrl}
                                        alt={formData.title || "Featured image"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm">No Image</span>
                                )}
                            </div>
                            {onImageChange && (
                                <FileInput
                                    id="featured_image"
                                    inputRef={fileInputRef}
                                    accept="image/*"
                                    label="Upload Image"
                                    onChange={(e) =>
                                        onImageChange(e.target.files?.[0] || null)
                                    }
                                />
                            )}
                        </div>
                    </FormGroup>

                    {/* ✅ Category picker */}
                    <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormLabel htmlFor="category_id">Category</FormLabel>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Choose a category for this post.
                            </p>
                        </div>
                        <div>
                            <DropdownButton
                                label={
                                    loadingTaxonomy
                                        ? "Loading..."
                                        : selectedCategory?.name || "No category"
                                }
                                items={categoryItems}
                                disabled={loadingTaxonomy}
                                onSelect={(item) =>
                                    onCategoryChange?.(item.value ? Number(item.value) : null)
                                }
                                className="w-full sm:w-auto"
                                variant="secondary"
                            />
                        </div>
                    </FormGroup>

                    {/* ✅ Tags picker */}
                    <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormLabel htmlFor="tag_ids">Tags</FormLabel>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Select one or more tags.
                            </p>
                        </div>
                        <div>
                            <MultiSelectDropdown
                                title={
                                    (formData.tag_ids ?? []).length > 0
                                        ? `Tags (${(formData.tag_ids ?? []).length})`
                                        : "Select tags"
                                }
                                options={tagOptions}
                                disabled={loadingTaxonomy}
                                onChange={(selected) =>
                                    onTagsChange?.(selected.map((v) => Number(v)))
                                }
                            />
                        </div>
                    </FormGroup>

                </div>

                {/* Right */}
                <div className="space-y-6">

                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="p-4">
                            <h3 className="text-sm font-medium">
                                Publish
                            </h3>
                        </div>

                        <div className="space-y-4 p-4">

                            <FormGroup>
                                <FormLabel htmlFor="status">Status</FormLabel>

                                <FormSelect
                                    name="status"
                                    id="status"
                                    value={formData.status ?? "draft"}
                                    onChange={onChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="archived">Archived</option>
                                </FormSelect>
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="post_type">Post Type</FormLabel>

                                <FormSelect
                                    name="post_type"
                                    id="post_type"
                                    value={formData.post_type ?? "post"}
                                    onChange={onChange}
                                >
                                    <option value="post">Post</option>
                                    <option value="page">Page</option>
                                </FormSelect>
                            </FormGroup>

                            <FormCheckbox
                                id="is_featured"
                                label="Featured post"
                                checked={formData.is_featured ?? false}
                                onChange={onChange}
                            />

                        </div>
                    </div>

                </div>


                <hr className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5" />

                <FormActions className="lg:static fixed bottom-0 left-0 right-0 p-4 lg:pl-4 lg:pr-0 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-end gap-4">
                    <Button
                        type="button"
                        label="Back"
                        variant="secondary"
                        rounded="lg"
                        fullWidth
                        onClick={onCancel} // ✅ fixed
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        label={
                            loading
                                ? isEdit
                                    ? "Updating..."
                                    : "Creating..."
                                : isEdit
                                    ? "Update Post"
                                    : "Create Post"
                        }
                        disabled={loading}
                        rounded="lg"
                        fullWidth
                    />

                </FormActions>

            </div>

        </Form>
    )

}
