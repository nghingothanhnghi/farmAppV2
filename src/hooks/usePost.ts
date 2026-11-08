// src/hooks/usePost.ts

import { useState, useCallback, useEffect, useRef } from "react";
import { postService } from "../services/postService";

import type {
    CmsPost,
    CmsPostListItem,
    CmsPostCreate,
    CmsPostUpdate,
    PostStatus,
} from "../models/interfaces/Post";

import type { PostQuery } from "../services/postService";
import { getApiErrorMessage } from "../utils/apiError";

const normalizePostPayload = <
    T extends {
        status?: PostStatus;
        scheduled_at?: string | null;
    }
>(data: T, partial = false): T | Omit<T, "scheduled_at"> => {

    // Only scheduled posts need scheduled_at.
    // In a partial update `status` may be absent (e.g. only the time of an already-scheduled post
    // changed): then scheduled_at must be kept. When leaving "scheduled" the server clears it.
    const keep = partial && data.status === undefined
        ? data.scheduled_at !== undefined
        : data.status === "scheduled" && !!data.scheduled_at;

    if (!keep) {
        const { scheduled_at, ...rest } = data;
        return rest;
    }

    return data;
};

export const usePost = () => {

    const [posts, setPosts] = useState<CmsPostListItem[]>([]);
    const [selectedPost, setSelectedPost] = useState<CmsPost | null>(null);

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        page_size: 20,
        pages: 1
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Only the most recent fetch may apply its result: typing in the search box (or the provider's
    // initial unfiltered fetch) must never overwrite newer, filtered results.
    const latestFetch = useRef(0);

    const fetchPosts = useCallback(async (query?: PostQuery) => {

        const requestId = ++latestFetch.current;
        setLoading(true);

        try {

            const data = await postService.getAll(query);
            if (requestId !== latestFetch.current) return;

            // ✅ read `results`, guard against unexpected shape
            const results = Array.isArray(data?.results) ? data.results : [];

            setPosts(results);

            setPagination({
                total: data?.total ?? results.length,
                page: data?.page ?? 1,
                page_size: data?.page_size ?? results.length,
                pages: data?.pages ?? Math.ceil((data?.total ?? results.length) / (data?.page_size || 20)),
            });

            setError(null);

        } catch (err: any) {
            if (requestId !== latestFetch.current) return;
            setPosts([]); // ✅ don't leave posts undefined on error either
            setError(getApiErrorMessage(err, "Failed loading posts"));

        } finally {

            if (requestId === latestFetch.current) setLoading(false);

        }

    }, []);

    const fetchPost = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const post = await postService.getById(id);
            setSelectedPost(post);
            setError(null);
        } catch (err: any) {
            setSelectedPost(null);
            setError(getApiErrorMessage(err, "Failed loading post"));
        } finally {
            setLoading(false);
        }
    }, []);

    const createPost = useCallback(async (data: CmsPostCreate) => {
        const payload = normalizePostPayload(data);

        const created = await postService.create(payload);

        setPosts(prev => [created, ...prev]);

        return created;

    }, []);

    const updatePost = useCallback(async (id: number, data: CmsPostUpdate) => {
        const payload = normalizePostPayload(data, true);
        const updated = await postService.update(id, payload);
        setPosts(prev => prev.map(p => p.id === id ? updated : p));
        setSelectedPost(prev => (prev?.id === id ? updated : prev));
        return updated;
    }, []); // ✅ no dependency needed now


    const deletePost = useCallback(async (id: number, options?: { force?: boolean }) => {
        const result = await postService.delete(id, options);
        setPosts(prev => prev.filter(x => x.id !== id));
        setSelectedPost(prev => (prev?.id === id ? null : prev));
        return result;
    }, []);

    const publishPost = useCallback(async (id: number) => {

        const updated = await postService.publish(id);

        setPosts(prev =>
            prev.map(p => p.id === id ? updated : p)
        );

        return updated;

    }, []);

    const archivePost = useCallback(async (id: number) => {

        const updated = await postService.archive(id);

        setPosts(prev =>
            prev.map(p => p.id === id ? updated : p)
        );

        return updated;

    }, []);

    const schedulePost = useCallback(async (id: number, scheduledAt: string) => {
        const updated = await postService.schedule(id, scheduledAt);
        setPosts(prev => prev.map(p => p.id === id ? updated : p));
        setSelectedPost(prev => (prev?.id === id ? updated : prev));
        return updated;
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return {

        posts,
        selectedPost,
        pagination,
        loading,
        error,

        actions: {
            fetchPosts,
            fetchPost,
            createPost,
            updatePost,
            deletePost,
            publishPost,
            archivePost,
            schedulePost,
        }

    };

};