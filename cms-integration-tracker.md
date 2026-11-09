# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows), `app/cms/schemas/menu.py`, the backend's `openapi.json` (received 2026-11-07, 252 paths) and the **updated backend guide (received 2026-11-08)**
Last update: 2026-11-08 — items 1–16 are **merged to main** (6b = PR #22, 13–16 = PR #23). **B1 + B2** (post delete 409/force, tag rename) are on branch **`cms-b1-b2-post-delete-tag-rename`** (commit `b309116`; `tsc` and `npm run build` clean; **not merged**). B3–B5 wait for the new `openapi.json`. Nothing has been tested in a browser or against the live backend.
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🆕 backend ready, frontend not yet · 🟡 partial / optional · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`); form modals that must stay open on failure catch (the page already alerted, or show the message inline as menus do). 409 "in use" flows keep the delete dialog open and offer the server's alternatives (tags: merge / force; posts: force). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()`. Edits are partial: build the payload with a diff helper (`buildPostUpdate`, menu form, category edit, tag edit) rather than sending the whole form. Response types derive from `src/api/schema.d.ts`; request types are hand-written and checked in `src/api/schemaCheck.ts`. Models in `models/interfaces/*.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.
⚠ `apiClient` defaults `Content-Type: application/json` and axios will not override a default: any non-JSON body (form-encoded, `URLSearchParams`) must set its header explicitly (verified with a local test).

## 1. Done ✅ (merged)
| Area | Evidence |
|---|---|
| Bearer auth + 401 handling | `api/client.ts` |
| Post CRUD, publish / archive / schedule; post form incl. tags, category, featured image, scheduling (UTC ISO, future-only) | `postService`, `usePost`, `PostForm` |
| Categories CRUD (+ reassign on delete); Tags (list/create/delete with force / merge); Media upload/list/alt/delete | CMS pages |
| Absolute media URLs | `utils/getImageUrl.ts` |
| #1 Post list pagination · #2 422/error handling · #3 role/ownership gating · #4 delete recovery | PR #14 |
| #5 Editor: no base64; paste/drop images upload (also affects `ProductInfoForm`) | `RichTextEditor.tsx` |
| #7 Media pre-validation (ext, no svg, 20 MB) | `utils/mediaValidation.ts` |
| Menus: list/create/edit/delete (admin), builder (item tree, add/edit/delete, move up/down/indent/outdent via full flat `reorder`), targets custom/category/post, hidden-target note | PR #17 |
| Menu schema alignment: max lengths, `created_at` required, menu edit sends only changed fields | merged |
| #8 Media alt PATCH form-encoded · #11 category description · #12 schedule modal future check | merged |
| #9 Post edit: changed-fields-only update (`utils/postDiff.ts`), slug-change warning, `updated_at` conflict check, clearing category sends `null` | merged |
| #10 Post list filters/search/sort: URL-synced (`usePostFilters`), `PostFilterBar`, debounced search, exact-category filter, non-editors limited to published, empty state, stale-response guard | PR #21 |
| #6/6b Generated types: `src/api/schema.d.ts` (from the 2026-11-07 openapi), derived response types, `CmsPostListItem`, `schemaCheck.ts`, `npm run gen:api` / `check:api` | PR #22 |
| #13 limits 255/500 · #14 (client-side menu warning, **superseded by B1**) · #15 menu post picker searches the server · #16 category edits changed-fields-only | PR #23 |

Everything above still deserves a manual pass against the live backend.

## 2. On branch `cms-b1-b2-post-delete-tag-rename` 🔧
| # | What changed | How to verify |
|---|---|---|
| B1 | `postService.delete(id, {force?})` returns `{detail, menu_items_removed}` (`CmsPostDeleteResult`, hand-typed until the new openapi is generated). On **409** (a menu item links to the post) the delete dialog stays open, shows the server message and, **for editors**, a "Delete post & remove menu items" button (`?force=true`); non-editors are told to ask an editor. Success alert says how many menu items were removed. The client-side menu scan from #14 (`menuService.findPostReferences`, N extra requests) is **removed**: the backend guards it now | Link a post in a menu, delete it: 409 dialog; as editor force-delete: menu item is gone; as a non-editor author: no force button |
| B2 | `PUT /cms/tags/{id}`: `tagService.update`, `useTag.updateTag`, `TagFormModal` has an edit mode (slug is **not** regenerated from the name when editing: renaming keeps the slug), sends changed fields only, "No changes to save." when untouched, 409 (duplicate name/slug) shows the server message and keeps the modal open. Tag grid now uses the shared `ActionButtons` (edit gated by `canEditTaxonomy`, delete by `canDeleteTaxonomy`). Also fixed: the create modal no longer leaves an unhandled rejection when create fails | Rename a tag; rename to an existing name: 409 message |

## 3. 🆕 Backend ready, frontend not yet (from the updated backend guide)
| # | Backend change | Work |
|---|---|---|
| B3 | Post list **`include_descendants=true`** with `category_id` | Add to `PostQuery`, `?sub=` URL param, checkbox "Include subcategories" in `PostFilterBar` (shown when a category is selected). **Needs the new openapi for `schemaCheck`** |
| B4 | Post list returns **`pages`** | Regenerate types; `usePost` already prefers `data.pages`, drop the fallback comment |
| B5 | Delete responses typed (category / tag / post) | Regenerate types; derive `CmsCategoryDeleteResult`, `CmsTagDeleteResult`, `CmsPostDeleteResult` from the schema |
| B6 | Category delete **409 if a menu item links to it** (message names the menu and item) | Category delete shows the server error via alert; check the text reads well (no `force` for categories) |
| B7 | Documented update semantics: omit untouched fields, **explicit `null` clears** `category_id`, `featured_image_id`, `excerpt`, `meta_*`, `scheduled_at`; never `null` for title/content/post_type/status; `tag_ids` replaces the set | Frontend already sends exactly this. Guide does not state `exclude_unset` for categories, menus, menu items: **run the manual clear-field test** |
| B8 | `GET /auth/me` includes `roles` | Optional: use `me.roles` instead of the extra `/roles/my/roles` call |
| B9 | Scheduled posts go live within ~60 s | Optional: refetch on window focus |

**Needed for B3–B5:** the backend's *new* `openapi.json` (the one in `schema.d.ts` is from 2026-11-07). Then `npm run gen:api`, fix any `tsc` / `schemaCheck` errors.

## 4. Backend schema verification
**Confirmed ✅ (2026-11-07 openapi + 2026-11-08 guide):** post list params and `sort`/`order` values; `PaginatedPosts`; `MenuItemTargetType` = `custom | category | post`; `CategoryOut.description`; menu create/update responses are `MenuSummary`; reorder returns the item array; media list `skip`/`limit` (max 200, **no total**); category delete `reassign_to`; tag delete `force`/`merge_into`; update payloads optional and nullable; unpublished posts give 404/403 to non-editors; scheduled time must be in the future (400); menu `location` unique (400 if used).
**Resolved by the new guide:** `pages` is returned; tag update exists; delete responses are typed (to confirm in the new openapi).
**Still ❓:** (a) null-clearing for categories, menus and menu items (posts are documented; test once). (b) The new openapi should confirm the delete schemas and `include_descendants`.

## 5. Remaining 🟡 (all optional)
| # | Issue | Suggested fix |
|---|---|---|
| 15b | Menus: no drag-and-drop; editing an item's parent appends it last | `@dnd-kit` (new dependency) |
| 17 | Filter dropdowns load all categories and tags once (no backend pagination) | Searchable picker if needed |
| CI | `check:api` is manual: no `.github/workflows` and CI can't reach a backend | Run against the deployed backend before releases, or commit an `openapi.json` snapshot |
| G3 | Backend gap 3 (no category tree / `?root=true`) still open; pickers build the tree client-side (already done) | None needed |
| G7 | Backend gap 7: view counting only via `GET …/slug` (`track_view`); `POST /cms/posts/{id}/view` is the backend's next item | Only matters for the public site |
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
1. Merge `cms-b1-b2-post-delete-tag-rename`.
2. Send the new `openapi.json` → regenerate types → **B3–B5**.
3. Manual test pass against the live backend (clear-field cases, scheduled → published, post delete with a menu link, tag rename, category delete with a menu link).
4. Public site (if in scope), then the optional items in §5.