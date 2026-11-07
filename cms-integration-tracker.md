# CMS Frontend ↔ Backend Integration Tracker

Audited: 2026-11-06 · Repo `nghingothanhnghi/farmAppV2` · Against `FRONTEND_GUIDE.md` (§12 checklist + flows) and `app/cms/schemas/menu.py`
Last update: 2026-11-07 — items 1–7, menus builder, menu schema alignment and **items 8, 11, 12** are **merged to main**. **Item 9** is on branch **`cms-item-9-post-edit`** (commit `6da2570`; type-check clean for all touched files; **not merged**). Nothing has been tested in a browser or against the live backend.
Legend: ✅ done · 🔧 on branch, needs merge + manual test · 🟡 partial / needs fix · ⬜ not started · ❓ can't verify from frontend

## Pattern in use (keep new work consistent)
`services/xService.ts` (axios `apiClient`) → `hooks/useX.ts` (`{ data, loading, error, actions }`) → `components/CMS/Cms*Page.tsx` + `components/CMS/components/*Modal`. Errors: `setAlert({type:'error', message: getApiErrorMessage(err, "fallback")})` (`utils/apiError.ts`); form modals that must stay open on failure catch (the page already alerted, or show the message inline as menus do). Permissions: `useCmsPermissions()`. Upload checks: `validateMediaFile()`. Edits are partial: build the payload with a diff helper (`buildPostUpdate`, menu form) rather than sending the whole form. Models in `models/interfaces/*.ts` with `Cms*` prefix. Routes under `/dashboard/cms/*`, lazy-loaded, wrapped in `PrivateRoute`.
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
| Menus: list/create/edit/delete (admin), builder (item tree, add/edit/delete, move up/down/indent/outdent via full flat `reorder`), targets custom/category/post, hidden-target note | PR #17 |
| Menu schema alignment: max lengths, `created_at` required, menu edit sends only changed fields | merged |
| #8 Media alt PATCH form-encoded (explicit header) · #11 category description · #12 schedule modal future check (+ no unhandled rejections in category/schedule modals) | merged |

Everything above still deserves a manual pass against the live backend.

## 2. On branch `cms-item-9-post-edit` 🔧
| Piece | What changed | How to verify |
|---|---|---|
| Changed fields only | `utils/postDiff.ts` `buildPostUpdate(original, form)` returns just the changed fields: `null` ≡ `""` for excerpt/meta (cleared text is sent as explicit `null`), `tag_ids` compared as a set and sent as the full list, `scheduled_at` compared as instants (no `Z` vs `+00:00` false positives), category/image cleared → `null`. Unit-checked with 10 cases (untouched form → `{}`). Benefits: unchanged `slug` can't collide with the post itself, an unchanged `scheduled_at` that has already passed (go-live job lag) no longer causes a 400, and stale forms don't overwrite unrelated fields edited elsewhere | Open a post, change only the title → request body has only `title`; open and save untouched → "No changes to save." |
| Partial-update bug fixed | `normalizePostPayload` used to strip `scheduled_at` whenever `status` wasn't in the payload, which would have dropped a reschedule of an already-scheduled post. Partial updates now keep it; create is unchanged | Reschedule a scheduled post without touching status |
| Slug warning | In edit mode, changing the slug shows an amber note: public URL changes, **no redirects**, server may add `-2`. After saving, if the server suffixed the slug, a warning alert shows the final slug | Edit a published post's slug |
| Conflict check | Before saving, the page re-fetches the post and compares `updated_at` with the value at load time. If different: dialog "changed by someone else", **Save anyway** / Cancel. If the check itself fails, the save proceeds and reports its own error | Open a post in two tabs, save in one, save in the other |
| Small fix | Clearing the category via the select sent `undefined` (ignored); now `null` | Clear a post's category |

Notes: the post-content comparison is string-based, so if TipTap re-serialises HTML differently from the stored version `content` may be sent even when the user didn't edit it (harmless; the server sanitises). Pre-existing, unrelated: `tsc` reports 12 unused-import errors in `layout/DesktopSidebarToggleButton.tsx` on `main` (not part of this work) — worth a quick cleanup.

## 3. Menu schema verification (vs `app/cms/schemas/menu.py`) — all ✅ merged
Item and menu fields, validators (custom ⇒ url; category/post ⇒ target_id), reorder payload, max lengths, partial menu update, 422 messages all match.
Still ❓ (service code not seen): (a) does the update service use `exclude_unset` or `exclude_none`? With `exclude_none`, "edit item → No parent" (`parent_id: null`) and clearing a menu `location` or a post's `excerpt`/category/meta (explicit `null`s) would silently do nothing; the arrow buttons use `reorder` and are unaffected. **Test clearing each once.** (b) Response shapes of menu create/update/delete, `MenuItemTargetType` enum, category `description` field (assumed `Optional[str]`).

## 4. Remaining partial / needs fix 🟡
| # | Issue | Guide ref | Suggested fix |
|---|---|---|---|
| 6b | Use generated `schema.d.ts` types + CI diff check | §3, §12 | Run `gen:api` (backend up), migrate models, add CI step |
| 10 | Post list has no filters/search/sort UI (`PostQuery` is typed for them). | §6 | Toolbar |
| 13 | Client limits stricter than backend (title 200 vs 255, excerpt 300 vs 500). Harmless. | §3 | Optional |
| 14 | Deleting a post doesn't warn about menu items referencing it (item silently gets `resolved_url: null`). | §11 | Backend 409 like categories |
| 15 | Menus: no drag-and-drop (buttons chosen); editing an item's parent appends it last; post picker lists first 100 published posts only | §7 | `@dnd-kit` later; searchable picker |
| 16 | Other full-form sends: category and tag edits send all fields (only name/slug/parent/description, low risk); same slug-self-collision question as posts | §7 | Apply the same diff approach if the backend rejects |

## 5. Not started ⬜
| Item | Notes |
|---|---|
| Public site: feed, post/page by slug (`track_view=false` on SSR), category/tag pages via `/slug/{slug}`, **menu renderer** (`menuService.getByLocation` exists; use `resolved_url`, skip `null`, `target="_blank" rel="noopener"`), routes `/posts/:slug` + `/categories/:slug`, 404 page | Repo is admin-only today. **Decide whether the public site lives in this app** |

## 6. Environment / backend ❓
- Production frontend origin in `CORS_ALLOWED_ORIGINS`; `VITE_API_BASE_URL` set on Vercel.
- Persistent media storage (Render disk or S3/R2) — otherwise uploads vanish on redeploy.
- Policy: any logged-in user can create **and publish** posts (guide §11 #9).

## Suggested next
Merge item 9 → 10 (post list filters/search/sort) → 6b (generated types, needs backend running) → public site (if in scope).