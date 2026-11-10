// Public, read-only CMS client. Never sends an auth token: anonymous callers only ever
// receive published content from the backend.
import type { components } from '../../../src/api/schema';

export type Post = components['schemas']['PostOut'];
export type PostListItem = components['schemas']['PostListItem'];
export type PaginatedPosts = components['schemas']['PaginatedPosts'];
export type Category = components['schemas']['CategoryOut'];
export type Tag = components['schemas']['TagOut'];
export type Menu = components['schemas']['MenuOut'];
export type MenuItem = components['schemas']['MenuItemOut'];
export type Media = components['schemas']['MediaOut'];

export const API_URL = (import.meta.env.PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
export const SITE_NAME = import.meta.env.PUBLIC_SITE_NAME || 'Kuchi Farm';
export const MENU_HEADER = import.meta.env.PUBLIC_MENU_HEADER || 'header';
export const MENU_FOOTER = import.meta.env.PUBLIC_MENU_FOOTER || 'footer';

/** Resolves to null on 404 (page should 404); throws on anything else. */
async function get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T | null> {
  const url = new URL(API_URL + path);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  // 403 is treated like 404: unpublished content must look like it does not exist.
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`API ${res.status} for ${url.pathname}`);
  return (await res.json()) as T;
}

export const mediaUrl = (u?: string | null): string | null => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_URL}${u.startsWith('/') ? '' : '/static/'}${u}`;
};

export const getFeed = (opts: { page?: number; pageSize?: number; categoryId?: number; tagId?: number; includeDescendants?: boolean } = {}) =>
  get<PaginatedPosts>('/cms/posts', {
    status: 'published',
    post_type: 'post',
    sort: 'published_at',
    order: 'desc',
    page: opts.page ?? 1,
    page_size: opts.pageSize ?? 12,
    category_id: opts.categoryId,
    include_descendants: opts.categoryId ? (opts.includeDescendants ?? true) : undefined,
    tag_id: opts.tagId,
  });

// track_view=false: server-side renders must not inflate view counts.
// (The backend only counts views on this endpoint; see tracker G7.)
export const getPost = (slug: string) => get<Post>(`/cms/posts/slug/${encodeURIComponent(slug)}`, { track_view: false });
export const getCategory = (slug: string) => get<Category>(`/cms/categories/slug/${encodeURIComponent(slug)}`);
export const getTag = (slug: string) => get<Tag>(`/cms/tags/slug/${encodeURIComponent(slug)}`);
/** null when no menu uses the location (backend 404). */
export const getMenu = (location: string) => get<Menu>(`/cms/menus/location/${encodeURIComponent(location)}`);

/** A menu must never break the page. */
export async function safeMenu(location: string): Promise<Menu | null> {
  try { return await getMenu(location); } catch { return null; }
}
