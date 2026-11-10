import type { APIRoute } from 'astro';
import { getAllPublished, getCategories, getTags, siteOrigin, xmlEscape } from '../lib/api';

export const GET: APIRoute = async ({ url }) => {
  const origin = siteOrigin(url);
  const [posts, categories, tags] = await Promise.all([getAllPublished(), getCategories(), getTags()]);

  const entry = (path: string, lastmod?: string | null) =>
    `  <url><loc>${xmlEscape(origin + path)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}</url>`;

  const body = [
    entry('/'),
    ...posts.map((p) => entry(`/posts/${p.slug}`, p.published_at ?? p.created_at)),
    ...categories.map((c) => entry(`/categories/${c.slug}`, c.updated_at ?? c.created_at)),
    ...tags.map((t) => entry(`/tags/${t.slug}`, t.created_at)),
  ].join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  );
};
