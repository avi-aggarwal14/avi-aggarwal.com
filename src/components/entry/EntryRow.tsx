'use client';
import Image from 'next/image';
import { CardContainer } from '@/components/entry/CardContainer';
import { AnimatedLink } from '@/components/entry/AnimatedLink';
import { DateRange } from '@/components/entry/DateRange';
import { LocationTrigger } from '@/components/entry/LocationTrigger';
import { getLogoImageClass } from '@/lib/logo-class';
import type { EntryRowData } from '@/lib/rows';

/** The reusable row card used by Work, Education, Research, Talks, Volunteering and Awards. */
export function EntryRow({ row }: { row: EntryRowData }) {
  return (
    <CardContainer id={row.id}>
      <div className="relative flex w-full flex-row items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-normal dark:text-zinc-100">{row.title}</h3>
            {row.wip && (
              <span className="shrink-0 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                WIP
              </span>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Image
              alt={`${row.subtitle} logo`}
              draggable={false}
              loading="lazy"
              width={20}
              height={20}
              className={getLogoImageClass(row.logo, false, 'timeline')}
              src={row.logo}
            />
            {row.link ? (
              <AnimatedLink
                href={row.link}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {row.subtitle}
              </AnimatedLink>
            ) : (
              // no public site yet: plain text, no underline animation, no hover state
              <span className="inline-block truncate text-sm text-zinc-500 dark:text-zinc-400">{row.subtitle}</span>
            )}
          </div>
          {/* tagline: one muted line inside the left column from md up */}
          {row.description ? (
            <p className="mt-1 hidden truncate text-sm font-normal text-zinc-600 md:block dark:text-zinc-400">{row.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 md:min-w-35">
          {row.hideDates ? (
            // Dateless (privacy) rows: no date range anywhere, but the same line box so the row height
            // and the location button's position match the neighbouring rows.
            <span aria-hidden="true" className="invisible inline-block text-sm select-none">
              &#8203;
            </span>
          ) : (
            <DateRange start={row.start} end={row.end} dateFormat={row.dateFormat} entryId={row.id} />
          )}
          <LocationTrigger location={row.location} entryId={row.id} />
        </div>
      </div>
      {/* below md the left column is too narrow, so the tagline spans the full card width under the row */}
      {row.description ? (
        <p className="relative mt-1 text-sm font-normal text-zinc-600 md:hidden dark:text-zinc-400">{row.description}</p>
      ) : null}
    </CardContainer>
  );
}
