import apiClient from "../api/client";
import type {
    CmsPost,
    CmsPostDeleteResult,
    CmsPostCreate,
    CmsPostUpdate,
    PaginatedPosts,
    PostStatus,
    PostType
} from "../models/interfaces/Post";

export type PostSortKey = "created_at" | "published_at" | "title" | "view_count";

export interface PostQuery {
    page?: number;
    /** default 20, max 100 */
    page_size?: number;
    /** title + excerpt only (case-insensitive) */
    search?: string;
    /** Non-editors may only request "published" (anything else is 403). */
    status?: PostStatus;
    post_type?: PostType;
    /** exact category unless `include_descendants` is set */
    category_id?: number;
    /** with `category_id`: also match posts in all child categories (recursive) */
    include_descendants?: boolean;
    tag_id?: number;
    author_id?: number;
    is_featured?: boolean;
    /** default "created_at"; use "published_at" for public feeds */
    sort?: PostSortKey;
    /** default "desc" */
    order?: "asc" | "desc";
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

    /** `trackView` increments view_count server-side; pass false for SSR/prefetch/previews. */
    async getBySlug(slug: string, trackView = true): Promise<CmsPost> {
        const res = await apiClient.get(`/cms/posts/slug/${encodeURIComponent(slug)}`, {
            params: { track_view: trackView },
        });
        return res.data;
    },

    async create(data: CmsPostCreate): Promise<CmsPost> {
        const res = await apiClient.post("/cms/posts", data);
        return res.data;
    },

    async update(id: number, data: CmsPostUpdate): Promise<CmsPost> {
        const res = await apiClient.put(`/cms/posts/${id}`, data);
        return res.data;
    },

    /**
     * 409 while a menu item links to the post. `force: true` (editors only) deletes the post and
     * removes those menu items; the result says how many.
     */
    async delete(id: number, options?: { force?: boolean }): Promise<CmsPostDeleteResult> {
        const res = await apiClient.delete(`/cms/posts/${id}`, { params: options?.force ? { force: true } : undefined });
        // older backends answered {detail} only
        return { detail: res.data?.detail ?? "", menu_items_removed: res.data?.menu_items_removed ?? 0 };
    },

    async publish(id: number): Promise<CmsPost> {
        const res = await apiClient.post(`/cms/posts/${id}/publish`);
        return res.data;
    },

    async archive(id: number): Promise<CmsPost> {
        const res = await apiClient.post(`/cms/posts/${id}/archive`);
        return res.data;
    },

    async schedule(id: number, scheduledAt: string): Promise<CmsPost> {
        const res = await apiClient.post(`/cms/posts/${id}/schedule`, {
            scheduled_at: scheduledAt,
        });
        return res.data;
    },


}