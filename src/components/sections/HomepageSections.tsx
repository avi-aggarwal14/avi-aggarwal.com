'use client';
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SECTION_VARIANTS } from '@/components/sections/Section';
import { EntrySection } from '@/components/sections/EntrySection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ConnectSection } from '@/components/sections/ConnectSection';
import { Footer } from '@/components/shell/Footer';
import { SocialIcons } from '@/components/shell/SocialIcons';
import { CommandBarTrigger } from '@/components/shell/CommandBarTrigger';
import { TimelineProvider } from '@/components/popups/timeline-context';
import { asciiBanner } from '@/lib/ascii';
import type { EntryRowData } from '@/lib/rows';
import type { ActivityEntry, Project, SectionId } from '@/content/site-content';

export type HomepageData = {
  about: string;
  /** socials[].label values for the icon row under the about paragraph */
  heroSocials: string[];
  handle: string;
  order: SectionId[];
  work: EntryRowData[];
  education: EntryRowData[];
  research: EntryRowData[];
  talks: EntryRowData[];
  volunteering: EntryRowData[];
  awards: EntryRowData[];
  projects: Project[];
  /** every live activity, dateless ones included; the popups filter as they need */
  timeline: ActivityEntry[];
};

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    transition: { staggerChildren: reduced ? 0 : 0.15, ...(reduced ? { duration: 0 } : {}) },
  }),
};

export function HomepageSections(data: HomepageData) {
  const reduced = Boolean(useReducedMotion());
  const transition = { duration: reduced ? 0 : 0.3 };

  useEffect(() => {
    console.log(asciiBanner(data.handle));
  }, [data.handle]);

  const entry = (id: SectionId, items: EntryRowData[]) =>
    items.length > 0 ? <EntrySection key={id} id={id} items={items} transition={transition} /> : null;

  const render = (id: SectionId) => {
    switch (id) {
      case 'about':
        return (
          <motion.section key={id} id="about" className="scroll-mt-24" variants={SECTION_VARIANTS} transition={transition}>
            <div className="flex-1">
              <p className="text-zinc-600 dark:text-zinc-400">{data.about}</p>
              {/* part of the header block: same entrance as the paragraph, first glyph flush with the text edge */}
              <SocialIcons labels={data.heroSocials} className="-ml-2 mt-4" />
            </div>
          </motion.section>
        );
      case 'work':
        return entry(id, data.work);
      case 'projects':
        return data.projects.length > 0 ? <ProjectsSection key={id} projects={data.projects} transition={transition} /> : null;
      case 'education':
        return entry(id, data.education);
      case 'research':
        return entry(id, data.research);
      case 'talks':
        return entry(id, data.talks);
      case 'volunteering':
        return entry(id, data.volunteering);
      case 'awards':
        return entry(id, data.awards);
      case 'connect':
        return <ConnectSection key={id} transition={transition} />;
      default:
        return null;
    }
  };

  return (
    <TimelineProvider entries={data.timeline}>
      <CommandBarTrigger />
      <motion.main className="space-y-20" variants={CONTAINER_VARIANTS} custom={reduced} initial="hidden" animate="visible">
        {data.order.map(render)}
        <Footer variants={SECTION_VARIANTS} transition={transition} />
      </motion.main>
    </TimelineProvider>
  );
}
