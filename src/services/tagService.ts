// src/services/tagService.ts
import apiClient from "../api/client";
import type { CmsTag } from "../models/interfaces/Post";

export const tagService = {
    async getAll(): Promise<CmsTag[]> {
        const res = await apiClient.get("/cms/tags");
        return res.data;
    },

    async create(data: { name: string; slug?: string }): Promise<CmsTag> {
        const res = await apiClient.post("/cms/tags", data);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/cms/tags/${id}`);
    },
};