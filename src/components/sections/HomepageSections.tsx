'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { SECTION_VARIANTS } from '@/components/sections/Section';
import { EntrySection } from '@/components/sections/EntrySection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { WritingSection } from '@/components/sections/WritingSection';
import { ConnectSection } from '@/components/sections/ConnectSection';
import { Footer } from '@/components/shell/Footer';
import { SocialIcons } from '@/components/shell/SocialIcons';
import { CommandBarTrigger } from '@/components/shell/CommandBarTrigger';
import { BookCallButton, HERO_CTA_ID } from '@/components/cta/BookCallButton';
import { CtaRow } from '@/components/cta/CtaRow';
import { EndCta } from '@/components/cta/EndCta';
import { FollowButton } from '@/components/cta/FollowButton';
import { FollowCard } from '@/components/cta/FollowCard';
import { FollowLine } from '@/components/cta/FollowLine';
import { LocalTime } from '@/components/cta/LocalTime';
import { TimelineProvider } from '@/components/popups/timeline-context';
import { asciiBanner } from '@/lib/ascii';
import type { EntryRowData } from '@/lib/rows';
import { siteContent, type ActivityEntry, type BlogPost, type Project, type SectionId } from '@/content/site-content';

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
  /** raw list (the section renders when this is non-empty; wip posts are filtered inside) */
  writing: BlogPost[];
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

/** The between-section booking rows, keyed by the section they follow (content decides where; never directly before Connect). */
const CTA_ROWS = new Map(siteContent.cta.between.map((row, i) => [row.after, { index: i + 1, text: row.text }]));
/** The X card follows this section (content decides; the generator keeps it off a section that already has a row). */
const FOLLOW_CARD_AFTER: SectionId = siteContent.follow.card.after;

export function HomepageSections(data: HomepageData) {
  const reduced = Boolean(useReducedMotion());
  const transition = { duration: reduced ? 0 : 0.3 };
  const { cta } = siteContent;

  useEffect(() => {
    console.log(asciiBanner(data.handle));
  }, [data.handle]);

  const entry = (id: SectionId, items: EntryRowData[]) =>
    items.length > 0 ? <EntrySection key={id} id={id} items={items} transition={transition} /> : null;

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'about':
        return (
          <motion.section key={id} id="about" className="scroll-mt-24" variants={SECTION_VARIANTS} transition={transition}>
            <div className="flex-1">
              <p className="text-zinc-600 dark:text-zinc-400">
                {data.about}{' '}
                {/* the bio ends with the booking link, then the X and Instagram follow links (one sentence in cta.bio) */}
                <Link href={cta.href} data-ph-capture-attribute-cta="bio" className="underline dark:text-zinc-300">
                  {cta.bioLinkText}
                </Link>
                <FollowLine text={cta.bio.slice(cta.bioLinkText.length)} position="bio" />
              </p>
              {/*
                the hero cluster: the big booking button, the two follow buttons, then the remaining social icons.
                Phones stack it (full-width booking button, the follow pair sharing the row under it, the icons on their
                own line); from sm up it is one wrapping row with the first glyph flush with the text edge.
              */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <BookCallButton id={HERO_CTA_ID} position="hero" size="hero" magnetic className="w-full justify-center sm:w-auto" />
                {/* the follow pair: on phones each grows from its own width (so the longer label never wraps), one row from sm up */}
                <div className="flex items-center gap-3">
                  <FollowButton network="x" position="follow-x-hero" size="hero" magnetic wrapperClassName="flex-auto sm:flex-none" className="w-full justify-center sm:w-auto" />
                  <FollowButton network="instagram" position="follow-ig-hero" size="hero" magnetic wrapperClassName="flex-auto sm:flex-none" className="w-full justify-center sm:w-auto" />
                </div>
                <SocialIcons labels={data.heroSocials} className="-ml-2" />
              </div>
              {/* a real person on the other end: the live local time, rendered after mount (its box is reserved) */}
              <LocalTime className="mt-4" />
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
      case 'writing':
        return data.writing.length > 0 ? <WritingSection key={id} posts={data.writing} transition={transition} /> : null;
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
  // a section followed by a booking row or the X card shares one wrapper with it, so the coda sits 2.25rem under the
  // section instead of taking its own 5rem slot in the stagger container's space-y-20
  const render = (id: SectionId) => {
    const section = renderSection(id);
    if (!section) return section;
    const row = CTA_ROWS.get(id);
    const coda = row ? (
      <CtaRow index={row.index} text={row.text} transition={transition} />
    ) : id === FOLLOW_CARD_AFTER ? (
      <FollowCard transition={transition} />
    ) : null;
    if (!coda) return section;
    return (
      <div key={id}>
        {section}
        {coda}
      </div>
    );
  };

  return (
    <TimelineProvider entries={data.timeline}>
      <CommandBarTrigger />
      <motion.main className="space-y-20" variants={CONTAINER_VARIANTS} custom={reduced} initial="hidden" animate="visible">
        {data.order.map(render)}
        <EndCta transition={transition} />
        <Footer variants={SECTION_VARIANTS} transition={transition} />
      </motion.main>
    </TimelineProvider>
  );
}
