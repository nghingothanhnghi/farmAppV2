# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows) and `app/cms/schemas/menu.py`
Last update: 2026-11-06 — items 1–7 and the **menus builder** are **merged to main** (PR #17). Menu schema alignment is on branch **`cms-menu-schema-alignment`** (type-check clean, not merged). Nothing has been tested in a browser or against the live backend.
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🟡 partial / needs fix · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`); form modals that must stay open on failure catch and show the message inline (menus). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()`. Models in `models/interfaces/*.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.

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
| **Menus**: list/create/edit/delete (admin), builder (item tree, add/edit/delete, move up/down/indent/outdent via full flat `reorder`), item targets custom/category/post, `resolved_url` hidden-note, routes `/dashboard/cms/menus[/:id]`, sidebar en/vi | PR #17 |

## 2. Menu schema verification (vs `app/cms/schemas/menu.py`)
| Backend | Frontend | Status |
|---|---|---|
| `MenuItemBase`: label 1..150, target_type (default custom), url ≤500, target_id, parent_id, order (default 0), open_in_new_tab, is_active | `MenuItemInput` / `CmsMenuItem` same fields | ✅ match |
| Validator: custom ⇒ `url` required; category/post ⇒ `target_id` required | Form disables submit until the matching field is set; sends `url: null` / `target_id: null` for the other type | ✅ |
| `MenuItemOut`: + `id`, `menu_id`, `resolved_url`, `children` | `CmsMenuItem` | ✅ |
| `MenuItemUpdate`: all optional, **no validator** | Edit sends the full payload (valid for the create validator too) | ✅ |
| `MenuCreate`: name 1..150, location ≤50, slug optional | `MenuInput` | ✅ |
| `MenuUpdate`: all optional | 🔧 Edit now sends **only changed fields** (avoids re-sending an unchanged `location`/`slug` that the uniqueness check might reject against the menu itself) | 🔧 branch |
| `MenuSummary`: `created_at` required, `updated_at` optional | 🔧 `created_at` now required in the type | 🔧 branch |
| Max lengths (name 150, location 50, label 150, url 500) | 🔧 `MENU_LIMITS` enforced via `maxLength` (`FormInput` got an optional `maxLength` prop) | 🔧 branch |
| Reorder: `{items:[{id,parent_id,order}]}` | `MenuReorderEntry[]`, `order` 0-based sibling index | ✅ |
| 422 for validator failures (`loc` has no field name) | `getApiErrorMessage` shows the message ("Value error, url is required…") | ✅ |

Still ❓ (service code not seen): (a) does the update service use `exclude_unset` or `exclude_none`? With `exclude_none`, "edit item → No parent" (`parent_id: null`) and clearing a menu `location` would silently do nothing; the arrow buttons use `reorder` and are unaffected. **Test both once.** (b) Response shape of menu create/update/delete and of the enum file `MenuItemTargetType` (frontend assumes `custom|category|post` from the guide).

## 3. Remaining partial / needs fix 🟡
| # | Issue | Guide ref | Suggested fix |
|---|---|---|---|
| 6b | Use generated `schema.d.ts` types + CI diff check | §3, §12 | Run `gen:api`, migrate models, add CI step |
| 8 | Media alt PATCH sent as multipart; guide says form-encoded. Likely works. | §7 | `URLSearchParams` |
| 9 | Post edit sends full form incl. unchanged `slug`; no slug-change warning; no `updated_at` conflict check. ❓ Backend may suffix `-2` on a post's own slug (same idea as the menu fix). | §7 | Send only changed fields |
| 10 | Post list has no filters/search/sort UI (`PostQuery` is typed for them). | §6 | Toolbar |
| 11 | Category form has no `description`. | §3 | Add field |
| 12 | `ScheduleModal` has no client-side "future" check (backend 400 is shown). | §7 | Add check |
| 13 | Client limits stricter than backend (title 200 vs 255, excerpt 300 vs 500). Harmless. | §3 | Optional |
| 14 | Deleting a post doesn't warn about menu items referencing it (item silently gets `resolved_url: null`). | §11 | Backend 409 like categories |
| 15 | Menus: no drag-and-drop (buttons chosen); editing an item's parent appends it last; post picker lists first 100 published posts only | §7 | `@dnd-kit` later; searchable picker |

## 4. Not started ⬜
| Item | Notes |
|---|---|
| Public site: feed, post/page by slug (`track_view=false` on SSR), category/tag pages via `/slug/{slug}`, **menu renderer** (`menuService.getByLocation` exists; use `resolved_url`, skip `null`, `target="_blank" rel="noopener"`), routes `/posts/:slug` + `/categories/:slug`, 404 page | Repo is admin-only today. **Decide whether the public site lives in this app** |

## 5. Environment / backend ❓
- Production frontend origin in `CORS_ALLOWED_ORIGINS`; `VITE_API_BASE_URL` set on Vercel.
- Persistent media storage (Render disk or S3/R2) — otherwise uploads vanish on redeploy.
- Policy: any logged-in user can create **and publish** posts (guide §11 #9).

## Suggested next
Merge schema alignment → 8, 11, 12 (small) → 9, 10 → public site (if in scope).
