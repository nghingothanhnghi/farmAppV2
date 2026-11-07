# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows) and `app/cms/schemas/menu.py`
Last update: 2026-11-07 — items 1–7, the **menus builder** and the **menu schema alignment** are **merged to main**. Items 8, 11 and 12 are on branch **`cms-items-8-11-12`** (commit `8323688`; type-check clean; **not merged**). Nothing has been tested in a browser or against the live backend.
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🟡 partial / needs fix · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`); form modals that must stay open on failure catch (the page already alerted, or show the message inline as menus do). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()`. Models in `models/interfaces/*.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.
⚠ `apiClient` defaults `Content-Type: application/json` and axios will not override a default: any non-JSON body (form-encoded, `URLSearchParams`) must set its header explicitly (verified with a local test).

## 1. Done ✅ (merged)
| Area | Evidence |
|---|---|
| Bearer auth + 401 handling | `api/client.ts` |
| Post CRUD, publish / archive / schedule; post form incl. tags, category, featured image, scheduling (UTC ISO, future-only) | `postService`, `usePost`, `PostForm` |
| Categories CRUD; Tags; Media upload/list/alt/delete | CMS pages |
| Absolute media URLs | `utils/getImageUrl.ts` |
| #1 Post list pagination · #2 422/error handling · #3 role/ownership gating · #4 delete recovery | PR #14 |
| #5 Editor: no base64; paste/drop images upload (also affects `ProductInfoForm`) | `RichTextEditor.tsx` |
| #6 Types synced to guide §3; `npm run gen:api` script (not run) | `models/interfaces/Post.ts` |
| #7 Media pre-validation (ext, no svg, 20 MB) | `utils/mediaValidation.ts` |
| Menus: list/create/edit/delete (admin), builder (item tree, add/edit/delete, move up/down/indent/outdent via full flat `reorder`), targets custom/category/post, hidden-target note, routes `/dashboard/cms/menus[/:id]`, sidebar en/vi | PR #17 |
| Menu schema alignment: max lengths, `created_at` required, menu edit sends only changed fields | merged |

Everything above still deserves a manual pass against the live backend.

## 2. On branch `cms-items-8-11-12` 🔧
| # | What changed | How to verify |
|---|---|---|
| 8 | **Media alt-text PATCH is form-encoded** (`application/x-www-form-urlencoded`) via `URLSearchParams` with an **explicit header**. Without it the request would have gone out as `application/json` with a form body (axios keeps the instance default), which FastAPI `Form()` rejects. Confirmed with a local axios test. | Edit a media item's alt text; check the request's Content-Type and that the saved alt text shows |
| 11 | **Category description.** `CategoryInput.description`; new "Description (optional)" textarea in the category form; empty value sends `null` so an existing description can be cleared. | Create a category with a description; edit it; clear it |
| 12 | **Schedule modal future check.** `min` = now on the picker, inline "Choose a time in the future." and the Schedule button disabled for past times (backend 400 remains the fallback). Also: Category and Schedule modals now catch the page's rethrown error (alert already shown, modal stays open) instead of leaking an unhandled promise rejection. | Pick a past time → blocked; pick a future time → scheduled |

❓ Category `description`: backend schema not seen (assumed `Optional[str]` on create/update, as in the guide's `Category` type).

## 3. Menu schema verification (vs `app/cms/schemas/menu.py`) — all ✅ merged
Item and menu fields, validators (custom ⇒ url; category/post ⇒ target_id), reorder payload, max lengths, partial menu update, 422 messages all match.
Still ❓ (service code not seen): (a) does the update service use `exclude_unset` or `exclude_none`? With `exclude_none`, "edit item → No parent" (`parent_id: null`) and clearing a menu `location` would silently do nothing; the arrow buttons use `reorder` and are unaffected. **Test both once.** (b) Response shapes of menu create/update/delete and the `MenuItemTargetType` enum file (assumes `custom|category|post`).

## 4. Remaining partial / needs fix 🟡
| # | Issue | Guide ref | Suggested fix |
|---|---|---|---|
| 6b | Use generated `schema.d.ts` types + CI diff check | §3, §12 | Run `gen:api` (backend up), migrate models, add CI step |
| 9 | Post edit sends full form incl. unchanged `slug`; no slug-change warning; no `updated_at` conflict check. ❓ Backend may suffix `-2` on a post's own slug (same idea as the menu fix). | §7 | Send only changed fields |
| 10 | Post list has no filters/search/sort UI (`PostQuery` is typed for them). | §6 | Toolbar |
| 13 | Client limits stricter than backend (title 200 vs 255, excerpt 300 vs 500). Harmless. | §3 | Optional |
| 14 | Deleting a post doesn't warn about menu items referencing it (item silently gets `resolved_url: null`). | §11 | Backend 409 like categories |
| 15 | Menus: no drag-and-drop (buttons chosen); editing an item's parent appends it last; post picker lists first 100 published posts only | §7 | `@dnd-kit` later; searchable picker |

(8, 11, 12 moved to section 2.)

## 5. Not started ⬜
| Item | Notes |
|---|---|
| Public site: feed, post/page by slug (`track_view=false` on SSR), category/tag pages via `/slug/{slug}`, **menu renderer** (`menuService.getByLocation` exists; use `resolved_url`, skip `null`, `target="_blank" rel="noopener"`), routes `/posts/:slug` + `/categories/:slug`, 404 page | Repo is admin-only today. **Decide whether the public site lives in this app** |

## 6. Environment / backend ❓
- Production frontend origin in `CORS_ALLOWED_ORIGINS`; `VITE_API_BASE_URL` set on Vercel.
- Persistent media storage (Render disk or S3/R2) — otherwise uploads vanish on redeploy.
- Policy: any logged-in user can create **and publish** posts (guide §11 #9).

## Suggested next
Merge 8/11/12 → 9 (post edit: changed fields only + slug warning), 10 (filters) → 6b (generated types) → public site (if in scope).