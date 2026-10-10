import { siteContent } from '@/content/site-content';
import { SITE_URL } from '@/lib/site-url';

/** llms.txt: primary markdown alternate, discovery links and the use policy. */
export function GET() {
  const { site, profile } = siteContent;
  const summary = site.description.replace(new RegExp(`^${profile.name} is (a |an |the )?`), '');
  const lines = [
    `# ${site.title}`,
    '',
    `> ${summary.charAt(0).toUpperCase()}${summary.slice(1)}`,
    '',
    '## Primary Markdown',
    '',
    `- [Homepage](${SITE_URL}/index.md)`,
    '',
    '## Discovery',
    '',
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    `- [Robots](${SITE_URL}/robots.txt)`,
    '',
    '## Use Policy',
    '',
    'Search is allowed. AI input and use are allowed. AI training is not allowed, per the Content-Signal in robots.txt.',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
