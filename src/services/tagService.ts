// src/services/tagService.ts
import apiClient from "../api/client";
import type { CmsTag, CmsTagDeleteResult, CmsTagUpdate } from "../models/interfaces/Post";

export interface TagDeleteOptions {
    /** Detach the tag from every post, then delete it. */
    force?: boolean;
    /** Move this tag's posts to another tag, then delete it. */
    merge_into?: number;
}

export const tagService = {
    async getAll(): Promise<CmsTag[]> {
        const res = await apiClient.get("/cms/tags");
        return res.data;
    },

    async create(data: { name: string; slug?: string }): Promise<CmsTag> {
        const res = await apiClient.post("/cms/tags", data);
        return res.data;
    },

    /** Partial update (editor). 409 on duplicate name/slug. */
    async update(id: number, data: CmsTagUpdate): Promise<CmsTag> {
        const res = await apiClient.put(`/cms/tags/${id}`, data);
        return res.data;
    },

    /** 409 when the tag is in use and neither `force` nor `merge_into` is given. */
    async delete(id: number, options?: TagDeleteOptions): Promise<CmsTagDeleteResult> {
        const res = await apiClient.delete(`/cms/tags/${id}`, { params: options });
        return res.data;
    },
};