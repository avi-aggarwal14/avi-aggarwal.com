import { siteContent } from '@/content/site-content';
import { publishedPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site-url';

/** llms.txt: the booking and follow lines, primary markdown alternate, the writing list (markdown twins), discovery links and the use policy. */
export function GET() {
  const { site, profile, cta, follow, socials } = siteContent;
  const summary = site.description.replace(new RegExp(`^${profile.name} is (a |an |the )?`), '');
  // the follow lines point at the profiles (the intent URL is for buttons, not for a text file)
  const x = socials.find((s) => s.id === 'social-x');
  const instagram = socials.find((s) => s.id === 'social-instagram');
  const lines = [
    `# ${site.title}`,
    '',
    `> ${summary.charAt(0).toUpperCase()}${summary.slice(1)}`,
    '',
    `${cta.label}: ${SITE_URL}${cta.href}`,
    ...(x ? [`${follow.x.label}: ${x.link}`] : []),
    ...(instagram ? [`${instagram.label}: ${instagram.link}`] : []),
    '',
    '## Primary Markdown',
    '',
    `- [Homepage](${SITE_URL}/index.md)`,
    '',
    ...(publishedPosts().length ? ['## Writing', '', ...publishedPosts().map((post) => `- [${post.title}](${SITE_URL}${post.link}.md): ${post.description}`), ''] : []),
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
