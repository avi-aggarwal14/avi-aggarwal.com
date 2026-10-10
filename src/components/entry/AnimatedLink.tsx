'use client';
import { useState, type MouseEventHandler, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AnimatedLinkProps = {
  as?: 'a' | 'button';
  className?: string;
  children: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit';
  onClick?: MouseEventHandler<HTMLElement>;
};

/** Text link whose 1px underline grows left-to-right over 200ms on hover and retracts to the right. */
export function AnimatedLink({ as = 'a', className, children, href, target, rel, type, onClick }: AnimatedLinkProps) {
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
      <button type={type} className={classes} style={style} {...handlers}>
        {children}
      </button>
    );
  }
  return (
    <a href={href} target={target} rel={rel} className={classes} style={style} {...handlers}>
      {children}
    </a>
  );
}
