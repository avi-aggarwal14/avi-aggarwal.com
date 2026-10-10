'use client';
import Image from 'next/image';
import { motion, type Transition, type Variants } from 'motion/react';
import { LogoMark } from '@/components/shell/LogoMark';
import { ThemeToggle, FOOTER_BUTTON_CLASS } from '@/components/shell/ThemeToggle';
import { MuteButton } from '@/components/shell/MuteButton';
import { SocialIcons } from '@/components/shell/SocialIcons';
import { useCurrentYear } from '@/hooks/useCurrentYear';
import { siteContent } from '@/content/site-content';

type FooterProps = { variants?: Variants; transition?: Transition };

/** Control bar (copyright, AI-summary links, theme controls), the credit line with the social icon row, and the oversized wordmark. */
export function Footer({ variants, transition }: FooterProps) {
  const year = useCurrentYear();
  const { profile, socials, ai, footer, assets } = siteContent;
  const github = socials.find((s) => s.label.toLowerCase() === 'github')?.link ?? profile.wordmark;
  const [copyPrefix, copySuffix] = footer.copyright.split('{year}');
  const prompt = encodeURIComponent(ai.prompt);

  return (
    <motion.footer className="mt-24 border-t border-zinc-300/30 pt-4 dark:border-zinc-600/30" variants={variants} transition={transition}>
      <div className="relative flex items-center justify-between px-4">
        <a href={github} target="_blank" className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="md:hidden">
            {copyPrefix}
            {year}
          </span>
          <span className="hidden md:inline">
            {copyPrefix}
            {year}
            {copySuffix}
          </span>
        </a>
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
          {ai.providers.map((provider) => (
            <a
              key={provider.id}
              href={provider.url.replace('{PROMPT}', prompt)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get AI summary from ${provider.name}`}
              className={FOOTER_BUTTON_CLASS}
            >
              <Image src={provider.icon} alt={provider.name} width={16} height={16} draggable={false} className="size-3.5 opacity-60 brightness-0 dark:invert" />
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <MuteButton />
          <ThemeToggle />
        </div>
      </div>
      {/* second row: credit on the left, the social icons on the right (under the theme controls); below sm the icons drop to their own line */}
      <div className="mt-1 flex flex-col items-start gap-y-1 px-4 sm:flex-row sm:items-center sm:justify-between">
        {footer.credit ? (
          <a href={footer.credit.url} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 dark:text-zinc-400">
            {footer.credit.text}
          </a>
        ) : (
          <span />
        )}
        <SocialIcons labels={footer.socials} className="-ml-2 sm:ml-0" />
      </div>
      <div aria-hidden="true" inert className="pointer-events-none -mx-4 mt-6 aspect-[2/1] overflow-hidden select-none md:mt-12 md:aspect-[8/1] lg:-mx-24">
        <LogoMark outline tilt={-10} viewBox={assets.logoMark.footerViewBox} className="block h-auto w-full text-zinc-900 md:hidden dark:text-zinc-100" />
        <Image src={profile.footerWordmark} alt="" width={1100} height={215} draggable={false} className="hidden h-auto w-full md:block dark:invert" />
      </div>
    </motion.footer>
  );
}
