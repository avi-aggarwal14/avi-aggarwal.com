'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MorphingDialogContainer, MorphingDialogContent } from '@/components/motion-primitives/morphing-dialog';
import { POPUP_PANEL, PopupClose } from '@/components/popups/popup-shell';
import { AnimatedNumber } from '@/components/popups/AnimatedNumber';
import { TimelineList } from '@/components/popups/TimelineList';
import { useTimelineEntries } from '@/components/popups/timeline-context';
import { useCurrentYear } from '@/hooks/useCurrentYear';
import { SHORT_MONTHS, parseDate, PRESENT } from '@/lib/dates';
import { sectionColor } from '@/lib/section-colors';
import { entriesForYear, entryOverlapsMonth, yearsCovered } from '@/lib/timeline';
import { cn } from '@/lib/utils';
import type { TimelineEntry } from '@/content/site-content';

const NAV_BUTTON = 'flex size-8 items-center justify-center rounded-full transition-colors md:size-7';
const NAV_ENABLED =
  'bg-zinc-100/50 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100';
const NAV_DISABLED = 'cursor-not-allowed bg-zinc-100/40 text-zinc-400 dark:bg-zinc-800/40 dark:text-zinc-600';

type YearTimelineBodyProps = { year: number; currentItemId?: string };

function YearTimelineBody({ year, currentItemId }: YearTimelineBodyProps) {
  const entries = useTimelineEntries();
  const currentYear = useCurrentYear();
  const [displayedYear, setDisplayedYear] = useState(year);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);

  const years = useMemo(() => yearsCovered(entries, currentYear), [entries, currentYear]);
  const yearEntries = useMemo(() => entriesForYear(entries, displayedYear, currentYear), [entries, displayedYear, currentYear]);
  const index = years.indexOf(displayedYear);
  const atFirst = index <= 0;
  const atLast = index === -1 || index >= years.length - 1;
  const goPrev = () => {
    if (!atFirst) setDisplayedYear(years[index - 1]);
  };
  const goNext = () => {
    if (!atLast) setDisplayedYear(years[index + 1]);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const hoveredEntry: TimelineEntry | undefined = hoveredEntryId ? yearEntries.find((e) => e.id === hoveredEntryId) : undefined;
  const hoveredStartsBefore = hoveredEntry ? parseDate(hoveredEntry.start).getFullYear() < displayedYear : false;
  const hoveredEndsAfter = hoveredEntry
    ? (hoveredEntry.end === PRESENT ? Math.max(displayedYear, currentYear) : parseDate(hoveredEntry.end).getFullYear()) > displayedYear
    : false;

  const months = SHORT_MONTHS.map((label, m) => {
    const inMonth = yearEntries.filter((e) => entryOverlapsMonth(e, displayedYear, m, currentYear));
    const types = [...new Set(inMonth.map((e) => e.type))];
    const hasEntries = inMonth.length > 0;
    const containsHovered = hoveredEntry ? entryOverlapsMonth(hoveredEntry, displayedYear, m, currentYear) : false;
    const dimmed = hoveredEntry ? !containsHovered : false;
    return { label, m, hasEntries, types, containsHovered, dimmed };
  });

  const count = yearEntries.length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              <AnimatedNumber value={displayedYear} digitClassName="h-7" />
            </h3>
            <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
              <AnimatedNumber value={count} inline />
              <span className="ml-1">{count === 1 ? 'activity' : 'activities'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button type="button" aria-label="Previous year" disabled={atFirst} onClick={goPrev} className={cn(NAV_BUTTON, atFirst ? NAV_DISABLED : NAV_ENABLED)}>
              <ChevronLeft className="size-4" />
            </button>
            {years.length > 10 && (
              <span className="text-xs text-zinc-500 md:hidden dark:text-zinc-400">
                {index + 1}/{years.length}
              </span>
            )}
            <div className={cn('items-center gap-1 px-1 md:px-2', years.length > 10 ? 'hidden md:flex' : 'flex')}>
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  aria-label={`Go to year ${y}`}
                  onClick={() => setDisplayedYear(y)}
                  className={cn(
                    'h-2 rounded-full transition-all md:h-1.5',
                    y === displayedYear ? 'w-4 bg-zinc-900 md:w-4 dark:bg-zinc-100' : 'w-2 bg-zinc-300 hover:bg-zinc-400 md:w-1.5 dark:bg-zinc-700 dark:hover:bg-zinc-600',
                  )}
                />
              ))}
            </div>
            <button type="button" aria-label="Next year" disabled={atLast} onClick={goNext} className={cn(NAV_BUTTON, atLast ? NAV_DISABLED : NAV_ENABLED)}>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: atFirst ? 0.25 : 0.025, right: atLast ? 0.25 : 0.025 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 50) goPrev();
          else if (info.offset.x < -50) goNext();
        }}
        style={{ touchAction: 'pan-y', willChange: 'transform', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
      >
        <div className="relative mt-6">
          {hoveredStartsBefore && <div className="absolute top-1/2 -left-3 size-1 -translate-y-1/2 rounded-full bg-zinc-400 dark:bg-zinc-600" />}
          {hoveredEndsAfter && <div className="absolute top-1/2 -right-3 size-1 -translate-y-1/2 rounded-full bg-zinc-400 dark:bg-zinc-600" />}
          <div className="grid grid-cols-6 gap-1.5 md:grid-cols-12 md:gap-1.5">
            {months.map((month) => (
              <div
                key={month.label}
                onMouseEnter={() => setHoveredMonth(month.m)}
                onMouseLeave={() => setHoveredMonth(null)}
                className={cn(
                  'group relative aspect-square rounded-lg border transition-all duration-200',
                  month.hasEntries ? 'border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/70' : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/50',
                  month.dimmed && 'opacity-30',
                  !month.dimmed && month.hasEntries && 'hover:border-zinc-400 dark:hover:border-zinc-600',
                  month.containsHovered && 'border-zinc-400 dark:border-zinc-600',
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn('font-medium transition-colors text-[10px] md:text-[9px]', month.hasEntries ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500')}>
                    {month.label}
                  </span>
                </div>
                {month.hasEntries && (
                  <div className="absolute right-0 bottom-1 left-0 flex justify-center gap-0.5">
                    {month.types.map((type) => (
                      <div key={type} className={cn('rounded-full transition-transform size-1.5 md:size-1', sectionColor(type).activity, !month.dimmed && 'group-hover:scale-125')} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="relative mt-4 max-h-[50vh] overflow-y-auto md:mt-6 md:max-h-[60vh]" style={{ scrollbarGutter: 'stable' }}>
        <TimelineList
          entries={yearEntries}
          currentItemId={currentItemId}
          dateFormat="short-month-year"
          hoveredMonth={hoveredMonth}
          displayedYear={displayedYear}
          currentYear={currentYear}
          onHoveredEntryChange={setHoveredEntryId}
        />
      </div>
    </div>
  );
}

/** Year popup content; mount inside a `MorphingDialog` next to its trigger. */
export function YearTimelineDialog(props: YearTimelineBodyProps) {
  return (
    <MorphingDialogContainer>
      <div className="fixed inset-0 flex items-start justify-center overflow-x-hidden overflow-y-auto pt-[8vh]">
        <MorphingDialogContent className={POPUP_PANEL}>
          <YearTimelineBody {...props} />
        </MorphingDialogContent>
      </div>
      <PopupClose />
    </MorphingDialogContainer>
  );
}
