// src/hooks/useCategory.ts
import { useState, useCallback, useEffect } from "react";
import { categoryService } from "../services/categoryService";
import type { CmsCategory } from "../models/interfaces/Post";

export interface CategoryInput {
    name: string;
    slug?: string;
    parent_id?: number | null;
}

export const useCategory = () => {
    const [categories, setCategories] = useState<CmsCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async (parentId?: number) => {
        setLoading(true);
        try {
            const data = await categoryService.getAll(parentId);
            setCategories(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setCategories([]);
            setError(err.response?.data?.detail ?? "Failed loading categories");
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (data: CategoryInput) => {
        const created = await categoryService.create(data);
        setCategories(prev => [...prev, created]);
        return created;
    }, []);

    const updateCategory = useCallback(async (id: number, data: Partial<CategoryInput>) => {
        const updated = await categoryService.update(id, data);
        setCategories(prev => prev.map(c => c.id === id ? updated : c));
        return updated;
    }, []);

    const deleteCategory = useCallback(async (id: number) => {
        await categoryService.delete(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        error,
        actions: {
            fetchCategories,
            createCategory,
            updateCategory,
            deleteCategory,
        },
    };
};