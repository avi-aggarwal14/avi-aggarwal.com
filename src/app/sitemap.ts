import type { MetadataRoute } from 'next';
import { postDateTime, publishedPosts, readPostMetaSync } from '@/lib/blog';
import { BUILD_TIME } from '@/lib/build-time';
import { SITE_URL } from '@/lib/site-url';

/**
 * The homepage (lastModified = build time, the same value as ProfilePage.dateModified), then one entry per post
 * with lastModified = the post's date as the same date-time its BlogPosting datePublished carries.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(BUILD_TIME), changeFrequency: 'monthly', priority: 1 },
    ...publishedPosts().map((post) => {
      const date = readPostMetaSync(post)?.date;
      return {
        url: `${SITE_URL}${post.link}`,
        lastModified: date ? postDateTime(date) : new Date(BUILD_TIME),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      };
    }),
  ];
}
