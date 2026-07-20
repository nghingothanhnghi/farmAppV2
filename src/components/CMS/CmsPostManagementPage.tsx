// src/components/CMS/CmsPostManagementPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePost } from '../../hooks/usePost';
import { useAlert } from '../../contexts/alertContext';
import type { CmsPost } from "../../models/interfaces/Post";
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import PostGrid from './components/PostGrid';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { IconAlertCircle } from '@tabler/icons-react';


const CmsPostManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const {
        posts,
        loading,
        actions
    } = usePost();

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CmsPost | null>(null);
    const [deleteMode, setDeleteMode] = useState(false); // distinguish between remove role & delete user

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


    if (loading) return <LinearProgress
        position='absolute'
        thickness="h-1"
        duration={3000}
    />;

    return (
        <div className="">
            <PageTitle
                title="User Management"
            />
            <PostGrid
                posts={posts}
                loading={loading}
                onEdit={(post) => navigate(`/cms/${post.id}/edit`)}
                onDelete={(post) => {
                    setSelectedPost(post);
                    setDeleteMode(true);
                    setConfirmModalOpen(true);
                }}
                onPublish={(post) => actions.publishPost(post.id)}
                onArchive={(post) => actions.archivePost(post.id)}
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
                        {deleteMode ? (
                            <>
                                Are you sure you want to delete post{' '}
                                <strong>{selectedPost?.title}</strong>?
                            </>
                        ) : (
                            <>
                                Are you sure you want to remove role{' '}
                                <strong>{selectedPost?.title}</strong>?
                            </>
                        )}
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
