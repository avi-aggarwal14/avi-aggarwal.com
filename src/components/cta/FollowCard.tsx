'use client';
import Image from 'next/image';
import { motion, type Transition } from 'motion/react';
import { CardContainer } from '@/components/entry/CardContainer';
import { FollowButton } from '@/components/cta/FollowButton';
import { SECTION_VARIANTS } from '@/components/sections/Section';
import { siteContent } from '@/content/site-content';

/**
 * The X card after a homepage section (content says which): avatar, name and handle like a profile header, one title,
 * one line, a solid "Follow on X" and a quieter "Follow on Instagram". The site's own card chrome (squircle, inset
 * ring, pointer spotlight); no counts, no embed, no script. Rendered in the section's wrapper, so it sits 2.25rem under
 * it like the booking rows, and it joins the homepage stagger.
 */
export function FollowCard({ transition }: { transition: Transition }) {
  const { profile, follow } = siteContent;
  return (
    <motion.div data-follow-card className="mt-9" variants={SECTION_VARIANTS} transition={transition}>
      <CardContainer padding="md">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 gap-4">
            <Image src={profile.avatar} alt={profile.name} width={96} height={96} draggable={false} className="size-12 shrink-0 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                {profile.name} <span className="font-normal text-zinc-500 dark:text-zinc-400">{follow.x.handle}</span>
              </p>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">{follow.card.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400">{follow.card.text}</p>
            </div>
          </div>
          {/* phones: a wrapping row under the text; from sm up: a column on the right, both buttons one width */}
          <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:flex-col sm:items-stretch">
            <FollowButton network="x" position="follow-x-card" variant="solid" size="md" magnetic className="justify-center sm:w-full" />
            <FollowButton network="instagram" position="follow-ig-card" size="md" magnetic className="justify-center sm:w-full" />
          </div>
        </div>
      </CardContainer>
    </motion.div>
  );
}
