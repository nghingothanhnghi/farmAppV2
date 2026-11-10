import type { APIRoute } from 'astro';
import { getFeed, siteOrigin, xmlEscape, SITE_NAME } from '../lib/api';

export const GET: APIRoute = async ({ url }) => {
  const origin = siteOrigin(url);
  const feed = await getFeed({ page: 1, pageSize: 30 });
  const posts = feed?.results ?? [];

  const items = posts
    .map((p) => {
      const link = `${origin}/posts/${p.slug}`;
      return `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      ${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ''}
      ${p.excerpt ? `<description>${xmlEscape(p.excerpt)}</description>` : ''}
    </item>`;
    })
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(SITE_NAME)}</title>
    <link>${xmlEscape(origin)}</link>
    <description>${xmlEscape(`Latest posts from ${SITE_NAME}`)}</description>
${items}
  </channel>
</rss>
`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  );
};
