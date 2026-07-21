// src/components/CMS/CmsPostEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePost } from '../../hooks/usePost';
import { useAlert } from '../../contexts/alertContext';
import type { CmsPostUpdate } from "../../models/interfaces/Post";
import PageTitle from '../common/PageTitle';
import PostForm from './components/PostForm';

const CmsPostEditPage: React.FC = () => {
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const { selectedPost, loading, actions } = usePost();
    const [formData, setFormData] = useState<Partial<CmsPostUpdate>>({});
    const [fieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (selectedPost) {
            setFormData(selectedPost);
        }
    }, [selectedPost]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPost) return;


        try {
            await actions.updatePost(
                selectedPost.id,
                formData as CmsPostUpdate
            );

            navigate("/cms/posts");
        } catch (err: any) {
            setAlert({
                type: "error",
                message:
                    err.response?.data?.detail ??
                    "Failed to update post.",
            });
        }
    };


    return (
        <div className="">
            <PageTitle
                title="User Management"
            />
            <PostForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                loading={loading}
                isEdit
                fieldErrors={fieldErrors}
            />
        </div>
    );
};

export default CmsPostEditPage;
