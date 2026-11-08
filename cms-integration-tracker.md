# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows), `app/cms/schemas/menu.py` and the backend's `openapi.json` (received 2026-11-07, 252 paths, 220 schemas)
Last update: 2026-11-07 — **everything implemented so far is merged to main**: items 1–16 (6b = PR #22, 13–16 = PR #23), menus builder, menu schema alignment. No open branches. Nothing has been tested in a browser or against the live backend.
Legend: ✅ done · 🟡 partial / optional · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`); form modals that must stay open on failure catch (the page already alerted, or show the message inline as menus do). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()`. Edits are partial: build the payload with a diff helper (`buildPostUpdate`, menu form, category edit) rather than sending the whole form. Response types derive from `src/api/schema.d.ts`; request types are hand-written and checked in `src/api/schemaCheck.ts`. Models in `models/interfaces/*.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.
⚠ `apiClient` defaults `Content-Type: application/json` and axios will not override a default: any non-JSON body (form-encoded, `URLSearchParams`) must set its header explicitly (verified with a local test).

## 1. Done ✅ (merged)
| Area | Evidence |
|---|---|
| Bearer auth + 401 handling | `api/client.ts` |
| Post CRUD, publish / archive / schedule; post form incl. tags, category, featured image, scheduling (UTC ISO, future-only) | `postService`, `usePost`, `PostForm` |
| Categories CRUD; Tags (list/create/delete); Media upload/list/alt/delete | CMS pages |
| Absolute media URLs | `utils/getImageUrl.ts` |
| #1 Post list pagination · #2 422/error handling · #3 role/ownership gating · #4 delete recovery | PR #14 |
| #5 Editor: no base64; paste/drop images upload (also affects `ProductInfoForm`) | `RichTextEditor.tsx` |
| #7 Media pre-validation (ext, no svg, 20 MB) | `utils/mediaValidation.ts` |
| Menus: list/create/edit/delete (admin), builder (item tree, add/edit/delete, move up/down/indent/outdent via full flat `reorder`), targets custom/category/post, hidden-target note | PR #17 |
| Menu schema alignment: max lengths, `created_at` required, menu edit sends only changed fields | merged |
| #8 Media alt PATCH form-encoded (explicit header) · #11 category description · #12 schedule modal future check | merged |
| #9 Post edit: changed-fields-only update (`utils/postDiff.ts`), partial-update `scheduled_at` fix, slug-change warning, `updated_at` conflict check ("Save anyway"), clearing category sends `null` | merged |
| #10 Post list filters/search/sort: URL-synced (`usePostFilters`), `PostFilterBar`, debounced title+excerpt search, exact-category filter (no descendants), non-editors limited to published, empty state, stale-response guard in `usePost.fetchPosts` | PR #21 |
| #6/6b Generated types: `src/api/schema.d.ts` from the backend `openapi.json`; response types (`CmsPost`, `CmsCategory`, `CmsTag`, `CmsMedia`, `CmsAuthor`, `CmsMenu*`, enums) derived from it; list rows use `CmsPostListItem` (no `content`/`tags`/`updated_at`); `schemaCheck.ts` compile-time check of request types; `npm run gen:api` (uses `$VITE_API_BASE_URL`) and `npm run check:api` (fails on drift) | PR #22 |
| #13 Title/excerpt limits match backend (255 / 500; meta 70/160 stay as SEO guidance) · #14 delete-post dialog warns about linked menu items (client-side check, best effort) · #15 menu item post picker searches the server (no 100 cap) · #16 category edits send changed fields only | PR #23 |

Everything above still deserves a manual pass against the live backend.

## 2. Backend schema verification (vs `openapi.json` and `menu.py`)
**Confirmed ✅:** post list query params and `sort`/`order` values; `PaginatedPosts` = `{results, total, page, page_size}`; `MenuItemTargetType` = `custom | category | post`; `CategoryOut.description` exists (nullable); menu create/update responses are `MenuSummary` (no items), reorder returns the item array; media list uses `skip`/`limit` (max 200); category delete takes `reassign_to`; tag delete takes `force`/`merge_into`; update payloads are fully optional and nullable.
**Corrections:** the backend returns **no `pages`** (`usePost` computes it); there is **no tag update endpoint** (tags can't be renamed through this API); `created_at` is always returned for categories, tags, media and menus.
**Still ❓:**
- (a) The schema allows `null` in update payloads, but not whether the update service uses `exclude_unset` or `exclude_none`. With `exclude_none`, these would silently do nothing: "edit item → No parent" (`parent_id: null`), clearing a menu `location`, a category description/parent, or a post's `excerpt`/category/meta. **Test clearing each once.**
- (b) Delete responses (posts, categories, tags, media, menus, items) are untyped in the schema, so `CmsCategoryDeleteResult` / `CmsTagDeleteResult` shapes are unconfirmed.

## 3. Remaining 🟡 (all optional)
| # | Issue | Suggested fix |
|---|---|---|
| 15b | Menus: no drag-and-drop; editing an item's parent appends it last | `@dnd-kit` (new dependency) |
| 14b | Post-delete menu warning is only a client check; the backend still allows the delete | Backend 409 like categories |
| 17 | Filter dropdowns load all categories and tags once (no backend pagination); long selects if the sets get large | Searchable picker if needed |
| CI | `check:api` is manual: the repo has no `.github/workflows` and CI can't reach a backend | Run it against the deployed backend before releases, or commit an `openapi.json` snapshot and check against that |

## 4. Not started ⬜
| Item | Notes |
|---|---|
| Public site: feed, post/page by slug (`track_view=false` on SSR), category/tag pages, **menu renderer** (`menuService.getByLocation` exists; use `resolved_url`, skip `null`, `target="_blank" rel="noopener"`), routes `/posts/:slug` + `/categories/:slug`, 404 page | Repo is admin-only today. **Decide whether the public site lives in this app.** The schema has `/cms/categories/slug/{slug}`, `/cms/tags/slug/{slug}`, `/cms/posts/slug/{slug}`, `/cms/menus/location/{location}`, but no combined `/slug/{slug}` endpoint |

## 5. Environment / backend ❓
- Production frontend origin in `CORS_ALLOWED_ORIGINS`; `VITE_API_BASE_URL` set on Vercel.
- Persistent media storage (Render disk or S3/R2) — otherwise uploads vanish on redeploy.
- Policy: any logged-in user can create **and publish** posts (guide §11 #9).
- Dev-only: if "usePostContext must be used inside PostProvider" appears, hard refresh / restart Vite (HMR can duplicate the context module); `PostProvider` is mounted in `main.tsx`.

## Suggested next
Manual test pass against the live backend (esp. the `null`-clearing question in §2) → public site (if in scope) → optional items in §3.