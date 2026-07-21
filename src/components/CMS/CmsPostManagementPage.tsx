// src/components/CMS/CmsPostManagementPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePostContext } from '../../contexts/postContext';
import { useAlert } from '../../contexts/alertContext';
import type { CmsPost } from "../../models/interfaces/Post";
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import PostGrid from './components/PostGrid';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';


const CmsPostManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const {
        posts,
        loading,
        actions
    } = usePostContext();

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CmsPost | null>(null);

    const handleConfirmDelete = async () => {
        if (!selectedPost) return;

        try {
            await actions.deletePost(selectedPost.id);

            setAlert({
                type: "success",
                message: `Post "${selectedPost.title}" deleted successfully.`,
            });

            setConfirmModalOpen(false);
            setSelectedPost(null);

        } catch (err: any) {
            setAlert({
                type: "error",
                message:
                    err.response?.data?.detail ??
                    "Failed to delete post.",
            });
        }
    };


    const handlePublish = async (post: CmsPost) => {
        try {
            await actions.publishPost(post.id);
            setAlert({ type: "success", message: `"${post.title}" published.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to publish post.",
            });
        }
    };

    const handleArchive = async (post: CmsPost) => {
        try {
            await actions.archivePost(post.id);
            setAlert({ type: "success", message: `"${post.title}" archived.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.response?.data?.detail ?? "Failed to archive post.",
            });
        }
    };

    if (loading) return <LinearProgress
        position='absolute'
        thickness="h-1"
        duration={3000}
    />;

    return (
        <div className="">
            <PageTitle
                title="Post Management"
                actions={
                    <Button
                        type="button"
                        label="New Post"
                        onClick={() => navigate('/dashboard/cms/new')}
                        variant="secondary"
                        icon={<IconPlus size={16} className="text-gray-500" />}
                        iconPosition='left'
                        rounded='lg'
                    />
                }
            />
            <PostGrid
                posts={posts}
                loading={loading}
                onEdit={(post) => navigate(`/dashboard/cms/${post.id}/edit`)}
                onDelete={(post) => {
                    setSelectedPost(post);
                    setConfirmModalOpen(true);
                }}
                onPublish={handlePublish}
                onArchive={handleArchive}
            />
            <Modal
                showCloseButton={false}
                size='xsmall'
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedPost(null);
                }}
                content={
                    <div className="text-sm px-10 pt-6 pb-10 text-center">
                        <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                        Are you sure you want to delete post{' '}
                        <strong>{selectedPost?.title}</strong>?
                    </div>
                }
                actions={
                    <div className="flex gap-4">
                        <Button
                            label='Yes, Delete'
                            variant="danger"
                            onClick={handleConfirmDelete}
                            className='min-w-[150px]'
                            rounded='lg'
                        />
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onClick={() => setConfirmModalOpen(false)}
                            className='min-w-[150px]'
                            rounded='lg'
                        />
                    </div>
                }
            />
        </div>
    );
};

export default CmsPostManagementPage;
