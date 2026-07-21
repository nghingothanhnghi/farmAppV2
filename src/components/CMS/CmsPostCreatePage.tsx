// src/components/CMS/CmsPostCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePostContext } from '../../contexts/postContext';
import { useAlert } from '../../contexts/alertContext';
import type { CmsPostCreate } from "../../models/interfaces/Post";
import PageTitle from '../common/PageTitle';
import PostForm, { type PostFormData } from './components/PostForm';

const DEFAULT_FORM: PostFormData = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    post_type: "post",
    status: "draft",
    is_featured: false,
};

const CmsPostCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const { loading, actions } = usePostContext();
    const [formData, setFormData] = useState<PostFormData>(DEFAULT_FORM);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            setAlert({ type: "error", message: "Title and content are required." });
            return;
        }

        try {
            // category_id/featured_image_id on Create don't allow null — normalize.
            const payload: CmsPostCreate = {
                ...formData,
                title: formData.title,
                content: formData.content,
                post_type: formData.post_type ?? "post",
                category_id: formData.category_id ?? undefined,
                featured_image_id: formData.featured_image_id ?? undefined,
                published_at: formData.published_at ?? undefined,
            };

            const created = await actions.createPost(payload);
            setAlert({ type: "success", message: `"${created.title}" created.` });
            navigate("/dashboard/cms");
        } catch (err: any) {
            setFieldErrors(err.response?.data?.errors ?? {});
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to create post.",
            });
        }
    };

    return (
        <div className="">
            <PageTitle title="Create Post" />
            <PostForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/dashboard/cms")}
                loading={loading}
                isEdit={false}
                fieldErrors={fieldErrors}
            />
        </div>
    );
};

export default CmsPostCreatePage;