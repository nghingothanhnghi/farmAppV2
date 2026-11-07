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

    /** PATCH takes a form-encoded body (not JSON, not multipart): see FRONTEND_GUIDE §7. */
    async update(id: number, altText?: string): Promise<CmsMedia> {
        const body = new URLSearchParams();
        if (altText !== undefined) body.set("alt_text", altText);

        // Must be explicit: apiClient defaults to application/json and axios won't override a default.
        const res = await apiClient.patch(`/cms/media/${id}`, body, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/cms/media/${id}`);
    },
};