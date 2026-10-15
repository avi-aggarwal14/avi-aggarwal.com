import type { Metadata } from 'next';
import { HomepageSections } from '@/components/sections/HomepageSections';
import { getActivityEntries, siteContent } from '@/content/site-content';
import { toEntryRows } from '@/lib/rows';
import { jsonLdHtml, socialMetadata } from '@/lib/seo';

const { site } = siteContent;

/** The homepage title is site.homeTitle verbatim (no template); the social card repeats it. */
export const metadata: Metadata = {
  title: { absolute: site.homeTitle },
  ...socialMetadata(site.homeTitle),
};

export default function Home() {
  const c = siteContent;
  return (
    <>
      {/* the one structured-data block, server-rendered in the initial HTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml() }} />
      <HomepageSections
        about={c.profile.about}
        heroSocials={c.hero.socials}
        handle={c.profile.handle}
        order={c.sections.order}
        work={toEntryRows('work', c.work)}
        education={toEntryRows('education', c.education)}
        research={toEntryRows('research', c.research)}
        talks={toEntryRows('talks', c.talks)}
        volunteering={toEntryRows('volunteering', c.volunteering)}
        awards={toEntryRows('awards', c.awards)}
        projects={c.projects.filter((p) => !p.hide)}
        timeline={getActivityEntries()}
      />
    </>
  );
}
