import { siteContent } from '@/content/site-content';

/** Canonical origin for metadata, JSON-LD, sitemap, robots and the text alternates: NEXT_PUBLIC_SITE_URL, else the content module. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || siteContent.site.url).replace(/\/+$/, '');
