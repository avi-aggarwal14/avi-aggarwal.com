import { HomepageSections } from '@/components/sections/HomepageSections';
import { getActivityEntries, siteContent } from '@/content/site-content';
import { toEntryRows } from '@/lib/rows';

export default function Home() {
  const c = siteContent;
  return (
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
  );
}
