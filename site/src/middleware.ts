import { defineMiddleware } from 'astro:middleware';

// A CDN may cache successful pages for 60 s, so scheduled posts go live within ~1 minute.
// Errors (404/5xx) are never cached.
export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  if (res.status === 200 && !res.headers.has('Cache-Control')) {
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }
  return res;
});
