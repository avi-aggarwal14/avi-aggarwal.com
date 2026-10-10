'use client';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { BRAND_ICONS, BrandIcon } from '@/components/shell/brand-icons';
import { siteContent } from '@/content/site-content';
import { cn } from '@/lib/utils';

/**
 * A quiet row of monochrome brand icons (16 px glyphs in 32 px hit areas) for the hero and the footer.
 * `labels` are socials[].label values (content decides the set and order); unknown labels are skipped.
 * Each link gets the Connect pills' Magnetic hover, an aria-label and opens in a new tab.
 */
export function SocialIcons({ labels, className }: { labels: string[]; className?: string }) {
  const links = labels
    .map((label) => siteContent.socials.find((s) => s.label === label))
    .filter((s): s is NonNullable<typeof s> => Boolean(s) && Boolean(BRAND_ICONS[s!.label]));
  if (links.length === 0) return null;
  return (
    <div className={cn('flex items-center', className)}>
      {links.map((link) => (
        <Magnetic key={link.id} springOptions={{ bounce: 0 }} intensity={0.3}>
          <a
            href={link.link}
            target="_blank"
            rel="noopener"
            aria-label={BRAND_ICONS[link.label].name}
            className="magnetic-social-link flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors duration-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <BrandIcon label={link.label} className="size-4" />
          </a>
        </Magnetic>
      ))}
    </div>
  );
}
