import type { NextConfig } from 'next';
import { siteContent } from './src/content/site-content.ts';

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
