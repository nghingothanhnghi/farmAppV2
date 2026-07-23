import apiClient from "../api/client";
import type {
    CmsPost,
    CmsPostCreate,
    CmsPostUpdate,
    PaginatedPosts
} from "../models/interfaces/Post";

export interface PostQuery {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    post_type?: string;
    category_id?: number;
    tag_id?: number;
    author_id?: number;
}

export const postService = {

    async getAll(params?: PostQuery): Promise<PaginatedPosts> {
        const res = await apiClient.get("/cms/posts", {
            params
        });

        return res.data;
    },

    async getById(id: number): Promise<CmsPost> {
        const res = await apiClient.get(`/cms/posts/${id}`);
        return res.data;
    },

    async getBySlug(slug: string) {
        const res = await apiClient.get(`/cms/posts/slug/${slug}`);
        return res.data;
    },

    async create(data: CmsPostCreate) {
        const res = await apiClient.post("/cms/posts", data);
        return res.data;
    },

    async update(id: number, data: CmsPostUpdate) {
        const res = await apiClient.put(`/cms/posts/${id}`, data);
        return res.data;
    },

    async delete(id: number) {
        await apiClient.delete(`/cms/posts/${id}`);
    },

    async publish(id: number) {
        const res = await apiClient.post(`/cms/posts/${id}/publish`);
        return res.data;
    },

    async archive(id: number) {
        const res = await apiClient.post(`/cms/posts/${id}/archive`);
        return res.data;
    },



}