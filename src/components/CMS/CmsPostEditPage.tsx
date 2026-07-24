// src/components/CMS/CmsPostEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { usePostContext } from '../../contexts/postContext';
import { mediaService } from '../../services/mediaService';
import { useAlert } from '../../contexts/alertContext';
import type { CmsPostUpdate } from "../../models/interfaces/Post";
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import PostForm, { type PostFormData } from './components/PostForm';

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
                published_at: selectedPost.published_at ?? null,
            });
            setPreviewUrl(selectedPost.featured_image?.url ?? null);
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
            finalValue = value ? Number(value) : undefined;
        } else if (name === "tag_ids") {
            finalValue = value
                ? value.split(",").map((v) => Number(v.trim())).filter((n) => !isNaN(n))
                : [];
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
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
        setPreviewUrl(file ? URL.createObjectURL(file) : (selectedPost?.featured_image?.url ?? null));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSubmitting(true);

        try {
            let featuredImageId = formData.featured_image_id ?? undefined;

            // ✅ Upload to media library first, get back the media id
            if (imageFile) {
                const media = await mediaService.upload(imageFile, formData.title);
                featuredImageId = media.id;
            }

            await actions.updatePost(Number(id), {
                ...formData,
                featured_image_id: featuredImageId,
                tag_ids: formData.tag_ids ?? [],
            } as CmsPostUpdate);

            setAlert({ type: "success", message: "Post updated successfully." });
            navigate("/dashboard/cms");
        } catch (err: any) {
            setFieldErrors(err.response?.data?.errors ?? {});
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to update post.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!selectedPost || selectedPost.id !== Number(id)) {
        return <LinearProgress position="absolute" thickness="h-1" duration={2000} />;
    }


    return (
        <div className="">
            <PageTitle
                title="User Management"
            />
            <PostForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/dashboard/cms")}
                loading={loading || submitting}
                isEdit
                fieldErrors={fieldErrors}
                featuredImageUrl={previewUrl}       // ✅ NEW
                onImageChange={handleImageChange}
                onCategoryChange={handleCategoryChange}
                onTagsChange={handleTagsChange}
            />
        </div>
    );
};

export default CmsPostEditPage;
