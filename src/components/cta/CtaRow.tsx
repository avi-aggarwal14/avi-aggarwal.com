'use client';
import { motion, type Transition } from 'motion/react';
import { SECTION_VARIANTS } from '@/components/sections/Section';
import { BookCallButton } from '@/components/cta/BookCallButton';

/**
 * One slim row after a homepage section (not a card): a short line and the compact booking pill, under the footer's
 * hairline. It renders inside the section's wrapper so it reads as that section's coda, and it shares the section
 * entrance (same variants, part of the homepage stagger).
 */
export function CtaRow({ index, text, transition }: { index: number; text: string; transition: Transition }) {
  return (
    <motion.div
      data-cta-row
      className="mt-9 flex items-center justify-between gap-4 border-t border-zinc-300/30 pt-4 dark:border-zinc-600/30"
      variants={SECTION_VARIANTS}
      transition={transition}
    >
      <p className="text-zinc-600 dark:text-zinc-400">{text}</p>
      <BookCallButton position={`between-${index}` as `between-${1 | 2 | 3}`} size="sm" magnetic />
    </motion.div>
  );
}
