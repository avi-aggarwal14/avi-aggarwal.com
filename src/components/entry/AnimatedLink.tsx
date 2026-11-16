'use client';
import { useState, type MouseEventHandler, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type AnimatedLinkProps = {
  /** accessible name when the visible text alone is ambiguous (it should contain the visible text) */
  ariaLabel?: string;
  as?: 'a' | 'button';
  className?: string;
  children: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit';
  onClick?: MouseEventHandler<HTMLElement>;
  /** PostHog autocapture position (`data-ph-capture-attribute-cta`) for booking links */
  cta?: string;
};

/** Text link whose 1px underline grows left-to-right over 200ms on hover and retracts to the right. Internal hrefs (`/...`) render through next/link. */
export function AnimatedLink({ as = 'a', className, children, href, target, rel, type, onClick, ariaLabel, cta }: AnimatedLinkProps) {
  const [hover, setHover] = useState(false);
  const style = {
    backgroundImage: 'linear-gradient(currentColor, currentColor)',
    backgroundRepeat: 'no-repeat',
    transition: 'background-size 200ms ease',
    backgroundSize: hover ? '100% 1px' : '0% 1px',
    backgroundPosition: hover ? '0% 100%' : '100% 100%',
  } as const;
  const classes = cn('inline-block transition-colors', className);
  const handlers = { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), onClick };

  if (as === 'button') {
    return (
      <button type={type} aria-label={ariaLabel} className={classes} style={style} {...handlers}>
        {children}
      </button>
    );
  }
  if (href?.startsWith('/')) {
    return (
      <Link href={href} target={target} rel={rel} aria-label={ariaLabel} data-ph-capture-attribute-cta={cta} className={classes} style={style} {...handlers}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target={target} rel={rel} aria-label={ariaLabel} data-ph-capture-attribute-cta={cta} className={classes} style={style} {...handlers}>
      {children}
    </a>
  );
}
