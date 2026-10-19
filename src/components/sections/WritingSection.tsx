'use client';
import Link from 'next/link';
import { motion, type Transition } from 'motion/react';
import { AnimatedBackground } from '@/components/motion-primitives/animated-background';
import { SECTION_CLASS, SECTION_VARIANTS } from '@/components/sections/Section';
import { sectionTitle } from '@/lib/sections';
import { CUSTOM_CURSOR_RESET, dispatch } from '@/lib/events';
import type { BlogPost } from '@/content/site-content';

export function WritingSection({ posts, transition }: { posts: BlogPost[]; transition: Transition }) {
  const live = posts.filter((post) => !post.wip);
  return (
    <motion.section id="writing" className={SECTION_CLASS} variants={SECTION_VARIANTS} transition={transition}>
      {/* h2 / h3 like every other section since FIX-SEO (preflight resets heading styles, so the boxes are unchanged) */}
      <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{sectionTitle('writing')}</h2>
      <div className="flex flex-col space-y-0">
        <AnimatedBackground
          enableHover
          className="size-full rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80"
          transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
        >
          {live.map((post) => (
            <Link
              key={post.uid}
              data-id={post.uid}
              href={post.link}
              className="-mx-4 rounded-xl px-4 py-3"
              onClick={() => dispatch(CUSTOM_CURSOR_RESET)}
            >
              <div className="flex flex-col space-y-1">
                <h3 className="font-normal dark:text-zinc-100">{post.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400">{post.description}</p>
              </div>
            </Link>
          ))}
        </AnimatedBackground>
      </div>
    </motion.section>
  );
}
