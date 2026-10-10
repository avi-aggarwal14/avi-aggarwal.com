import { SITE_URL } from '@/lib/site-url';

/** robots.txt with the sitemap on the canonical origin. The Content-Signal line states the AI-use policy (search yes, training no). */
export function GET() {
  const lines = ['User-agent: *', 'Content-Signal: search=yes, ai-train=no, ai-input=yes', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
