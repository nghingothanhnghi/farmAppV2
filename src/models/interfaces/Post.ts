// src/models/interfaces/Post.ts
// Hand-written mirror of the CMS schemas (FRONTEND_GUIDE §3). If this and the backend's
// /openapi.json ever disagree, the OpenAPI wins — see `npm run gen:api` for generated types.
//
// Nullability follows the API: optional/absent fields come back as `null`, not `undefined`.

export type PostStatus =
  | "draft"
  | "published"
  | "scheduled"
  | "archived";

export type PostType =
  | "post"
  | "page";

export interface CmsAuthor {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
}

export interface CmsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface CmsTag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface CmsMedia {
  id: number;
  filename: string;
  /** RELATIVE, e.g. "/static/cms_media/ab12.png" — run through getImageUrl() before rendering. */
  url: string;
  mime_type?: string | null;
  file_size?: number | null;
  alt_text?: string | null;
  uploaded_by_id?: number | null;
  created_at?: string;
}

export interface CmsPost {

  id: number;

  title: string;

  slug: string;

  excerpt?: string | null;

  /** Sanitized HTML as stored by the server. */
  content: string;

  post_type: PostType;

  status: PostStatus;

  is_featured: boolean;

  view_count: number;

  published_at?: string | null;

  scheduled_at?: string | null;

  created_at: string;

  updated_at?: string | null;

  author: CmsAuthor | null;

  category?: CmsCategory | null;

  category_id?: number | null;

  featured_image?: CmsMedia | null;

  featured_image_id?: number | null;

  tags: CmsTag[];

  meta_title?: string | null;

  meta_description?: string | null;
}

/** POST /cms/posts. `published_at` is server-stamped and is NOT accepted. */
export interface CmsPostCreate {

  /** 1..255 */
  title: string;

  /** Auto-generated from the title when omitted. */
  slug?: string | null;

  /** max 500 */
  excerpt?: string | null;

  content: string;

  post_type: PostType;

  status?: PostStatus;

  category_id?: number | null;

  featured_image_id?: number | null;

  tag_ids?: number[];

  meta_title?: string | null;

  meta_description?: string | null;

  is_featured?: boolean;

  /** Required (and must be in the future) when status === "scheduled". */
  scheduled_at?: string | null;
}

/**
 * PUT /cms/posts/{id} — partial update: only send fields that changed.
 * Never send `null` for title / content / post_type / status.
 */
export interface CmsPostUpdate {

  title?: string;

  slug?: string | null;

  excerpt?: string | null;

  content?: string;

  post_type?: PostType;

  status?: PostStatus;

  category_id?: number | null;

  featured_image_id?: number | null;

  /** Replaces the whole tag set; omit to leave tags alone. */
  tag_ids?: number[];

  meta_title?: string | null;

  meta_description?: string | null;

  is_featured?: boolean;

  scheduled_at?: string | null;
}

export interface PaginatedPosts {

  results: CmsPost[];

  total: number;

  page: number;

  page_size: number;

  pages?: number;
}

/** DELETE /cms/categories/{id}[?reassign_to] */
export interface CmsCategoryDeleteResult {
  detail: string;
  moved_children: number;
  moved_posts: number;
  moved_to_category_id: number | null;
}

/** DELETE /cms/tags/{id}[?force][&merge_into] */
export interface CmsTagDeleteResult {
  detail: string;
  posts_affected: number;
  merged_into_tag_id: number | null;
  posts_moved: number;
}
