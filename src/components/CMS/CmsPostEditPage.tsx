// src/components/CMS/CmsPostEditPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IconAlertTriangle } from '@tabler/icons-react';
import { usePostContext } from '../../contexts/postContext';
import { mediaService } from '../../services/mediaService';
import { postService } from '../../services/postService';
import { useAlert } from '../../contexts/alertContext';
import { buildPostUpdate } from "../../utils/postDiff";
import Modal from "../common/Modal";
import Button from "../common/Button";
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import PostForm, { type PostFormData } from './components/PostForm';
import { getImageUrl } from "../../utils/getImageUrl";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/apiError";

const CmsPostEditPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setAlert } = useAlert();
    const { selectedPost, loading, actions } = usePostContext();
    const [formData, setFormData] = useState<Partial<PostFormData>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // `updated_at` of the post as it was when the form was filled: used to detect edits by someone else.
    const loadedUpdatedAt = useRef<string | null>(null);
    const [conflictOpen, setConflictOpen] = useState(false);

    useEffect(() => {
        if (id) {
            actions.fetchPost(Number(id));
        }
    }, [id]);

    useEffect(() => {
        if (selectedPost && selectedPost.id === Number(id)) {
            setFormData({
                title: selectedPost.title,
                slug: selectedPost.slug,
                excerpt: selectedPost.excerpt,
                content: selectedPost.content,
                post_type: selectedPost.post_type,
                status: selectedPost.status,
                category_id: selectedPost.category?.id ?? null,
                featured_image_id: selectedPost.featured_image?.id ?? null,
                tag_ids: selectedPost.tags?.map(t => t.id) ?? [],
                meta_title: selectedPost.meta_title,
                meta_description: selectedPost.meta_description,
                is_featured: selectedPost.is_featured,
                scheduled_at: selectedPost.scheduled_at ?? null,
            });
            loadedUpdatedAt.current = selectedPost.updated_at ?? null;
            setPreviewUrl(selectedPost.featured_image?.url ? getImageUrl(selectedPost.featured_image.url) : null);
        }
    }, [selectedPost, id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        let finalValue: any = value;

        if (type === "checkbox") {
            finalValue = (e.target as HTMLInputElement).checked;
        } else if (name === "category_id") {
            finalValue = value ? Number(value) : null;
        } else if (name === "tag_ids") {
            finalValue = value
                ? value.split(",").map((v) => Number(v.trim())).filter((n) => !isNaN(n))
                : [];
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleContentChange = (html: string) => {
        setFormData(prev => ({ ...prev, content: html }));
    };


    // ✅ NEW
    const handleCategoryChange = (categoryId: number | null) => {
        setFormData(prev => ({ ...prev, category_id: categoryId }));
    };

    // ✅ NEW
    const handleTagsChange = (tagIds: number[]) => {
        setFormData(prev => ({ ...prev, tag_ids: tagIds }));
    };

    const handleImageChange = (file: File | null) => {
        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        setImageFile(file);
                setPreviewUrl(
            file
                ? URL.createObjectURL(file)
                : selectedPost?.featured_image?.url
                    ? getImageUrl(selectedPost.featured_image.url)
                    : null
        );
    };

    /** Uploads a new featured image, sends ONLY the changed fields, and reports the outcome. */
    const save = async () => {
        if (!id || !selectedPost || !formData.title || !formData.content) return;

        setSubmitting(true);
        try {
            let featuredImageId = formData.featured_image_id ?? null;

            // Upload to the media library first, then reference the returned id
            if (imageFile) {
                const media = await mediaService.upload(imageFile, formData.title);
                featuredImageId = media.id;
            }

            const changes = buildPostUpdate(selectedPost, {
                ...formData,
                featured_image_id: featuredImageId,
            });

            if (Object.keys(changes).length === 0) {
                setAlert({ type: "info", message: "No changes to save." });
                navigate("/dashboard/cms");
                return;
            }

            const updated = await actions.updatePost(Number(id), changes);

            if (changes.slug && updated.slug !== changes.slug) {
                setAlert({
                    type: "warning",
                    message: `Post updated, but the slug "${changes.slug}" was taken, so it was saved as "${updated.slug}".`,
                });
            } else {
                setAlert({ type: "success", message: "Post updated successfully." });
            }
            navigate("/dashboard/cms");
        } catch (err: any) {
            setFieldErrors(getApiFieldErrors(err));
            setAlert({
                type: "error",
                message: getApiErrorMessage(err, "Failed to update post."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        // Defensive narrowing: PostForm's Yup schema should already guarantee this.
        if (!formData.title || !formData.content) return;

        // No locking on the API (last write wins), so compare `updated_at` ourselves.
        try {
            const latest = await postService.getById(Number(id));
            if ((latest.updated_at ?? null) !== loadedUpdatedAt.current) {
                setConflictOpen(true);
                return;
            }
        } catch {
            // can't check (network/permissions): let the save itself report any real error
        }

        await save();
    };

    if (!selectedPost || selectedPost.id !== Number(id)) {
        return <LinearProgress position="absolute" thickness="h-1" duration={2000} />;
    }


    return (
        <div className="">
            <PageTitle
                title="Edit Post"
            />
            <PostForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/dashboard/cms")}
                loading={loading || submitting}
                isEdit
                fieldErrors={fieldErrors}
                setFieldErrors={setFieldErrors}
                featuredImageUrl={previewUrl}       // ✅ NEW
                originalSlug={selectedPost.slug}
                onImageChange={handleImageChange}
                onCategoryChange={handleCategoryChange}
                onTagsChange={handleTagsChange}
                onContentChange={handleContentChange}
            />

            <Modal
                showCloseButton={false}
                size="xsmall"
                isOpen={conflictOpen}
                onClose={() => setConflictOpen(false)}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertTriangle size={64} className="text-amber-500 mb-4 mx-auto" />
                        This post was changed by someone else after you opened it.
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Saving now only sends the fields you changed, but it will still overwrite their
                            version of those fields. Cancel and reload to see their changes first.
                        </span>
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label="Save anyway"
                            variant="danger"
                            onClick={async () => {
                                setConflictOpen(false);
                                await save();
                            }}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onClick={() => setConflictOpen(false)}
                            className="min-w-[150px]"
                            rounded="lg"
                        />
                    </div>
                }
            />
        </div>
    );
};

export default CmsPostEditPage;
