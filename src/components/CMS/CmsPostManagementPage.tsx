// src/components/CMS/CmsPostManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { usePostContext } from '../../contexts/postContext';
import { useAlert } from '../../contexts/alertContext';
import type { CmsPost } from "../../models/interfaces/Post";
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import PostGrid from './components/PostGrid';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ScheduleModal from './components/ScheduleModal';
import { IconAlertCircle, IconCirclePlus } from '@tabler/icons-react';
import { getApiErrorMessage } from "../../utils/apiError";
import { useCmsPermissions } from "../../hooks/useCmsPermissions";

const PAGE_SIZE = 20; // matches the backend default; max is 100

const CmsPostManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const { posts, loading, pagination, actions } = usePostContext();
    const { canManagePost } = useCmsPermissions();
    const [page, setPage] = useState(1);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CmsPost | null>(null);

    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [schedulingPost, setSchedulingPost] = useState<CmsPost | null>(null);

    useEffect(() => {
        actions.fetchPosts({ page, page_size: PAGE_SIZE });
    }, [page]);

    const canManage = useCallback((post: CmsPost) => canManagePost(post), [canManagePost]);

    const handleConfirmDelete = async () => {
        if (!selectedPost) return;

        try {
            const wasLastOnPage = posts.length === 1;
            await actions.deletePost(selectedPost.id);
            // keep the page full and the total accurate
            if (wasLastOnPage && page > 1) setPage(page - 1);
            else actions.fetchPosts({ page, page_size: PAGE_SIZE });

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
                    getApiErrorMessage(err, "Failed to delete post."),
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
                message: getApiErrorMessage(err, "Failed to publish post."),
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
                message: getApiErrorMessage(err, "Failed to archive post."),
            });
        }
    };

    const handleScheduleSubmit = async (isoDate: string) => {
        if (!schedulingPost) return;
        try {
            await actions.schedulePost(schedulingPost.id, isoDate);
            setAlert({ type: "success", message: `"${schedulingPost.title}" scheduled.` });
        } catch (err: any) {
            setAlert({
                type: "error",
                message: getApiErrorMessage(err, "Failed to schedule post."),
            });
            throw err;
        }
    };

    if (loading && posts.length === 0) return <LinearProgress
        position='absolute'
        thickness="h-1"
        duration={3000}
    />;

    return (
        <div className="flex flex-col h-full min-h-0">
            <PageTitle
                title={t('post.page_header.title')}
                subtitle={t('post.page_header.description')}
                actions={
                    <Button
                        type="button"
                        label={t('btn.new_post')}

                        onClick={() => navigate('/dashboard/cms/new')}
                        variant="secondary"
                        icon={<IconCirclePlus size={16} className="text-gray-500" />}
                        iconPosition='left'
                        rounded='lg'
                    />
                }
            />
            <div style={{ flex: '1 1 auto', minHeight: 0 }}>
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
                    onSchedule={(post) => { setSchedulingPost(post); setScheduleModalOpen(true); }}
                    canManage={canManage}
                />
            </div>

            {pagination.total > 0 && (
                <div className="flex items-center justify-between gap-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <span>
                        Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} posts
                    </span>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            label="Previous"
                            variant="secondary"
                            size="sm"
                            rounded="lg"
                            disabled={loading || page <= 1}
                            onClick={() => setPage(page - 1)}
                        />
                        <Button
                            type="button"
                            label="Next"
                            variant="secondary"
                            size="sm"
                            rounded="lg"
                            disabled={loading || page >= pagination.pages}
                            onClick={() => setPage(page + 1)}
                        />
                    </div>
                </div>
            )}


            <ScheduleModal
                isOpen={scheduleModalOpen}
                onClose={() => { setScheduleModalOpen(false); setSchedulingPost(null); }}
                post={schedulingPost}
                onSubmit={handleScheduleSubmit}
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
