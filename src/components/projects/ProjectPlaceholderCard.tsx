'use client';
import { Tilt } from '@/components/motion-primitives/tilt';
import { TextShimmer } from '@/components/motion-primitives/text-shimmer';
import { CardContainer } from '@/components/entry/CardContainer';

/** "Work in progress..." skeleton appended when the visible project count is odd. */
export function ProjectPlaceholderCard() {
  return (
    <div className="space-y-2 rounded-2xl p-2">
      <Tilt rotationFactor={10} springOptions={{ bounce: 0.3, damping: 20 }} isReverse>
        <CardContainer padding="sm">
          <div className="relative aspect-[1.91/1] w-full overflow-hidden squircle-thumb bg-zinc-200/50 dark:bg-zinc-800/50">
            <div className="absolute inset-0 flex items-center justify-center">
              <TextShimmer as="span" className="text-xs" duration={2}>
                Work in progress...
              </TextShimmer>
            </div>
          </div>
        </CardContainer>
      </Tilt>
      <div className="px-1">
        <span className="font-base rounded bg-zinc-200/60 font-semibold text-transparent dark:bg-zinc-700/40">Project Name</span>
        <p className="line-clamp-2 text-sm text-transparent">
          <span className="rounded bg-zinc-200/40 dark:bg-zinc-700/30">Project description text that goes here</span>{' '}
          <span className="rounded bg-zinc-200/40 dark:bg-zinc-700/30">some more facts that go here</span>
        </p>
        <div className="mt-2 flex items-center gap-1 text-sm">
          <div className="size-4 rounded bg-zinc-200/40 dark:bg-zinc-700/30" />
          <span className="rounded bg-zinc-200/40 text-transparent dark:bg-zinc-700/30">Repository</span>
        </div>
      </div>
    </div>
  );
}
