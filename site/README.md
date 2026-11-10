# Public site (Astro, server-rendered)

Read-only website for the CMS content. Separate from the admin app: anyone can open it, it never sends a login token and only shows **published** content.

| Piece | Dev URL |
|---|---|
| Backend API | http://localhost:8000 |
| Admin (repo root, `npm run dev`) | http://localhost:5173 |
| Public site (`cd site && npm run dev`) | http://localhost:4321 |

## Run
```bash
cd site
npm install
cp .env.example .env   # set PUBLIC_API_URL, menu locations, site name
npm run dev
```
In the admin set `VITE_PUBLIC_SITE_URL` (default `http://localhost:4321`) so the **View on site** button points here.

## Routes
`/` feed · `/rss.xml` · `/sitemap.xml` · `/robots.txt` · `/posts/:slug` (posts and pages) · `/categories/:slug` (includes subcategories) · `/tags/:slug` · 404. Header / footer menus come from the CMS menus whose `location` equals `PUBLIC_MENU_HEADER` / `PUBLIC_MENU_FOOTER` (`resolved_url`, `null` skipped, `open_in_new_tab` → `target="_blank" rel="noopener noreferrer"`).

## Notes
- `PUBLIC_*` variables are read at **build time** (Astro inlines them): change one, rebuild. On Vercel set them in the project settings before deploying.
- `/sitemap.xml` (published posts, pages, categories, tags), `/rss.xml` (latest 30 posts) and `/robots.txt` are generated from the API; set `PUBLIC_SITE_URL` to the real domain so their links are correct. Submit the sitemap in Google Search Console after deploy.
- Calls are made on the server, so no CORS entry is needed for this site. (Only add its origin to `CORS_ALLOWED_ORIGINS` if you later call the API from the browser.)
- `track_view=false` on server renders, so page loads do not inflate view counts.
- Post HTML is sanitized (`src/lib/html.ts`): scripts, event handlers and `javascript:` links are removed; image URLs are made absolute.
- Pages send `Cache-Control: s-maxage=60`, so behind a CDN scheduled posts appear within ~1 minute. Errors are not cached.
- Deploy: `npm run build` then `node dist/server/entry.mjs`; on Vercel swap the adapter for `@astrojs/vercel`. Set `PUBLIC_API_URL` to the deployed backend.
- Media must be on persistent storage, otherwise images vanish on backend redeploy.
- Any other app (mobile, dashboard) can use the same API calls listed in `src/lib/api.ts`.
