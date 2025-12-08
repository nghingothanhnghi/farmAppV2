// src/utils/getImageUrl.ts
import { API_BASE_URL } from "../config/constants";
import { DEFAULT_AVATAR, DEFAULT_PRODUCT_IMAGE } from "../constants/constants";

export function getImageUrl(imageUrl?: string | null, isProduct = false): string {
  const fallback = isProduct ? DEFAULT_PRODUCT_IMAGE : DEFAULT_AVATAR;

  if (!imageUrl) return fallback;
  if (imageUrl.startsWith("http")) return imageUrl;

  if (imageUrl.startsWith("/static")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/static/${imageUrl}`;
}
