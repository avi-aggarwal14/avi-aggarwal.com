import type { MetadataRoute } from 'next';
import { siteContent } from '@/content/site-content';

/** /manifest.webmanifest: the site as an installable entry, same name, icons and colours as the head. */
export default function manifest(): MetadataRoute.Manifest {
  const { site, profile } = siteContent;
  return {
    name: profile.name,
    short_name: profile.name,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: site.themeColorLight,
    theme_color: site.themeColorLight,
    icons: [
      { src: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { src: profile.favicon, sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
