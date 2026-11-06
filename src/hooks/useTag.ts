// src/hooks/useTag.ts
import { useState, useCallback, useEffect } from "react";
import { tagService, type TagDeleteOptions } from "../services/tagService";
import type { CmsTag } from "../models/interfaces/Post";
import { getApiErrorMessage } from "../utils/apiError";

export interface TagInput {
    name: string;
    slug?: string;
}

export const useTag = () => {
    const [tags, setTags] = useState<CmsTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTags = useCallback(async () => {
        setLoading(true);
        try {
            const data = await tagService.getAll();
            setTags(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setTags([]);
            setError(getApiErrorMessage(err, "Failed loading tags"));
        } finally {
            setLoading(false);
        }
    }, []);

    const createTag = useCallback(async (data: TagInput) => {
        const created = await tagService.create(data);
        setTags(prev => [...prev, created]);
        return created;
    }, []);

    const deleteTag = useCallback(async (id: number, options?: TagDeleteOptions) => {
        const result = await tagService.delete(id, options);
        setTags(prev => prev.filter(t => t.id !== id));
        return result;
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return {
        tags,
        loading,
        error,
        actions: {
            fetchTags,
            createTag,
            deleteTag,
        },
    };
};