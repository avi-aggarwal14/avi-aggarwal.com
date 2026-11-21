'use client';
import { CardContainer } from '@/components/entry/CardContainer';
import { BookCallButton } from '@/components/cta/BookCallButton';
import { siteContent } from '@/content/site-content';

/**
 * The booking tile in the Projects grid: the project cards' outer box (`p-2`, squircle card with the pointer spotlight)
 * filled edge to edge with the placeholder card's quiet surface, the title, one line and the booking button centred.
 * In the two-column grid it stretches to the row height, so it is exactly the size of the card beside it; in the
 * one-column grid on phones it takes the thumbnails' 1.91:1 plate shape.
 */
export function ProjectCtaCard() {
  const { projectsTile } = siteContent.cta;
  return (
    <div data-cta-tile className="flex h-full flex-col rounded-2xl p-2">
      <CardContainer padding="sm" className="flex-1">
        <div className="flex aspect-[1.91/1] size-full flex-col items-center justify-center gap-2 squircle-thumb bg-zinc-200/50 px-6 py-6 text-center sm:aspect-auto sm:min-h-48 sm:py-8 dark:bg-zinc-800/50">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{projectsTile.title}</h3>
          <p className="max-w-xs text-sm text-zinc-600 dark:text-zinc-400">{projectsTile.text}</p>
          <div className="mt-3 flex justify-center">
            <BookCallButton position="projects-tile" magnetic />
          </div>
        </div>
      </CardContainer>
    </div>
  );
}
