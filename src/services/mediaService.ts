// src/services/mediaService.ts
import apiClient from "../api/client";
import type { CmsMedia } from "../models/interfaces/Post";

export interface MediaQuery {
    skip?: number;
    limit?: number;
}

export const mediaService = {
    async upload(file: File, altText?: string): Promise<CmsMedia> {
        const formData = new FormData();
        formData.append("file", file);
        if (altText) formData.append("alt_text", altText);

        const res = await apiClient.post("/cms/media/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    async getAll(params?: MediaQuery): Promise<CmsMedia[]> {
        const res = await apiClient.get("/cms/media", { params });
        return res.data;
    },

    async getById(id: number): Promise<CmsMedia> {
        const res = await apiClient.get(`/cms/media/${id}`);
        return res.data;
    },

    async update(id: number, altText?: string): Promise<CmsMedia> {
        const formData = new FormData();
        if (altText !== undefined) formData.append("alt_text", altText);

        const res = await apiClient.patch(`/cms/media/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/cms/media/${id}`);
    },
};