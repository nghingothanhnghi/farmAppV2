// src/models/interfaces/Post.ts
// Response types are DERIVED from the backend's OpenAPI schema (src/api/schema.d.ts, `npm run gen:api`),
// so a backend change shows up as a type error here instead of a runtime surprise.
// Request payloads below stay hand-written (they encode UI rules such as "never send null for title")
// and are checked against the generated request types in src/api/schemaCheck.ts.
//
// Nullability follows the API: optional/absent fields come back as `null`, not `undefined`.
import type { components } from "../../api/schema";

type Schemas = components["schemas"];

export type PostStatus = Schemas["PostStatus"];

export type PostType = Schemas["PostType"];

export type CmsAuthor = Schemas["AuthorOut"];

export type CmsCategory = Schemas["CategoryOut"];

export type CmsTag = Schemas["TagOut"];

/** `url` is RELATIVE, e.g. "/static/cms_media/ab12.png" — run through getImageUrl() before rendering. */
export type CmsMedia = Schemas["MediaOut"];

/** GET /cms/posts/{id}, create/update/publish/archive/schedule responses. */
export type CmsPost = Schemas["PostOut"];

/** One row of GET /cms/posts (no `content`, `tags`, `updated_at`). Rows are used as CmsPost by the grid. */
export type CmsPostListItem = Schemas["PostListItem"];

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

/** The backend returns no `pages`; usePost computes it from total / page_size. */
export type PaginatedPosts = Schemas["PaginatedPosts"] & { pages?: number };

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
