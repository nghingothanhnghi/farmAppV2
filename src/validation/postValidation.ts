// src/validation/postValidation.ts
import * as Yup from "yup";

export const postSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),

  slug: Yup.string()
    .trim()
    .required("Slug is required")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  excerpt: Yup.string()
    .max(300, "Excerpt must be under 300 characters")
    .nullable(),

  content: Yup.string()
    .required("Content is required")
    .test(
      "not-empty-html",
      "Content is required",
      (value) => !!value && value.replace(/<[^>]*>/g, "").trim().length > 0
    ),

  post_type: Yup.string()
    .oneOf(["post", "page"], "Invalid post type")
    .required("Post type is required"),

  status: Yup.string()
    .oneOf(["draft", "published", "scheduled", "archived"], "Invalid status")
    .required("Status is required"),

  category_id: Yup.number()
    .nullable()
    .transform((v) => (isNaN(v) ? null : v)),

  tag_ids: Yup.array().of(Yup.number()).nullable(),

  // 🔥 conditional: required only when status === "scheduled"
  scheduled_at: Yup.string()
    .nullable()
    .when("status", {
      is: "scheduled",
      then: (s) =>
        s
          .required("Publish date/time is required for scheduled posts")
          .test(
            "is-future",
            "Publish date/time must be in the future",
            (value) => {
              if (!value) return false;
              return new Date(value).getTime() > Date.now();
            }
          ),
      otherwise: (s) => s.notRequired(),
    }),

  meta_title: Yup.string().max(70, "Meta title should be under 70 characters").nullable(),
  meta_description: Yup.string().max(160, "Meta description should be under 160 characters").nullable(),
});