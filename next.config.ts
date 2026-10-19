import type { NextConfig } from 'next';
import { siteContent } from './src/content/site-content.ts';

/** Canonical origin (same rule as src/lib/site-url.ts); the host redirect below sends the Vercel preview host here. */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || siteContent.site.url).replace(/\/+$/, '');
const LEGACY_HOST = 'aviaggarwal.vercel.app';

const nextConfig: NextConfig = {
  // PostHog's API paths end in a slash (/i/v0/e/); without this, Next would 308 them to the slash-less
  // path before the /relay rewrite runs. The site's own pages are unaffected (canonical tags stay as is).
  skipTrailingSlashRedirect: true,
  env: {
    // one timestamp per build: the sitemap's lastModified and ProfilePage.dateModified
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/index.md', destination: '/api/md/index' },
        { source: '/blog/:slug.md', destination: '/api/md/blog/:slug' },
        // first-party proxy for PostHog (EU cloud), used by src/components/shell/PostHogAnalytics.tsx
        { source: '/relay/static/:path*', destination: 'https://eu-assets.i.posthog.com/static/:path*' },
        { source: '/relay/array/:path*', destination: 'https://eu-assets.i.posthog.com/array/:path*' },
        { source: '/relay/:path*', destination: 'https://eu.i.posthog.com/:path*' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    const sitemap = '</sitemap.xml>; rel="sitemap"; type="application/xml"';
    return [
      { source: '/', headers: [{ key: 'Link', value: `</index.md>; rel="alternate"; type="text/markdown", ${sitemap}` }] },
      // post pages only: the slug pattern has no dot, so the /blog/<slug>.md twins do not get a header pointing at <slug>.md.md
      { source: '/blog/:slug([a-z0-9-]+)', headers: [{ key: 'Link', value: `</blog/:slug.md>; rel="alternate"; type="text/markdown", ${sitemap}` }] },
    ];
  },
  async redirects() {
    return [
      {
        source: '/meet',
        destination: siteContent.profile.meetRedirect,
        permanent: true, // 308
      },
      {
        // the old Vercel host is one site with the canonical domain: every path moves, permanently (308)
        source: '/:path*',
        has: [{ type: 'host', value: LEGACY_HOST }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
