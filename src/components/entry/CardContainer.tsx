'use client';
import type { ReactNode } from 'react';
import { Spotlight } from '@/components/motion-primitives/spotlight';
import { cn } from '@/lib/utils';

const PADDING = { sm: 'p-1', md: 'p-4', lg: 'p-6' } as const;

type CardContainerProps = {
  id?: string;
  children: ReactNode;
  padding?: keyof typeof PADDING;
  enableSpotlight?: boolean;
  spotlightSize?: number;
  className?: string;
};

/** Squircle card chrome shared by entry rows and project thumbnails, with the pointer spotlight. */
export function CardContainer({ id, children, padding = 'md', enableSpotlight = true, spotlightSize = 32, className }: CardContainerProps) {
  return (
    <div id={id} className={cn('relative squircle-panel inset-ring inset-ring-zinc-300/30 dark:inset-ring-zinc-600/30', className)}>
      <div className="relative overflow-hidden rounded-[inherit]">
        {enableSpotlight && (
          <Spotlight
            size={spotlightSize}
            className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
          />
        )}
        <div className={cn('relative size-full', PADDING[padding])}>{children}</div>
      </div>
    </div>
  );
}
