import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { siteContent } from '@/content/site-content';
import { BUILD_TIME } from '@/lib/build-time';
import { SITE_URL } from '@/lib/site-url';

const { site, profile, socials, work, projects, locations, seo } = siteContent;

/** BCP 47 form of the content locale ("en_GB" -> "en-GB"): <html lang>, inLanguage. */
export const LANG = site.locale.replace('_', '-');

/** Exactly this string is what the robots meta tag carries. */
export const ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

const abs = (p: string) => (/^https?:/.test(p) ? p : `${SITE_URL}${p}`);
const fragmentId = (name: string) => `${SITE_URL}/#${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
const ID = { website: `${SITE_URL}/#website`, page: `${SITE_URL}/#profilepage`, person: `${SITE_URL}/#person` };

/** Every social profile with an absolute URL, in content order (the relative /meet route is left out): rel="me" links and sameAs. */
export function profileUrls(): string[] {
  return socials.filter((s) => /^https?:/.test(s.link)).map((s) => s.link);
}

/** Width and height from a PNG's IHDR chunk, read from public/ at build time. */
function pngSize(publicPath: string): { width: number; height: number } {
  const buf = fs.readFileSync(path.join(process.cwd(), 'public', publicPath));
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Open Graph (profile) and Twitter card metadata; the title is the only part that differs per route. */
export function socialMetadata(title: string): Pick<Metadata, 'openGraph' | 'twitter'> {
  const [firstName, ...rest] = profile.name.split(' ');
  const image = { url: '/api/og', width: 1200, height: 630, alt: site.ogImageAlt };
  return {
    openGraph: {
      type: 'profile',
      firstName,
      lastName: rest.join(' '),
      username: site.twitterCreator.replace(/^@/, ''),
      title,
      description: site.description,
      url: SITE_URL,
      siteName: site.title,
      locale: site.locale,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      site: site.twitterCreator,
      creator: site.twitterCreator,
      title,
      description: site.description,
      images: [image],
    },
  };
}

function workEntry(id: string) {
  const entry = work.find((w) => w.id === id && !w.wip);
  if (!entry) throw new Error(`seo: work entry "${id}" not found`);
  return entry;
}

/**
 * The homepage's single JSON-LD graph: WebSite, ProfilePage, Person, the employer Organization and the
 * open-source SoftwareSourceCode blocks. Facts come from content.seo; nothing personal beyond the public profile
 * (no birth date, age, school, address, email or phone).
 */
export function homepageJsonLd(): { '@context': string; '@graph': Record<string, unknown>[] } {
  const employer = workEntry(seo.worksFor);
  const employerId = fragmentId(employer.company);
  const home = locations[seo.homeLocationId];
  const [givenName, ...family] = profile.name.split(' ');

  const website = {
    '@type': 'WebSite',
    '@id': ID.website,
    url: SITE_URL,
    name: site.title,
    inLanguage: LANG,
    publisher: { '@id': ID.person },
    about: { '@id': ID.person },
  };
  const page = {
    '@type': 'ProfilePage',
    '@id': ID.page,
    url: SITE_URL,
    name: site.homeTitle,
    isPartOf: { '@id': ID.website },
    mainEntity: { '@id': ID.person },
    about: { '@id': ID.person },
    dateCreated: seo.profilePageCreated,
    dateModified: BUILD_TIME,
    inLanguage: LANG,
  };
  const person = {
    '@type': 'Person',
    '@id': ID.person,
    name: profile.name,
    givenName,
    familyName: family.join(' '),
    url: SITE_URL,
    image: { '@type': 'ImageObject', url: abs(profile.avatar), ...pngSize(profile.avatar) },
    description: site.description,
    jobTitle: employer.title,
    worksFor: { '@id': employerId },
    affiliation: seo.affiliations.map((id) => {
      const w = workEntry(id);
      return { '@type': 'Organization', name: w.company, ...(w.link ? { url: w.link } : {}) };
    }),
    homeLocation: { '@type': 'Place', name: `${home.city}, ${home.country}` },
    knowsAbout: seo.knowsAbout,
    sameAs: [...profileUrls(), ...seo.extraSameAs],
  };
  const organization = {
    '@type': 'Organization',
    '@id': employerId,
    name: employer.company,
    url: employer.link,
    logo: abs(employer.logo),
    founder: { '@id': ID.person },
  };
  const sourceCode = seo.sourceCode.map((s) => {
    const p = projects.find((p) => p.id === s.projectId && !p.hide);
    const repo = p?.links.find((l) => l.url.startsWith('https://github.com/'));
    if (!p || !repo) throw new Error(`seo.sourceCode: project "${s.projectId}" needs a GitHub link`);
    return {
      '@type': 'SoftwareSourceCode',
      '@id': fragmentId(p.name),
      name: p.name,
      description: p.description,
      codeRepository: repo.url,
      url: p.link,
      programmingLanguage: s.programmingLanguage,
      license: s.license,
      author: { '@id': ID.person },
    };
  });
  return { '@context': 'https://schema.org', '@graph': [website, page, person, organization, ...sourceCode] };
}

/** The graph serialised for an inline script ("<" escaped so the JSON can never close the tag). */
export function jsonLdHtml(): string {
  return JSON.stringify(homepageJsonLd()).replace(/</g, '\\u003c');
}
