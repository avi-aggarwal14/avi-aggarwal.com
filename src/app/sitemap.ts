import type { MetadataRoute } from 'next';
import { BUILD_TIME } from '@/lib/build-time';
import { SITE_URL } from '@/lib/site-url';

/** The homepage only; lastModified is the build time (the same value as ProfilePage.dateModified). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, lastModified: new Date(BUILD_TIME), changeFrequency: 'monthly', priority: 1 }];
}
