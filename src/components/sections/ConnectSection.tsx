'use client';
import Image from 'next/image';
import { motion, type Transition } from 'motion/react';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { HEADING_CLASS, SECTION_CLASS, SECTION_VARIANTS } from '@/components/sections/Section';
import { sectionTitle } from '@/lib/sections';
import { siteContent } from '@/content/site-content';

export function ConnectSection({ transition }: { transition: Transition }) {
  const { connect, socials, assets } = siteContent;
  const links = connect.links
    .map((label) => socials.find((s) => s.label === label))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <motion.section id="connect" className={SECTION_CLASS} variants={SECTION_VARIANTS} transition={transition}>
      <h2 className={HEADING_CLASS}>{sectionTitle('connect')}</h2>
      <p className="mb-5 text-zinc-600 dark:text-zinc-400">
        {connect.intro}{' '}
        <a className="underline dark:text-zinc-300" href={`mailto:${connect.email}`}>
          {connect.email}
        </a>
      </p>
      {/* gap-3 equals the original space-x-3; flex-wrap lets seven pills wrap on narrow screens instead of overflowing */}
      <div className="flex flex-wrap items-center justify-start gap-3">
        {links.map((link) => (
          <Magnetic key={link.label} springOptions={{ bounce: 0 }} intensity={0.3}>
            <a
              href={link.link}
              className="magnetic-social-link group relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-200 px-2.5 py-1 text-xs text-black hover:bg-zinc-900 hover:text-zinc-50 hover:transition-colors hover:duration-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {link.label}
              <span className="text-black group-hover:text-white dark:text-zinc-100 dark:group-hover:text-black group-hover:transition-colors group-hover:duration-200">
                <Image
                  src={assets.externalLinkIcon}
                  alt=""
                  aria-hidden="true"
                  width={12}
                  height={12}
                  draggable={false}
                  className="size-3 group-hover:invert dark:invert group-hover:transition-all group-hover:duration-200"
                />
              </span>
            </a>
          </Magnetic>
        ))}
      </div>
    </motion.section>
  );
}
