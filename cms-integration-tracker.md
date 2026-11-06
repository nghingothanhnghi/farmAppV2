# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows)
Last update: 2026-11-06 — items 1–4 **merged to main** (PR #14). Items 5–7 are on branch **`cms-integration-items-5-7`** (type-check clean, **not merged, not tested in a browser**).
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🟡 partial / needs fix · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → optional context (`postContext`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()` (`utils/mediaValidation.ts`). Models in `models/interfaces/Post.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.

## 1. Done ✅
| Area | Evidence |
|---|---|
| Bearer auth + 401 handling (login request excluded) | `api/client.ts` |
| Post CRUD, publish / archive / schedule endpoints | `services/postService.ts`, `hooks/usePost.ts` |
| Post form: title, auto-slug, excerpt, content, category, tags, status, type, featured flag, featured image | `PostForm.tsx` |
| `scheduled_at` sent as UTC ISO; required + future (Yup); dropped unless status=scheduled | `formatters.ts`, `postValidation.ts`, `usePost.ts` |
| Featured image uploaded via `/cms/media/upload`, id sent | Create/Edit pages |
| `tag_ids` full replacement list | Edit page |
| Categories CRUD with `parent_id`; Tags list/create/delete; Media upload/list/alt edit/delete/copy URL | CMS pages |
| Absolute media URLs; editor inserts absolute URL | `utils/getImageUrl.ts`, `MediaPickerModal` |
| Routes + sidebar entry | `App.tsx`, `config/menu.ts` |
| **#1 Post list pagination** (page 20, pager, delete refetch) | merged, PR #14 |
| **#2 422 / error handling** (`getApiErrorMessage`, `getApiFieldErrors`) | merged, PR #14 |
| **#3 Role/ownership UI gating** (`useCmsPermissions`) | merged, PR #14 |
| **#4 Delete recovery** (tag merge/force on 409; category `reassign_to` + counts) | merged, PR #14 |

Merged items 1–4 still deserve a manual pass against the live backend (see previous test hints: >20 posts paging; empty-title/scheduled 422; user/moderator/admin views; delete tag in use; delete category with children).

## 2. On branch `cms-integration-items-5-7` 🔧
| # | What changed | How to verify |
|---|---|---|
| 5 | **Editor images.** `allowBase64` off. Pasting or dropping image files into the editor uploads them via `/cms/media/upload` and inserts the absolute URL at the caret/drop point ("Uploading image…" shown meanwhile). Text/HTML paste unchanged. ⚠ `RichTextEditor` is shared: `ProductInfoForm` also gets this, so product descriptions now upload to the CMS media library instead of embedding base64. | Paste a screenshot; drag a PNG in; try an `.svg` (error alert); check saved HTML has no `data:` |
| 6 | **Types synced to guide §3.** Nullable `author`/`category`/`featured_image`/`excerpt`/`published_at`/meta; `CmsMedia` + `CmsCategory` extra fields; `published_at` removed from create/update payloads (server-stamped); `PostQuery` gains `is_featured`, `sort`, `order` (typed); `getBySlug(slug, trackView)` sends `track_view`. Added `openapi-typescript` + `npm run gen:api` (**not run**: needs the backend up at `localhost:8000`; it writes `src/api/schema.d.ts`). Manual types remain; swapping to generated types and a CI diff check is still open. | `npm run gen:api` with backend running, review diff vs `Post.ts` |
| 7 | **Media pre-validation.** `utils/mediaValidation.ts`: allowed extensions (no `.svg`), 20 MB (override `VITE_CMS_MAX_MEDIA_SIZE_MB`), empty file. Used by the media upload modal, editor image picker, featured-image input, and editor paste/drop. `accept` is now the explicit image list. The library stays image-only on purpose (it renders `<img>`); pdf/mp4/webm are allowed by the validator when `imagesOnly` is off but no UI offers them yet. | Upload `.svg`, a 25 MB file, a `.pdf` → inline error, no request sent |

## 3. Remaining partial / needs fix 🟡
| # | Issue | Guide ref | Suggested fix |
|---|---|---|---|
| 6b | Use generated `schema.d.ts` types and a CI diff check | §3, §12 | Run `gen:api`, migrate models, add CI step |
| 8 | Media alt PATCH sent as multipart; guide says form-encoded. Likely works. | §7 | `URLSearchParams` |
| 9 | Edit sends full form incl. unchanged `slug`; no slug-change warning; no `updated_at` conflict check. ❓ Verify backend doesn't suffix `-2` on a post's own slug. | §7 | Send only changed fields |
| 10 | Post list has no filters/search/sort UI (`PostQuery` now typed for them). | §6 | Toolbar |
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
Merge + test 5–7 → 8, 11, 12 (small) → 9, 10 → Menus → public site (if in scope).
