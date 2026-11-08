// src/components/CMS/CmsPostManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { usePostContext } from '../../contexts/postContext';
import { useAlert } from '../../contexts/alertContext';
import type { CmsPostListItem } from "../../models/interfaces/Post";
import PageTitle from '../common/PageTitle';
import LinearProgress from '../common/LinearProgress';
import PostGrid from './components/PostGrid';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import PostFilterBar from './components/PostFilterBar';
import { usePostFilters, toPostQuery } from '../../hooks/usePostFilters';
import { categoryService } from '../../services/categoryService';
import { tagService } from '../../services/tagService';
import type { CmsCategory, CmsTag } from '../../models/interfaces/Post';
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
    const { canManagePost, isEditor } = useCmsPermissions();
    const { filters, update, reset, activeCount } = usePostFilters();
    const page = filters.page;
    const [categories, setCategories] = useState<CmsCategory[]>([]);
    const [tags, setTags] = useState<CmsTag[]>([]);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CmsPostListItem | null>(null);
    // Set when the server answers 409 (a menu item links to the post) so the dialog can offer "force".
    const [inUseMessage, setInUseMessage] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const closeDeleteModal = () => {
        setConfirmModalOpen(false);
        setSelectedPost(null);
        setInUseMessage(null);
    };

    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [schedulingPost, setSchedulingPost] = useState<CmsPostListItem | null>(null);

    // Filter dropdown options (non-fatal if they fail: the list still works)
    useEffect(() => {
        categoryService.getAll().then(setCategories).catch(() => setCategories([]));
        tagService.getAll().then(setTags).catch(() => setTags([]));
    }, []);

    const query = toPostQuery(filters, PAGE_SIZE);
    const queryKey = JSON.stringify(query);

    useEffect(() => {
        actions.fetchPosts(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey]);

    const canManage = useCallback((post: CmsPostListItem) => canManagePost(post), [canManagePost]);

    const handleConfirmDelete = async (force = false) => {
        if (!selectedPost) return;
        setDeleting(true);

        try {
            const wasLastOnPage = posts.length === 1;
            const result = await actions.deletePost(selectedPost.id, force ? { force: true } : undefined);
            // keep the page full and the total accurate
            if (wasLastOnPage && page > 1) update({ page: page - 1 });
            else actions.fetchPosts(query);

            const removed = result.menu_items_removed;
            setAlert({
                type: "success",
                message: removed > 0
                    ? `Post "${selectedPost.title}" deleted and removed from ${removed} menu item${removed > 1 ? 's' : ''}.`
                    : `Post "${selectedPost.title}" deleted successfully.`,
            });
            closeDeleteModal();

        } catch (err: any) {
            if (err?.response?.status === 409 && !force) {
                // A menu item links to this post: keep the dialog open and explain.
                setInUseMessage(getApiErrorMessage(err, "This post is linked from a menu."));
            } else {
                setAlert({
                    type: "error",
                    message: getApiErrorMessage(err, "Failed to delete post."),
                });
                closeDeleteModal();
            }
        } finally {
            setDeleting(false);
        }
    };


    const handlePublish = async (post: CmsPostListItem) => {
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

    const handleArchive = async (post: CmsPostListItem) => {
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
            {loading && <LinearProgress position='absolute' thickness="h-1" duration={3000} />}
            <PostFilterBar
                filters={filters}
                onChange={update}
                onReset={reset}
                activeCount={activeCount}
                categories={categories}
                tags={tags}
                isEditor={isEditor}
            />
            <div style={{ flex: '1 1 auto', minHeight: 0 }}>
                {!loading && posts.length === 0 ? (
                    <div className="flex flex-col items-center">
                        <EmptyState
                            message={activeCount > 0 ? 'No posts match your filters.' : 'No posts yet.'}
                        />
                        {activeCount > 0 && (
                            <Button label="Clear filters" variant="secondary" rounded="lg" onClick={reset} />
                        )}
                    </div>
                ) : (
                <PostGrid
                    posts={posts}
                    loading={loading && posts.length === 0}
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
                )}
                {pagination.total > 0 && (
                    <Pagination
                        page={page}
                        total={pagination.total}
                        pageSize={PAGE_SIZE}
                        loading={loading}
                        onPageChange={(p) => update({ page: p })}
                    />
                )}
            </div>
            <ScheduleModal
                isOpen={scheduleModalOpen}
                onClose={() => { setScheduleModalOpen(false); setSchedulingPost(null); }}
                post={schedulingPost}
                onSubmit={handleScheduleSubmit}
            />

            <Modal
                showCloseButton={false}
                size={inUseMessage ? 'small' : 'xsmall'}
                isOpen={confirmModalOpen}
                onClose={closeDeleteModal}
                content={
                    inUseMessage ? (
                        <div className="text-sm px-10 pt-6 pb-8 space-y-3 text-center">
                            <IconAlertCircle size={64} className="text-amber-500 mb-2 mx-auto" />
                            <p>
                                <strong>{selectedPost?.title}</strong> is linked from a menu.
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{inUseMessage}</p>
                            <p className="text-xs">
                                {isEditor
                                    ? 'You can delete the post and remove those menu items, or remove the menu link first.'
                                    : 'Ask an editor to remove the menu link first, or to delete the post.'}
                            </p>
                        </div>
                    ) : (
                        <div className="text-sm px-10 pt-6 pb-10 text-center">
                            <IconAlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
                            Are you sure you want to delete post{' '}
                            <strong>{selectedPost?.title}</strong>?
                        </div>
                    )
                }
                actions={
                    <div className="flex flex-wrap justify-center gap-3">
                        {inUseMessage ? (
                            isEditor && (
                                <Button
                                    label={deleting ? 'Working...' : 'Delete post & remove menu items'}
                                    variant="danger"
                                    onClick={() => handleConfirmDelete(true)}
                                    rounded='lg'
                                    disabled={deleting}
                                />
                            )
                        ) : (
                            <Button
                                label={deleting ? 'Deleting...' : 'Yes, Delete'}
                                variant="danger"
                                onClick={() => handleConfirmDelete()}
                                className='min-w-[150px]'
                                rounded='lg'
                                disabled={deleting}
                            />
                        )}
                        <Button
                            label="Cancel"
                            variant="secondary"
                            onClick={closeDeleteModal}
                            className={inUseMessage ? undefined : 'min-w-[150px]'}
                            rounded='lg'
                            disabled={deleting}
                        />
                    </div>
                }
            />
        </div>
    );
};

export default CmsPostManagementPage;
