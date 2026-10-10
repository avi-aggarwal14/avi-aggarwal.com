'use client';
import { AnimatedBackground } from '@/components/motion-primitives/animated-background';
import { useMorphingDialog } from '@/components/motion-primitives/morphing-dialog';
import { sectionColor } from '@/lib/section-colors';
import { scrollToElement } from '@/lib/scroll';
import { entryOverlapsMonth, sameCoordinates, timelineDateText } from '@/lib/timeline';
import { cn } from '@/lib/utils';
import type { DateFormat } from '@/lib/dates';
import { hasDates, type ActivityEntry, type Location } from '@/content/site-content';

export type TimelineListProps = {
  entries: ActivityEntry[];
  currentItemId?: string;
  dateFormat?: DateFormat;
  /** dims rows that do not overlap this month of `displayedYear` */
  hoveredMonth?: number | null;
  displayedYear?: number;
  currentYear?: number;
  /** dims rows whose coordinates differ (map marker hover) */
  hoveredLocation?: Location | null;
  onHoveredEntryChange?: (id: string | null) => void;
};

/** The activity list shared by the year and location popups (hover highlight, badges, click-through). */
export function TimelineList({
  entries,
  currentItemId,
  dateFormat = 'short-month-year',
  hoveredMonth = null,
  displayedYear,
  currentYear = new Date().getFullYear(),
  hoveredLocation = null,
  onHoveredEntryChange,
}: TimelineListProps) {
  const { setIsOpen } = useMorphingDialog();

  const isDimmed = (entry: ActivityEntry) => {
    if (hoveredMonth !== null && displayedYear !== undefined && hasDates(entry) && !entryOverlapsMonth(entry, displayedYear, hoveredMonth, currentYear)) return true;
    if (hoveredLocation && !sameCoordinates(entry.location, hoveredLocation)) return true;
    return false;
  };

  const open = (entry: ActivityEntry) => {
    setIsOpen(false);
    void scrollToElement(entry.id, { highlight: true });
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-2 bottom-2 left-2 w-px -translate-x-1/2 bg-zinc-200 dark:bg-zinc-700" />
      <AnimatedBackground
        enableHover
        className="ml-5 rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80"
        transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
        onValueChange={onHoveredEntryChange}
      >
        {entries.map((entry) => {
          const color = sectionColor(entry.type);
          const highlighted = entry.id === currentItemId;
          return (
            <div key={entry.id} data-id={entry.id} className="-ml-5 block w-[calc(100%+1.25rem)] rounded-lg py-2 pr-5 pl-5">
              <div className={cn('relative flex gap-3 transition-opacity duration-200', isDimmed(entry) && 'opacity-30')}>
                <div className="relative z-10 mt-1 flex size-4 items-center justify-center">
                  <div
                    className={cn(
                      'size-2 rounded-xs ring-4 ring-zinc-50 dark:ring-zinc-900',
                      highlighted ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-400 dark:bg-zinc-600',
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <button
                        type="button"
                        className="inline-block transition-colors text-left transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                        onClick={() => open(entry)}
                      >
                        <h4 className="text-left font-normal text-zinc-900 dark:text-zinc-100">{entry.title}</h4>
                      </button>
                      <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className={cn('inline-block size-4 rounded-sm text-center text-xs leading-4', color.badge)}>{color.label}</span>
                        {entry.subtitle}
                      </p>
                    </div>
                    {hasDates(entry) && <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{timelineDateText(entry, dateFormat)}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </AnimatedBackground>
    </div>
  );
}
