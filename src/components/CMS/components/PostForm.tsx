// src/components/CMS/components/PostForm.tsx
import { useMemo } from 'react';
import type { CmsPostCreate, CmsPostUpdate, PostType, PostStatus } from "../../../models/interfaces/Post";
import Form, { FormGroup, FormLabel, FormInput, FormActions, FormCheckbox, FormSelect } from '../../../components/common/Form';
import Button from '../../common/Button';

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

}

export default function PostForm({
    formData,
    onChange,
    onSubmit,
    onCancel,
    loading,
    isEdit,
    fieldErrors,
}: Props) {

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

                    {/* Category / Tags */}
                    <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormLabel htmlFor="category_id">Category ID</FormLabel>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Numeric ID of the category (leave blank for none).
                            </p>
                        </div>
                        <FormInput
                            id="category_id"
                            name="category_id"
                            type="number"
                            value={formData.category_id ?? ""}
                            onChange={onChange}
                        />
                    </FormGroup>

                    <FormGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormLabel htmlFor="tag_ids">Tag IDs</FormLabel>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Comma-separated numeric tag IDs, e.g. "1, 2, 5".
                            </p>
                        </div>
                        <FormInput
                            id="tag_ids"
                            name="tag_ids"
                            type="text"
                            value={(formData.tag_ids ?? []).join(", ")}
                            onChange={onChange}
                        />
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
