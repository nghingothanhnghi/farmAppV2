// src/hooks/usePostFilters.ts
// Post list filters, sort and page, kept in the URL (?q=&status=&page=…) so they survive
// "edit post → back", reloads, and can be shared. Defaults are omitted from the URL.
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { PostQuery, PostSortKey } from "../services/postService";
import type { PostStatus, PostType } from "../models/interfaces/Post";

export interface PostFilters {
    search: string;
    status: PostStatus | "";
    post_type: PostType | "";
    category_id: number | null;
    /** only meaningful with a category: also match posts in its child categories */
    include_descendants: boolean;
    tag_id: number | null;
    is_featured: boolean | null;
    sort: PostSortKey;
    order: "asc" | "desc";
    page: number;
}

export const DEFAULT_SORT: PostSortKey = "created_at";
export const DEFAULT_ORDER = "desc";

const STATUSES: PostStatus[] = ["draft", "published", "scheduled", "archived"];
const TYPES: PostType[] = ["post", "page"];
const SORTS: PostSortKey[] = ["created_at", "published_at", "title", "view_count"];

const positiveInt = (v: string | null): number | null => {
    const n = Number(v);
    return v !== null && Number.isInteger(n) && n > 0 ? n : null;
};

const parse = (p: URLSearchParams): PostFilters => {
    const status = p.get("status") as PostStatus | null;
    const type = p.get("type") as PostType | null;
    const sort = p.get("sort") as PostSortKey | null;
    const featured = p.get("featured");
    return {
        search: p.get("q") ?? "",
        status: status && STATUSES.includes(status) ? status : "",
        post_type: type && TYPES.includes(type) ? type : "",
        category_id: positiveInt(p.get("category")),
        include_descendants: p.get("sub") === "1" && positiveInt(p.get("category")) !== null,
        tag_id: positiveInt(p.get("tag")),
        is_featured: featured === "true" ? true : featured === "false" ? false : null,
        sort: sort && SORTS.includes(sort) ? sort : DEFAULT_SORT,
        order: p.get("order") === "asc" ? "asc" : DEFAULT_ORDER,
        page: positiveInt(p.get("page")) ?? 1,
    };
};

const serialize = (f: PostFilters): URLSearchParams => {
    const p = new URLSearchParams();
    if (f.search.trim()) p.set("q", f.search.trim());
    if (f.status) p.set("status", f.status);
    if (f.post_type) p.set("type", f.post_type);
    if (f.category_id) p.set("category", String(f.category_id));
    if (f.category_id && f.include_descendants) p.set("sub", "1");
    if (f.tag_id) p.set("tag", String(f.tag_id));
    if (f.is_featured !== null) p.set("featured", String(f.is_featured));
    if (f.sort !== DEFAULT_SORT) p.set("sort", f.sort);
    if (f.order !== DEFAULT_ORDER) p.set("order", f.order);
    if (f.page > 1) p.set("page", String(f.page));
    return p;
};

/** Filters → GET /cms/posts query. Empty filters are left out entirely. */
export const toPostQuery = (f: PostFilters, pageSize: number): PostQuery => ({
    page: f.page,
    page_size: pageSize,
    search: f.search.trim() || undefined,
    status: f.status || undefined,
    post_type: f.post_type || undefined,
    category_id: f.category_id ?? undefined,
    include_descendants: f.category_id && f.include_descendants ? true : undefined,
    tag_id: f.tag_id ?? undefined,
    is_featured: f.is_featured ?? undefined,
    sort: f.sort,
    order: f.order,
});

export const usePostFilters = () => {
    const [params, setParams] = useSearchParams();
    const filters = useMemo(() => parse(params), [params]);

    /** Changing any filter or sort goes back to page 1; pass `page` to change just the page. */
    const update = useCallback(
        (patch: Partial<PostFilters>) => {
            const next = { ...parse(params), ...patch };
            // clearing the category also clears its "include subcategories" modifier
            if (!next.category_id) next.include_descendants = false;
            if (!("page" in patch)) next.page = 1;
            setParams(serialize(next), { replace: true });
        },
        [params, setParams]
    );

    const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

    // "filtered" = anything beyond sort/page
    const activeCount = [
        filters.search.trim(),
        filters.status,
        filters.post_type,
        filters.category_id,
        filters.tag_id,
        filters.is_featured !== null,
    ].filter(Boolean).length;

    return { filters, update, reset, activeCount };
};
