// src/cms/models/interfaces/Post.ts

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
  parent_id?: number | null;
}

export interface CmsTag {
  id: number;
  name: string;
  slug: string;
}

export interface CmsMedia {
  id: number;
  filename: string;
  url: string;
  alt_text?: string;
  uploaded_by_id?: number | null;
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

export interface CmsPost {

  id: number;

  title: string;

  slug: string;

  excerpt?: string;

  content: string;

  post_type: PostType;

  status: PostStatus;

  is_featured: boolean;

  view_count: number;

  published_at?: string;

  scheduled_at?: string;

  created_at: string;

  updated_at?: string;

  author: CmsAuthor;

  category?: CmsCategory;

  featured_image?: CmsMedia;

  tags: CmsTag[];

  meta_title?: string;

  meta_description?: string;
}

export interface CmsPostCreate {

  title: string;

  slug?: string;

  excerpt?: string;

  content: string;

  post_type: PostType;

  status?: PostStatus;

  category_id?: number;

  featured_image_id?: number;

  tag_ids?: number[];

  meta_title?: string;

  meta_description?: string;

  is_featured?: boolean;

  published_at?: string;

  scheduled_at?: string;
}

export interface CmsPostUpdate {

  title?: string;

  slug?: string;

  excerpt?: string;

  content?: string;

  post_type?: PostType;

  status?: PostStatus;

  category_id?: number | null;

  featured_image_id?: number | null;

  tag_ids?: number[];

  meta_title?: string;

  meta_description?: string;

  is_featured?: boolean;

  published_at?: string | null;

  scheduled_at?: string | null;
}

export interface PaginatedPosts {

  results: CmsPost[];

  total: number;

  page: number;

  page_size: number;

   pages?: number; 
}