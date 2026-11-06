// src/utils/mediaValidation.ts
// Client-side pre-checks for POST /cms/media/upload (FRONTEND_GUIDE §7).
// The server stays authoritative (it also checks magic bytes), this just gives
// instant feedback instead of a round trip.

/** Extensions the backend accepts. `.svg` is deliberately NOT allowed. */
export const CMS_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"] as const;
export const CMS_MEDIA_EXTENSIONS = [...CMS_IMAGE_EXTENSIONS, ".pdf", ".mp4", ".webm"] as const;

/** Value for <input accept>. The media library UI is image-only (it renders <img>). */
export const CMS_IMAGE_ACCEPT = CMS_IMAGE_EXTENSIONS.join(",");
export const CMS_MEDIA_ACCEPT = CMS_MEDIA_EXTENSIONS.join(",");

/** Mirrors server env CMS_MAX_MEDIA_SIZE_MB (default 20). Override with VITE_CMS_MAX_MEDIA_SIZE_MB. */
export const CMS_MAX_MEDIA_SIZE_MB = Number(import.meta.env.VITE_CMS_MAX_MEDIA_SIZE_MB) || 20;

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
};

/**
 * Returns an error message, or null when the file looks acceptable.
 * Pass `imagesOnly` for pickers that can only display images.
 */
export const validateMediaFile = (
  file: File,
  options: { imagesOnly?: boolean } = {}
): string | null => {
  const allowed: readonly string[] = options.imagesOnly ? CMS_IMAGE_EXTENSIONS : CMS_MEDIA_EXTENSIONS;
  const ext = extensionOf(file.name);

  if (!allowed.includes(ext)) {
    return ext === ".svg"
      ? "SVG files are not allowed. Please use JPG, PNG, GIF or WebP."
      : `Unsupported file type${ext ? ` "${ext}"` : ""}. Allowed: ${allowed.join(", ")}.`;
  }

  if (file.size > CMS_MAX_MEDIA_SIZE_MB * 1024 * 1024) {
    return `File is too large. Maximum size is ${CMS_MAX_MEDIA_SIZE_MB} MB.`;
  }

  if (file.size === 0) {
    return "File is empty.";
  }

  return null;
};
