// src/services/categoryService.ts
import apiClient from "../api/client";
import type { CmsCategory } from "../models/interfaces/Post";

export const categoryService = {
    async getAll(parentId?: number): Promise<CmsCategory[]> {
        const res = await apiClient.get("/cms/categories", {
            params: parentId !== undefined ? { parent_id: parentId } : {},
        });
        return res.data;
    },

    async getById(id: number): Promise<CmsCategory> {
        const res = await apiClient.get(`/cms/categories/${id}`);
        return res.data;
    },

    async create(data: { name: string; slug?: string; parent_id?: number | null }): Promise<CmsCategory> {
        const res = await apiClient.post("/cms/categories", data);
        return res.data;
    },

    async update(id: number, data: { name?: string; slug?: string; parent_id?: number | null }): Promise<CmsCategory> {
        const res = await apiClient.put(`/cms/categories/${id}`, data);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/cms/categories/${id}`);
    },
};