import { Magnetic } from '@/components/motion-primitives/magnetic';
import { BrandIcon } from '@/components/shell/brand-icons';
import { SOLID_CTA_CLASS } from '@/components/cta/BookCallButton';
import { siteContent } from '@/content/site-content';
import { cn } from '@/lib/utils';

export type FollowNetwork = 'x' | 'instagram';

/** Where a follow CTA sits; captured by PostHog autocapture as the `cta` property (follow-x-hero, follow-ig-card, ...). */
export type FollowPosition = `follow-${'x' | 'ig'}-${string}`;

/**
 * The quiet follow pill: the Connect pills' soft zinc fill that turns solid on hover (`magnetic-social-link` flips the
 * custom cursor's ink over it, as on those pills). `solid` is the booking palette for the X card's primary button.
 */
const SOFT_CLASS =
  'magnetic-social-link group inline-flex shrink-0 items-center rounded-full bg-zinc-200 font-medium text-black transition-colors hover:bg-zinc-900 hover:text-zinc-50 hover:duration-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700';

const SIZES = {
  /** the hero pair: on phones both share one 326px row, so they drop to 12px / 36px; from sm up the lg box */
  hero: { pill: 'gap-1.5 px-3 py-2.5 text-xs sm:gap-2 sm:px-4 sm:text-sm', icon: 'size-3.5 sm:size-4' },
  /** post ending (the old hero button's box) */
  lg: { pill: 'gap-2 px-4 py-2.5 text-sm', icon: 'size-4' },
  /** floating dock, X card (the dock pill's box) */
  md: { pill: 'gap-1.5 px-3 py-1.5 text-[13px]', icon: 'size-3.5' },
  /** Connect pills */
  sm: { pill: 'gap-1.5 px-2.5 py-1 text-xs', icon: 'size-3' },
} as const;

type FollowButtonProps = {
  network: FollowNetwork;
  position: FollowPosition;
  size?: keyof typeof SIZES;
  variant?: 'soft' | 'solid';
  /** "Follow" instead of "Follow on X" (the network stays in the aria-label) */
  short?: boolean;
  /** the Connect pills' hover magnet */
  magnetic?: boolean;
  /** trailing glyph (the Connect row puts its glyphs after the label) */
  iconAfter?: boolean;
  className?: string;
  /** the Magnetic wrapper's classes (it is the flex item in rows); `shrink-0` by default so the label never wraps */
  wrapperClassName?: string;
  onClick?: () => void;
};

/** "Follow on X" / "Follow on Instagram" as an external link (new tab) to the follow URL in content, with the brand glyph. */
export function FollowButton({ network, position, size = 'lg', variant = 'soft', short = false, magnetic = false, iconAfter = false, className, wrapperClassName = 'shrink-0', onClick }: FollowButtonProps) {
  const { follow } = siteContent;
  const target = follow[network];
  const icon = <BrandIcon label={target.name} className={cn(SIZES[size].icon, 'shrink-0')} />;
  const link = (
    <a
      href={target.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={short ? target.label : undefined}
      data-ph-capture-attribute-cta={position}
      className={cn(variant === 'solid' ? SOLID_CTA_CLASS : SOFT_CLASS, SIZES[size].pill, className)}
    >
      {!iconAfter && icon}
      {short ? follow.shortLabel : target.label}
      {iconAfter && icon}
    </a>
  );
  if (!magnetic) return link;
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3} className={cn(wrapperClassName, 'will-change-transform')}>
      {link}
    </Magnetic>
  );
}
