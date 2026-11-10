import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Server-rendered so new / scheduled posts appear without a rebuild.
// Pages send Cache-Control (s-maxage=60), so a CDN refreshes them at most once a minute.
// On Vercel, swap the adapter for @astrojs/vercel.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { port: 4321 },
});
