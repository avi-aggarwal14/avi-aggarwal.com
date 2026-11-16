import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { siteContent } from '@/content/site-content';
import { cn } from '@/lib/utils';

/** DOM id of the hero button; the floating pill watches it to stay hidden while it is on screen. */
export const HERO_CTA_ID = 'book-a-call-hero';

/** Where a booking CTA sits on the page; captured by PostHog autocapture as the `cta` property. */
export type CtaPosition =
  | 'bio' | 'hero' | 'floating' | 'header' | 'footer' | 'between-1' | 'between-2' | 'between-3'
  | 'end' | 'blog-end' | 'command-bar' | 'connect-intro' | 'connect' | `project-${string}`;

/**
 * The solid booking pill: zinc-900 with white text in light mode, the inverse in dark (the palette of the 404 button),
 * the site's rounded-full shape and font. `cta-solid` is a hook for the custom cursor, which otherwise draws a white
 * ring over it in dark mode.
 */
export const SOLID_CTA_CLASS =
  'cta-solid group inline-flex shrink-0 items-center rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200';

const SIZES = {
  /** hero, closing block, post ending */
  lg: { pill: 'gap-2 px-5 py-2.5 text-sm', icon: 'size-4' },
  /** floating pill (the ⌘K hint's 13px) */
  md: { pill: 'gap-1.5 px-3 py-1.5 text-[13px]', icon: 'size-3.5' },
  /** glass nav pill (same box as the nav's own pills) */
  nav: { pill: 'gap-1.5 px-2.5 py-1 text-[13px]', icon: 'size-3' },
  /** between-section rows and the Connect pill (the Connect pills' box) */
  sm: { pill: 'gap-1.5 px-2.5 py-1 text-xs', icon: 'size-3' },
} as const;

type BookCallButtonProps = {
  position: CtaPosition;
  size?: keyof typeof SIZES;
  /** the Connect pills' hover magnet */
  magnetic?: boolean;
  /** trailing icon (the Connect row puts its glyphs after the label) */
  iconAfter?: boolean;
  id?: string;
  className?: string;
  onClick?: () => void;
};

/** "Book a call" as an internal link to the booking page, same tab, with the calendar glyph. */
export function BookCallButton({ position, size = 'lg', magnetic = false, iconAfter = false, id, className, onClick }: BookCallButtonProps) {
  const { cta } = siteContent;
  const icon = <Calendar className={SIZES[size].icon} aria-hidden="true" />;
  const link = (
    <Link id={id} href={cta.href} onClick={onClick} data-ph-capture-attribute-cta={position} className={cn(SOLID_CTA_CLASS, SIZES[size].pill, className)}>
      {!iconAfter && icon}
      {cta.label}
      {iconAfter && icon}
    </Link>
  );
  if (!magnetic) return link;
  // the wrapper is the flex item in rows, so it must not shrink (or the label wraps inside the pill on narrow screens)
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3} className="shrink-0 will-change-transform">
      {link}
    </Magnetic>
  );
}
