# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows), `app/cms/schemas/menu.py`, the backend's updated guide (2026-11-08) and its `openapi.json` (**latest received 2026-11-09**; `src/api/schema.d.ts` is generated from it)
Last update: 2026-11-09 — items 1–16 and **B1 + B2** (post delete 409/force, tag rename; PR #24) are **merged to main**. **B3–B5** (include subcategories, `pages`, typed deletes) are on branch **`cms-b3-b5-regen-types`** (commit `1f79928`; `tsc` and `npm run build` clean; **not merged**). Nothing has been tested in a browser or against the live backend.
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🟡 partial / optional · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`); form modals that must stay open on failure catch (the page already alerted, or show the message inline as menus do). 409 "in use" flows keep the delete dialog open and offer the server's alternatives (tags: merge / force; posts: force). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()`. Edits are partial: build the payload with a diff helper (`buildPostUpdate`, menu form, category edit, tag edit) rather than sending the whole form. Response types derive from `src/api/schema.d.ts`; request types are hand-written and checked in `src/api/schemaCheck.ts`. Models in `models/interfaces/*.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.
⚠ `apiClient` defaults `Content-Type: application/json` and axios will not override a default: any non-JSON body (form-encoded, `URLSearchParams`) must set its header explicitly (verified with a local test).

## 1. Done ✅ (merged)
| Area | Evidence |
|---|---|
| Bearer auth + 401 handling | `api/client.ts` |
| Post CRUD, publish / archive / schedule; post form incl. tags, category, featured image, scheduling (UTC ISO, future-only) | `postService`, `usePost`, `PostForm` |
| Categories CRUD (+ reassign on delete); Tags (list/create/**rename**/delete with force / merge); Media upload/list/alt/delete | CMS pages |
| Absolute media URLs | `utils/getImageUrl.ts` |
| #1 Post list pagination · #2 422/error handling · #3 role/ownership gating · #4 delete recovery | PR #14 |
| #5 Editor: no base64; paste/drop images upload (also affects `ProductInfoForm`) | `RichTextEditor.tsx` |
| #7 Media pre-validation (ext, no svg, 20 MB) | `utils/mediaValidation.ts` |
| Menus: list/create/edit/delete (admin), builder (item tree, add/edit/delete, move up/down/indent/outdent via full flat `reorder`), targets custom/category/post, hidden-target note | PR #17 |
| Menu schema alignment: max lengths, `created_at` required, menu edit sends only changed fields | merged |
| #8 Media alt PATCH form-encoded · #11 category description · #12 schedule modal future check | merged |
| #9 Post edit: changed-fields-only update (`utils/postDiff.ts`), slug-change warning, `updated_at` conflict check, clearing category sends `null` | merged |
| #10 Post list filters/search/sort: URL-synced (`usePostFilters`), `PostFilterBar`, debounced search, exact-category filter, non-editors limited to published, empty state, stale-response guard | PR #21 |
| #6/6b Generated types, derived response types, `CmsPostListItem`, `schemaCheck.ts`, `npm run gen:api` / `check:api` | PR #22 |
| #13 limits 255/500 · #15 menu post picker searches the server · #16 category edits changed-fields-only | PR #23 |
| **B1** post delete: on 409 (menu item links to it) the dialog explains and, for editors, offers "Delete post & remove menu items" (`?force=true`); success alert shows `menu_items_removed`; the client-side menu scan from #14 is removed · **B2** tag rename (`PUT /cms/tags/{id}`): edit modal, changed fields only, slug kept unless edited, 409 message shown; tag grid uses shared `ActionButtons`; create modal no longer leaves an unhandled rejection | PR #24 |

Everything above still deserves a manual pass against the live backend.

## 2. On branch `cms-b3-b5-regen-types` 🔧
| # | What changed | How to verify |
|---|---|---|
| Regenerated types | `src/api/schema.d.ts` from the 2026-11-09 openapi (+107/−8 lines). New in it: `PUT /cms/tags/{id}` + `TagUpdate`, typed delete bodies (`CategoryDeleteOut`, `TagDeleteOut`, `PostDeleteOut`, `DeleteOut`), `pages` on `PaginatedPosts`, `include_descendants` and `force` query params | `npm run check:api` against the live backend: no diff |
| **B3** include subcategories | `PostQuery.include_descendants`; `usePostFilters` has `include_descendants` (URL `?sub=1`, only valid with a category, cleared automatically when the category is cleared, resets to page 1); `PostFilterBar` shows an **"Include subcategories"** checkbox when a category is selected; the query sends `include_descendants=true` only with a category | Pick a parent category: posts of children appear only when the box is ticked |
| **B4** `pages` | `PaginatedPosts` now is the generated type; `usePost` uses `data.pages` (fallback 1); the client-side calculation is gone | Pagination shows the right page count |
| **B5** typed deletes | `CmsCategoryDeleteResult`, `CmsTagDeleteResult`, `CmsPostDeleteResult` are aliases of the generated schemas (hand-written shapes removed); `CmsTagUpdate` is checked against `TagUpdate` in `schemaCheck.ts` (never send `null` for tag name/slug: backend 422) | `tsc` |

## 3. Backend items status
| # | Backend change | Status |
|---|---|---|
| B6 | Category delete **409 if a menu item links to it** (message names the menu and item) | Category delete shows the server error via alert; **check the text reads well** (no `force` for categories) |
| B7 | Update semantics: omit untouched, **explicit `null` clears** post `category_id`, `featured_image_id`, `excerpt`, `meta_*`, `scheduled_at`; never `null` for title/content/post_type/status; tag update rejects `null` (422) | Frontend sends exactly this. The openapi/guide say nothing for categories, menus, menu items: **run the manual clear-field test once** |
| B8 | `GET /auth/me` includes `roles` | Optional: use `me.roles` instead of the extra `/roles/my/roles` call |
| B9 | Scheduled posts go live within ~60 s | Optional: refetch on window focus |

## 4. Backend schema verification
**Confirmed ✅:** everything in the 2026-11-07 openapi (post params, sort/order, menu enum `custom | category | post`, `CategoryOut.description`, menu summaries, reorder, media `skip`/`limit` with **no total**, delete params) **plus, from the 2026-11-09 openapi:** tag update exists and rejects `null`; delete responses are typed exactly as the frontend assumed (category `{detail, moved_children, moved_posts, moved_to_category_id}`, tag `{detail, posts_affected, merged_into_tag_id, posts_moved}`, post `{detail, menu_items_removed}`, others `{detail}`); `pages` = ceil(total / page_size), 0 when empty; `include_descendants` and `force` params.
**Still ❓:** null-clearing for categories (description, parent), menus (location) and menu items (parent → "No parent"). The schema cannot tell; test it once.

## 5. Remaining 🟡 (all optional)
| # | Issue | Suggested fix |
|---|---|---|
| 15b | Menus: no drag-and-drop; editing an item's parent appends it last | `@dnd-kit` (new dependency) |
| 17 | Filter dropdowns load all categories and tags once (no backend pagination) | Searchable picker if needed |
| CI | `check:api` is manual: no `.github/workflows` and CI can't reach a backend | Run against the deployed backend before releases, or commit an `openapi.json` snapshot |
| G3 | Backend: no category tree / `?root=true`; pickers build the tree client-side (done) | None needed |
| G7 | Backend: view counting only via `GET …/slug` (`track_view`); `POST /cms/posts/{id}/view` planned | Only matters for the public site |
| G9 | Policy: any logged-in user can create **and publish** posts. The UI shows publish for own posts | Decide: keep, or restrict to editors (backend change + hide button) |
| G12 | Media list has no `total`: the media page must page until a short page returns | Check the media page does this |

## 6. Not started ⬜
| Item | Notes |
|---|---|
| Public site: feed (`status=published`, `sort=published_at`, `track_view=false` on SSR), post/page by slug, category/tag pages via `GET /cms/categories/slug/{slug}` and `GET /cms/tags/slug/{slug}`, **menu renderer** (`menuService.getByLocation`; use `resolved_url`, skip `null`, `open_in_new_tab` → `target="_blank" rel="noopener"`; 404 when no menu uses the location), routes `/posts/:slug` + `/categories/:slug` (menu `resolved_url` values point to them; pages also live under `/posts/:slug`), 404 page, render `content` in a prose container with absolute media URLs | Repo is admin-only today. **Decide whether the public site lives in this app.** Cache: don't cache authenticated responses; ISR revalidate ≤ 60 s for scheduled posts |

## 7. Environment / backend ❓
- Production frontend origin in `CORS_ALLOWED_ORIGINS` (or `FRONTEND_URL`); `VITE_API_BASE_URL` set on Vercel.
- **Persistent media storage** (Render disk with `CMS_MEDIA_DIR`, or S3/R2): without it, uploaded files disappear on redeploy while DB rows remain (backend gap 14).
- Token lifetime 30 days, no refresh token: on 401 the app goes to login (matches `api/client.ts`).
- Dev-only: if "usePostContext must be used inside PostProvider" appears, hard refresh / restart Vite (HMR can duplicate the context module).

## Suggested next
1. Merge `cms-b3-b5-regen-types`.
2. **Manual test pass against the live backend** (this is now the main open risk): clear-field cases (category description/parent, menu location, item "No parent"), post delete with a menu link (editor and non-editor), category delete with a menu link, tag rename conflict, scheduled → published, include-subcategories filter.
3. Public site (if in scope), then the optional items in §5.