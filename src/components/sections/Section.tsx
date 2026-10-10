'use client';
import type { ReactNode } from 'react';
import { motion, type Transition } from 'motion/react';

/** Shared entrance variants for every homepage section and the footer. */
export const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export const SECTION_CLASS = 'scroll-mt-24 -mx-6 rounded-xl px-6 py-3';
export const HEADING_CLASS = 'mb-5 text-base font-semibold text-zinc-900 dark:text-zinc-100';

type SectionProps = {
  id: string;
  title: string;
  transition: Transition;
  children: ReactNode;
};

/** The shared wrapper used by the six entry sections (heading + `-mx-4` body). */
export function Section({ id, title, transition, children }: SectionProps) {
  return (
    <motion.section id={id} className={SECTION_CLASS} variants={SECTION_VARIANTS} transition={transition}>
      <h3 className={HEADING_CLASS}>{title}</h3>
      <div className="-mx-4">{children}</div>
    </motion.section>
  );
}
