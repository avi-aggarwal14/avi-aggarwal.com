'use client';
import { motion, type Transition } from 'motion/react';
import { HEADING_CLASS, SECTION_CLASS, SECTION_VARIANTS } from '@/components/sections/Section';
import { BookCallButton } from '@/components/cta/BookCallButton';
import { FollowLine } from '@/components/cta/FollowLine';
import { siteContent } from '@/content/site-content';

/** The closing block after Connect, before the footer: the same shell and rhythm as a content section, no id (the nav's scroll-spy ignores it). */
export function EndCta({ transition }: { transition: Transition }) {
  const { end } = siteContent.cta;
  return (
    <motion.section data-cta-block aria-label={end.title} className={SECTION_CLASS} variants={SECTION_VARIANTS} transition={transition}>
      <h2 className={HEADING_CLASS}>{end.title}</h2>
      <p className="mb-5 text-zinc-600 dark:text-zinc-400">{end.text}</p>
      <div className="flex">
        <BookCallButton position="end" magnetic />
      </div>
      {/* under the button: the two follow links, from the same template as the bio */}
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        <FollowLine text={end.follow} position="end" />
      </p>
    </motion.section>
  );
}
