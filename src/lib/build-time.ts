/** Build timestamp (ISO), set once in next.config.ts so the sitemap and the JSON-LD graph carry the same value. */
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString();
