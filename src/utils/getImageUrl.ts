// src/utils/getImageUrl.ts
import { API_BASE_URL } from "../config/constants";
import { DEFAULT_AVATAR } from "../constants/constants";

export function getImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return DEFAULT_AVATAR; // fallback
  if (imageUrl.startsWith("http")) return imageUrl; // already absolute

  // ✅ prevent duplicate /static
  if (imageUrl.startsWith("/static")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/static/${imageUrl}`; // normalize relative path
}
