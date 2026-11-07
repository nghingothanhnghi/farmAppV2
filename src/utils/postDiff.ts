// src/utils/postDiff.ts
// PUT /cms/posts/{id} is a partial update (FRONTEND_GUIDE §7): send only what changed.
// Besides being smaller, this avoids false rejections from re-sending untouched values, e.g.
//  - an unchanged `slug` colliding with the post's own slug,
//  - an unchanged `scheduled_at` that is already in the past (the go-live job lags up to ~60s),
// and it stops one editor's stale form from overwriting another editor's unrelated edits.
import type { CmsPost, CmsPostUpdate } from "../models/interfaces/Post";

type FormValues = Partial<CmsPostUpdate>;

const blank = (v?: string | null) => (v ?? "").trim() === "";
/** null and "" are the same "empty" value for optional text fields. */
const sameText = (a?: string | null, b?: string | null) =>
  blank(a) && blank(b) ? true : (a ?? "") === (b ?? "");
/** To clear an optional text field the API wants an explicit null. */
const textOrNull = (v?: string | null) => (blank(v) ? null : (v as string));

const instant = (v?: string | null): number | null => {
  if (!v) return null;
  const t = new Date(v).getTime();
  return isNaN(t) ? null : t;
};

const sameIds = (a: number[] = [], b: number[] = []) =>
  a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");

/**
 * Compares the edit form with the post as it was loaded and returns only the changed fields.
 * `{}` means nothing changed.
 */
export const buildPostUpdate = (original: CmsPost, form: FormValues): CmsPostUpdate => {
  const changes: CmsPostUpdate = {};

  if (form.title !== undefined && form.title !== original.title) changes.title = form.title;

  const slug = form.slug?.trim();
  if (slug && slug !== original.slug) changes.slug = slug;

  if (form.excerpt !== undefined && !sameText(form.excerpt, original.excerpt)) {
    changes.excerpt = textOrNull(form.excerpt);
  }
  if (form.content !== undefined && form.content !== original.content) changes.content = form.content;
  if (form.post_type !== undefined && form.post_type !== original.post_type) changes.post_type = form.post_type;
  if (form.status !== undefined && form.status !== original.status) changes.status = form.status;

  const originalCategory = original.category_id ?? original.category?.id ?? null;
  if (form.category_id !== undefined && (form.category_id ?? null) !== originalCategory) {
    changes.category_id = form.category_id ?? null;
  }

  const originalImage = original.featured_image_id ?? original.featured_image?.id ?? null;
  if (form.featured_image_id !== undefined && (form.featured_image_id ?? null) !== originalImage) {
    changes.featured_image_id = form.featured_image_id ?? null;
  }

  // tag_ids REPLACES the whole set, so send the full list or nothing.
  if (form.tag_ids !== undefined && !sameIds(form.tag_ids, (original.tags ?? []).map((t) => t.id))) {
    changes.tag_ids = form.tag_ids;
  }

  if (form.meta_title !== undefined && !sameText(form.meta_title, original.meta_title)) {
    changes.meta_title = textOrNull(form.meta_title);
  }
  if (form.meta_description !== undefined && !sameText(form.meta_description, original.meta_description)) {
    changes.meta_description = textOrNull(form.meta_description);
  }
  if (form.is_featured !== undefined && form.is_featured !== original.is_featured) {
    changes.is_featured = form.is_featured;
  }

  // Compare instants, not strings ("…Z" vs "…+00:00"). Scheduling always needs its time.
  if (
    instant(form.scheduled_at) !== instant(original.scheduled_at) ||
    (changes.status === "scheduled" && form.scheduled_at)
  ) {
    changes.scheduled_at = form.scheduled_at ?? null;
  }

  return changes;
};
