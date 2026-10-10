import { siteContent } from '@/content/site-content';
import { sectionTitle } from '@/lib/sections';
import { SITE_URL } from '@/lib/site-url';

/** Every social profile with an absolute URL (the relative /meet route is left out). */
function sameAs(): string[] {
  return siteContent.socials.filter((s) => /^https?:/.test(s.link)).map((s) => s.link);
}

/** The JSON-LD blocks emitted on every page: WebSite, Person and SiteNavigationElement. */
export function homepageJsonLd(): object[] {
  const { site, profile, work } = siteContent;
  const employer = work.find((w) => !w.wip);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.title,
      url: SITE_URL,
      description: site.description,
      author: {
        '@type': 'Person',
        name: profile.name,
        url: SITE_URL,
        jobTitle: profile.role,
        ...(employer ? { worksFor: { '@type': 'Organization', name: employer.company } } : {}),
      },
      sameAs: sameAs(),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      url: SITE_URL,
      email: profile.email,
      jobTitle: profile.role,
      ...(employer ? { worksFor: { '@type': 'Organization', name: employer.company, ...(employer.link ? { url: employer.link } : {}) } } : {}),
      sameAs: sameAs(),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SiteNavigationElement',
      name: `${site.title} navigation`,
      hasPart: siteContent.sections.order.map((id, i) => ({
        '@type': 'WebPageElement',
        position: i + 1,
        name: sectionTitle(id),
        url: `${SITE_URL}/#${id}`,
      })),
    },
  ];
}
