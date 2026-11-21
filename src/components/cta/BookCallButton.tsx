import Link from 'next/link';
import { Phone } from 'lucide-react';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { siteContent } from '@/content/site-content';
import { cn } from '@/lib/utils';

/** DOM id of the hero button; the floating dock watches it to stay hidden while the hero cluster is on screen. */
export const HERO_CTA_ID = 'book-a-call-hero';

/** Where a booking CTA sits on the page; captured by PostHog autocapture as the `cta` property. */
export type CtaPosition =
  | 'bio' | 'hero' | 'floating' | 'header' | 'footer' | `between-${number}` | 'end' | 'blog-mid' | 'blog-end'
  | 'command-bar' | 'connect-intro' | 'connect' | 'projects-tile' | 'not-found' | `project-${string}`;

/**
 * The solid booking pill: zinc-900 with white text in light mode, the inverse in dark (the palette of the 404 button),
 * the site's rounded-full shape and font. `cta-solid` is a hook for the custom cursor, which otherwise draws a white
 * ring over it in dark mode.
 */
export const SOLID_CTA_CLASS =
  'cta-solid group inline-flex shrink-0 items-center rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200';

/**
 * The hero button only: raised (a soft drop shadow and a hairline highlight along the top edge) and pressed down a
 * touch while the pointer is held. The transforms compose with the Magnetic wrapper's own.
 */
const HERO_CLASS =
  'shadow-lg shadow-black/25 inset-shadow-xs inset-shadow-white/20 transition-[transform,box-shadow,background-color] duration-150 ease-out active:translate-y-0.5 active:scale-[0.985] active:shadow-sm active:shadow-black/20 dark:shadow-black/45 dark:inset-shadow-white/70';
/** The hero handset: emerald, filled, readable on the dark button in light mode and on the light button in dark mode. */
const HERO_ICON_CLASS = 'fill-current text-emerald-500 dark:text-emerald-600';

const SIZES = {
  /** the hero button: the biggest, most tactile element on the page */
  hero: { pill: 'gap-2.5 px-7 py-3.5 text-base', icon: 'size-5' },
  /** closing block, post ending, Projects tile, 404 */
  lg: { pill: 'gap-2 px-5 py-2.5 text-sm', icon: 'size-4' },
  /** floating dock (the ⌘K hint's 13px) */
  md: { pill: 'gap-1.5 px-3 py-1.5 text-[13px]', icon: 'size-3.5' },
  /** glass nav pill (same box as the nav's own pills) */
  nav: { pill: 'gap-1.5 px-2.5 py-1 text-[13px]', icon: 'size-3' },
  /** between-section rows, the post's middle row and the Connect pill (the Connect pills' box) */
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

/** "Book a call" as an internal link to the booking page, same tab, with the phone handset glyph. */
export function BookCallButton({ position, size = 'lg', magnetic = false, iconAfter = false, id, className, onClick }: BookCallButtonProps) {
  const { cta } = siteContent;
  const hero = size === 'hero';
  const icon = <Phone className={cn(SIZES[size].icon, 'shrink-0', hero && HERO_ICON_CLASS)} aria-hidden="true" />;
  const link = (
    <Link
      id={id}
      href={cta.href}
      onClick={onClick}
      data-ph-capture-attribute-cta={position}
      className={cn(SOLID_CTA_CLASS, SIZES[size].pill, hero && HERO_CLASS, className)}
    >
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
