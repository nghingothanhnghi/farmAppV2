# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows), `app/cms/schemas/menu.py` and the backend's `openapi.json` (received 2026-11-07, 252 paths, 220 schemas)
Last update: 2026-11-07 — items 1–10, menus builder, menu schema alignment and items 8, 11, 12 are **merged to main** (item 10 = PR #21). Two branches are **not merged**: **6b** `cms-item-6b-generated-types` (commit `9b28f2f`) and **13–16** `cms-item-13-16-polish` (commit `2b17129`, branched from `main`, independent of 6b). Both: `tsc` and `npm run build` clean. Nothing has been tested in a browser or against the live backend.
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🟡 partial / needs fix · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`); form modals that must stay open on failure catch (the page already alerted, or show the message inline as menus do). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()`. Edits are partial: build the payload with a diff helper (`buildPostUpdate`, menu form, category edit) rather than sending the whole form. Models in `models/interfaces/*.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.
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
| #6 Types synced to guide §3 (hand-written; superseded by 6b below) | `models/interfaces/Post.ts` |
| #7 Media pre-validation (ext, no svg, 20 MB) | `utils/mediaValidation.ts` |
| Menus: list/create/edit/delete (admin), builder (item tree, add/edit/delete, move up/down/indent/outdent via full flat `reorder`), targets custom/category/post, hidden-target note | PR #17 |
| Menu schema alignment: max lengths, `created_at` required, menu edit sends only changed fields | merged |
| #8 Media alt PATCH form-encoded (explicit header) · #11 category description · #12 schedule modal future check | merged |
| #9 Post edit: changed-fields-only update (`utils/postDiff.ts`), partial-update `scheduled_at` fix, slug-change warning, `updated_at` conflict check ("Save anyway"), clearing category sends `null` | merged |
| #10 Post list filters/search/sort: URL-synced (`usePostFilters`), `PostFilterBar`, debounced title+excerpt search, exact-category filter (no descendants), non-editors limited to published, empty state, stale-response guard in `usePost.fetchPosts` | PR #21 |

Everything above still deserves a manual pass against the live backend.

## 2. On branch `cms-item-6b-generated-types` 🔧
| Piece | What changed | How to verify |
|---|---|---|
| Generated schema | `src/api/schema.d.ts` generated with `openapi-typescript` from the backend's `openapi.json` (18k lines, whole API, not just CMS) | Re-run `npm run gen:api` with the backend up: no diff expected |
| Response types derived | `Post.ts` and `Menu.ts` export `CmsPost`, `CmsCategory`, `CmsTag`, `CmsMedia`, `CmsAuthor`, `CmsMenu*`, enums as aliases of `components["schemas"][…]`. Names unchanged, so no component imports changed | `tsc` + `npm run build` clean |
| List rows get their own type | `CmsPostListItem` = `PostListItem`: **list rows have no `content`, `tags` or `updated_at`**. The old code typed list rows as full `CmsPost` (a real mismatch the generated types exposed). `usePost.posts`, `PostGrid`, `ScheduleModal` and the list page use it | List page unchanged at runtime |
| Request types checked | `src/api/schemaCheck.ts` (compile-time only) asserts hand-written `CmsPostCreate/Update`, `MenuInput`, `MenuItemInput`, `MenuReorderEntry` and `PostQuery` are accepted by the generated request types. Verified it fails when a key is wrong. Request types stay hand-written on purpose (they encode UI rules such as "never send null for title") | Rename a field in `schemaCheck` → `tsc` fails |
| Scripts | `npm run gen:api` now uses `$VITE_API_BASE_URL` (default `http://localhost:8000`); `npm run check:api` regenerates and fails if `schema.d.ts` changed | Run against the deployed backend before releases |

Not done: **no CI step** (the repo has no `.github/workflows`, and CI can't reach a backend). `check:api` is manual, or can run in CI if a backend URL or a committed `openapi.json` snapshot is available. Delete responses are typed free-form in the schema (see §3), so `CmsCategoryDeleteResult` / `CmsTagDeleteResult` remain hand-written.
Merge note: the polish branch below was cut from `main`, so the two branches touch different files except possibly `PostForm`-adjacent types; expect at most a trivial conflict.

## 3. On branch `cms-item-13-16-polish` 🔧 (old §4 items 13–16)
| # | What changed | How to verify |
|---|---|---|
| 13 | Yup limits match the backend: title **255** (was 200), excerpt **500** (was 300). Meta title 70 / description 160 stay as SEO guidance (the backend has no limit for them) | Enter a 400-character excerpt: accepted; 501: rejected client-side |
| 14 | Delete-post dialog now shows an amber warning listing menu items that link to the post ("Header → About"). **Client-side check** (`menuService.findPostReferences`: list menus, load each tree, scan `target_type=post`), because the backend does not guard it. Best effort: if menus can't be loaded (permissions/error) no warning is shown and delete works as before. A backend 409 would still be the real fix | Link a post in a menu, then try to delete it |
| 15 | Menu item post picker has a **search box** (debounced 300 ms, `GET /cms/posts?status=published&search=…`, 50 results), so any published post or page can be chosen, not just the newest 100. Without a query it still shows the preloaded list. Drag-and-drop **not done** (needs a new dependency; the up/down/indent/outdent buttons stay). Editing an item's parent still appends it last | Search for an old post in the picker |
| 16 | Category edit sends **changed fields only** (name, slug, description, parent); untouched slug can't collide with itself; no changes → "No changes to save." info alert. Create unchanged. Tags: no update endpoint exists, nothing to do | Edit only the description → request has only `description` |

## 4. Backend schema verification (vs `openapi.json` and `menu.py`)
**Confirmed ✅:** post list query params and `sort`/`order` values; `PaginatedPosts` = `{results, total, page, page_size}`; `MenuItemTargetType` = `custom | category | post`; `CategoryOut.description` exists (nullable); menu create/update responses are `MenuSummary` (no items), reorder returns the item array; media list uses `skip`/`limit` (max 200); category delete takes `reassign_to`; tag delete takes `force`/`merge_into`; update payloads are fully optional and nullable.
**Corrections:**
- The backend returns **no `pages`** in the post list. `usePost` computes it from `total` / `page_size`.
- **There is no tag update endpoint** (tags only have GET, POST, DELETE): renaming a tag is not possible through this API.
- `created_at` is always returned for categories, tags, media and menus.
**Still ❓:** (a) The schema allows `null` in update payloads, but not whether the update service uses `exclude_unset` or `exclude_none`. With `exclude_none`, "edit item → No parent" (`parent_id: null`) and clearing a menu `location`, a category description/parent, or a post's `excerpt`/category/meta would silently do nothing. **Test clearing each once.** (b) Delete responses (posts, categories, tags, media, menus, items) are untyped in the schema, so the shapes of `CmsCategoryDeleteResult` / `CmsTagDeleteResult` are unconfirmed.

## 5. Remaining 🟡
| # | Issue | Guide ref | Suggested fix |
|---|---|---|---|
| 15b | Menus: no drag-and-drop; editing an item's parent appends it last | §7 | `@dnd-kit` later (new dependency) |
| 17 | Filter dropdowns load all categories and tags once; neither list is paginated by the backend, so very large sets make long selects. No change needed now | §6 | Searchable picker if it becomes a problem |
| 14b | Post-delete menu warning is only a client check; the backend still allows the delete | §11 | Backend 409 like categories |

## 6. Not started ⬜
| Item | Notes |
|---|---|
| Public site: feed, post/page by slug (`track_view=false` on SSR), category/tag pages, **menu renderer** (`menuService.getByLocation` exists; use `resolved_url`, skip `null`, `target="_blank" rel="noopener"`), routes `/posts/:slug` + `/categories/:slug`, 404 page | Repo is admin-only today. **Decide whether the public site lives in this app.** The schema has `/cms/categories/slug/{slug}`, `/cms/tags/slug/{slug}`, `/cms/posts/slug/{slug}`, `/cms/menus/location/{location}`, but no combined `/slug/{slug}` endpoint |

## 7. Environment / backend ❓
- Production frontend origin in `CORS_ALLOWED_ORIGINS`; `VITE_API_BASE_URL` set on Vercel.
- Persistent media storage (Render disk or S3/R2) — otherwise uploads vanish on redeploy.
- Policy: any logged-in user can create **and publish** posts (guide §11 #9).
- Dev-only: if "usePostContext must be used inside PostProvider" appears, hard refresh / restart Vite (HMR can duplicate the context module); `PostProvider` is mounted in `main.tsx`.

## Suggested next
Merge 6b and the polish branch → manual test pass against the live backend (esp. the `null`-clearing question in §4) → public site (if in scope).