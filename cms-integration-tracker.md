# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` @ `97446d9` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows)
Last update: 2026-11-06 — items 1–4 are on branch **`cms-integration-items-1-3`** (commits `877bb65`, `ec5244c`), type-check clean. **Not merged yet; needs manual testing.**
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🟡 partial / needs fix · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → optional context (`postContext`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`). Permissions: `useCmsPermissions()`. Models in `models/interfaces/Post.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.

## 1. Done ✅
| Area | Evidence |
|---|---|
| Bearer auth + 401 handling (login request excluded) | `api/client.ts` |
| Post CRUD, publish / archive / schedule endpoints | `services/postService.ts`, `hooks/usePost.ts` |
| Post form: title, auto-slug, excerpt, content, category, tags, status, type, featured flag, featured image | `PostForm.tsx` |
| `scheduled_at` sent as UTC ISO; required + must be future (Yup); dropped unless status=scheduled | `formatters.ts`, `postValidation.ts`, `usePost.ts` |
| Featured image uploaded via `/cms/media/upload`, id sent as `featured_image_id` | Create/Edit pages |
| `tag_ids` sent as full replacement list | Edit page |
| Categories CRUD with `parent_id`; Tags list/create/delete | `CmsCategoryManagementPage`, `CmsTagManagementPage` |
| Media: upload, list (`skip`/`limit` + load more), alt edit, delete, copy URL | `CmsMediaManagementPage` |
| Relative media URLs made absolute; editor inserts absolute URL | `utils/getImageUrl.ts`, `MediaPickerModal` |
| Routes + sidebar entry | `App.tsx`, `config/menu.ts` |

## 2. On branch 🔧 (merge, then test)
| # | What changed | How to verify |
|---|---|---|
| 1 | **Post list pagination.** Fetches `{page, page_size: 20}`; Previous/Next pager under grid; AG Grid client paging off; delete refetches (steps back a page if last row). `PostGrid` early return moved below its hooks. | >20 posts; page through; delete the only row on last page |
| 2 | **422 handling.** `utils/apiError.ts`: `getApiErrorMessage`, `getApiFieldErrors`. Used by all CMS pages/hooks and `MediaPickerModal`; Create/Edit feed 422 into form field errors. | Submit post with empty title / scheduled w/o date |
| 3 | **Role/ownership gating (UI only).** `hooks/useCmsPermissions.ts` per guide §4: own post or editor for post actions; editor for category/tag create/edit; admin for category/tag delete; own upload or editor for media edit/delete. Roles still from `/roles/my/roles`. | Log in as user / moderator / admin |
| 4 | **Delete recovery flows.** Tags: delete → on 409 the dialog offers *Merge & delete* (`merge_into`) or *Remove from all posts & delete* (`force`); success alert shows counts. Categories: dialog has a "Move sub-categories and posts to" select (default = parent; excludes itself and descendants → `reassign_to`); alert shows moved counts; list is refetched. Result types `CmsCategoryDeleteResult` / `CmsTagDeleteResult`. | Delete a tag used by posts (both options); delete a category with children + posts (default and chosen target); delete a category linked from a menu item (409 message shown as alert) |

Notes: CMS sidebar entry stays visible to everyone (any logged-in user can write/publish own posts). Backend 403 is the real guard. Pager is basic; swap in a shared pagination component if you have one. Not exercised against the live backend.

## 3. Remaining partial / needs fix 🟡
| # | Issue | Guide ref | Suggested fix |
|---|---|---|---|
| 5 | **Editor `allowBase64: true`** conflicts with server sanitizer (`data:` dropped silently); paste/drop not intercepted. | §8.2 | `allowBase64: false`; upload on paste/drop then insert URL |
| 6 | **Types hand-written / out of sync**: nullable `author`, `null` vs `undefined`, missing Media/Category fields, `PostQuery` lacks `is_featured/sort/order`, payloads send `published_at` (not in contract). No `openapi-typescript` / CI diff. | §3, §12 | Generate `schema.d.ts` from `/openapi.json` |
| 7 | Media upload: no pre-validation (ext / 20 MB). `accept="image/*"` allows `.svg` (rejected), excludes pdf/mp4/webm. | §7 | Validate; align `accept` |
| 8 | Media alt PATCH sent as multipart; guide says form-encoded. Likely works. | §7 | `URLSearchParams` |
| 9 | Edit sends full form incl. unchanged `slug`; no slug-change warning; no `updated_at` conflict check. ❓ Verify backend doesn't suffix `-2` on a post's own slug. | §7 | Send only changed fields |
| 10 | Post list has no filters/search/sort UI. | §6 | Extend `PostQuery` + toolbar |
| 11 | Category form has no `description`. | §3 | Add field |
| 12 | `ScheduleModal` has no client-side "future" check (backend 400 is shown). | §7 | Add check |
| 13 | Client limits stricter than backend (title 200 vs 255, excerpt 300 vs 500). Harmless. | §3 | Optional |

## 4. Not started ⬜
| Item | Notes |
|---|---|
| Menus: service, hook, builder page, item CRUD, drag-drop `reorder`, locations | `GET /cms/menus` returns summaries only; load items via `/cms/menus/{id}?active_only=false` |
| Public site: feed, post/page by slug (`track_view=false` on SSR), category/tag pages via `/slug/{slug}`, menu renderer using `resolved_url`, routes `/posts/:slug` + `/categories/:slug`, 404 page | Repo is admin-only today. **Decide whether the public site lives in this app** |

## 5. Environment / backend ❓
- Production frontend origin in `CORS_ALLOWED_ORIGINS`; `VITE_API_BASE_URL` set on Vercel.
- Persistent media storage (Render disk or S3/R2) — otherwise uploads vanish on redeploy.
- Policy: any logged-in user can create **and publish** posts (guide §11 #9).

## Suggested next
5 → 6 → 7–12, then Menus, then public site (if in scope).
