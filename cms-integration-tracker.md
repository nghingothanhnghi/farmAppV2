# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` @ `97446d9` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows)
Last update: 2026-11-06 — items 1–3 implemented in patch `cms-items-1-3.patch` (type-checks clean; **not yet applied/pushed to your repo**).
Legend: ✅ done · 🔧 patched, needs apply + manual test · 🟡 partial / needs fix · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → optional context (`postContext`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (new helper in `utils/apiError.ts`). Permissions: `useCmsPermissions()`. Models in `models/interfaces/Post.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.

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

## 2. Patched 🔧 (apply `cms-items-1-3.patch`, then test)
| # | What changed | How to verify |
|---|---|---|
| 1 | **Post list pagination.** Page fetches `{page, page_size: 20}`; pager (Previous/Next, "Page x of y · N posts") under the grid; AG Grid's client paging turned off; page stays mounted while paging; delete refetches (steps back a page if it was the last row). `PostGrid` early return moved below its hooks (was a latent hooks-order bug that paging would have triggered). | Create >20 posts; page through; delete the only row on the last page |
| 2 | **422 handling.** New `utils/apiError.ts`: `getApiErrorMessage(err, fallback)` (string / 422 array → readable text) and `getApiFieldErrors(err)` (→ `{title: msg, scheduled_at: msg}`, `body` stripped). Replaces every `err.response?.data?.detail ?? "…"` in CMS pages, `usePost/useTag/useCategory`, `MediaPickerModal`. Create/Edit now feed 422 into `PostForm` field errors (previously read non-existent `data.errors`). | Submit a post with title <1 char or scheduled w/o date; see the field error + readable alert |
| 3 | **Role/ownership gating (UI only).** New `hooks/useCmsPermissions.ts` mirrors guide §4: post actions enabled for own posts or editors; category/tag "New"/edit/inline-create for editors; category/tag delete for admins; media edit/delete for own uploads or editors (`CmsMedia.uploaded_by_id` added). Removed the noisy `console.log` in `useHasAnyRole`. Roles still come from `/roles/my/roles` (same source as the rest of the app) rather than `/auth/me`. | Log in as plain user / moderator / admin and compare visible actions |

Notes on 3: the CMS sidebar entry stays visible to everyone because any logged-in user may create/publish/own posts per backend rules. Still, `PrivateRoute` doesn't check roles; backend 403 remains the real guard. Pager "Previous/Next" is basic; swap in your shared pagination component if you have one.

## 3. Remaining partial / needs fix 🟡
| # | Issue | Guide ref | Suggested fix |
|---|---|---|---|
| 4 | **Delete flows lack recovery options.** Tags: no `merge_into` / `force`. Categories: no `reassign_to`, no counts; local state is stale for moved children (refetch). | §5, §7 | 409 dialog → Merge / Remove from all (tags), reassign picker (categories), show returned counts |
| 5 | **Editor `allowBase64: true`** conflicts with the server sanitizer (`data:` dropped silently); paste/drop not intercepted. | §8.2 | `allowBase64: false`; upload on paste/drop then insert URL |
| 6 | **Types hand-written / out of sync**: nullable `author`, `null` vs `undefined`, missing Media/Category fields, `PostQuery` lacks `is_featured/sort/order`, payloads send `published_at` (not in contract). No `openapi-typescript` / CI diff. | §3, §12 | Generate `schema.d.ts` from `/openapi.json` |
| 7 | Media upload: no pre-validation (ext / 20 MB). `accept="image/*"` allows `.svg` (rejected) and excludes pdf/mp4/webm. | §7 | Validate; align `accept` |
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
4 → 5 → 6 → 7–12, then Menus, then public site (if in scope).
