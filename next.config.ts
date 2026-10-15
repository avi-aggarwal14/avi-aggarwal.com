import type { NextConfig } from 'next';
import { siteContent } from './src/content/site-content.ts';

/** Canonical origin (same rule as src/lib/site-url.ts); the host redirect below sends the Vercel preview host here. */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || siteContent.site.url).replace(/\/+$/, '');
const LEGACY_HOST = 'aviaggarwal.vercel.app';

const nextConfig: NextConfig = {
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
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    const sitemap = '</sitemap.xml>; rel="sitemap"; type="application/xml"';
    return [
      { source: '/', headers: [{ key: 'Link', value: `</index.md>; rel="alternate"; type="text/markdown", ${sitemap}` }] },
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
