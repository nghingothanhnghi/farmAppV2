// src/hooks/usePost.ts

import { useState, useCallback, useEffect } from "react";
import { postService } from "../services/postService";

import type {
    CmsPost,
    CmsPostCreate,
    CmsPostUpdate
} from "../models/interfaces/Post";

import type { PostQuery } from "../services/postService";

export const usePost = () => {

    const [posts, setPosts] = useState<CmsPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<CmsPost | null>(null);

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        page_size: 20,
        pages: 1
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (query?: PostQuery) => {

        setLoading(true);

        try {

            const data = await postService.getAll(query);

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
            setPosts([]); // ✅ don't leave posts undefined on error either
            setError(err.response?.data?.detail ?? "Failed loading posts");

        } finally {

            setLoading(false);

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
            setError(err.response?.data?.detail ?? "Failed loading post");
        } finally {
            setLoading(false);
        }
    }, []);

    const createPost = useCallback(async (data: CmsPostCreate) => {

        const created = await postService.create(data);

        setPosts(prev => [created, ...prev]);

        return created;

    }, []);

    const updatePost = useCallback(async (id: number, data: CmsPostUpdate) => {
        const updated = await postService.update(id, data);
        setPosts(prev => prev.map(p => p.id === id ? updated : p));
        setSelectedPost(prev => (prev?.id === id ? updated : prev));
        return updated;
    }, []); // ✅ no dependency needed now


    const deletePost = useCallback(async (id: number) => {
        await postService.delete(id);
        setPosts(prev => prev.filter(x => x.id !== id));
        setSelectedPost(prev => (prev?.id === id ? null : prev));
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
        }

    };

};