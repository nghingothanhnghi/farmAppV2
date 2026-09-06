// src/utils/oauth.ts
import { API_BASE_URL } from "../config/constants";

export type OAuthProvider = "google" | "facebook";

/**
 * Builds the backend OAuth login URL.
 * Backend route: GET /auth/{provider}/login?redirect_after=...
 * After a successful login, the backend redirects the browser to
 * `${redirect_after}#access_token=...&token_type=bearer`.
 */
export const getOAuthLoginUrl = (
  provider: OAuthProvider,
  redirectAfter?: string
): string => {
  const url = new URL(`${API_BASE_URL}/auth/${provider}/login`);
  if (redirectAfter) {
    url.searchParams.set("redirect_after", redirectAfter);
  }
  return url.toString();
};

/**
 * Navigates the browser (full page redirect, not fetch/XHR) to the
 * provider's OAuth consent screen via the backend.
 */
export const startOAuthLogin = (
  provider: OAuthProvider,
  redirectAfter?: string
) => {
  window.location.href = getOAuthLoginUrl(
    provider,
    redirectAfter ?? window.location.origin
  );
};

/**
 * Extracts an access token from the current URL hash, if present
 * (e.g. "#access_token=xxx&token_type=bearer" set by the OAuth callback).
 */
export const extractOAuthTokenFromHash = (): string | null => {
  if (!window.location.hash || !window.location.hash.includes("access_token")) {
    return null;
  }
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("access_token");
};

/** Strips the OAuth token fragment from the URL without adding a history entry. */
export const clearOAuthHash = () => {
  const cleanUrl = window.location.pathname + window.location.search;
  window.history.replaceState(null, "", cleanUrl);
};