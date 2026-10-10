'use client';
import { MorphingDialog, MorphingDialogTrigger } from '@/components/motion-primitives/morphing-dialog';
import { AnimatedLink } from '@/components/entry/AnimatedLink';
import { useCurrentYear } from '@/hooks/useCurrentYear';
import { YearTimelineDialog } from '@/components/popups/YearTimelineDialog';
import { formatDate, parseDate, PRESENT, type DateFormat } from '@/lib/dates';

const YEAR_DIALOG_TRANSITION = { type: 'spring', bounce: 0, duration: 0.2 } as const;

type YearTriggerProps = { year: number; label: string; className: string; entryId?: string; children?: React.ReactNode };

/** One year = one MorphingDialog whose content (the year timeline) is attached in the popups phase. */
function YearTrigger({ year, label, className, entryId, children }: YearTriggerProps) {
  return (
    <MorphingDialog transition={YEAR_DIALOG_TRANSITION}>
      <MorphingDialogTrigger>
        <AnimatedLink as="button" className={className}>
          {children ?? label}
        </AnimatedLink>
      </MorphingDialogTrigger>
      <YearTimelineDialog year={year} currentItemId={entryId} />
    </MorphingDialog>
  );
}

type DateRangeProps = { start: string; end: string; dateFormat: DateFormat; entryId?: string };

/**
 * Three branches: identical start/end (Talks) -> one trigger; same calendar year and not
 * Present -> one trigger with "YYYY - YYYY"; otherwise two independent year triggers.
 */
export function DateRange({ start, end, dateFormat, entryId }: DateRangeProps) {
  const currentYear = useCurrentYear();
  const startYear = parseDate(start).getFullYear();
  const endYear = end === PRESENT ? currentYear : parseDate(end).getFullYear();
  const dash = <span className="text-zinc-400 dark:text-zinc-500">-</span>;

  if (start === end) {
    return (
      <YearTrigger
        year={startYear}
        label={formatDate(start, dateFormat)}
        entryId={entryId}
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      />
    );
  }

  if (startYear === endYear && end !== PRESENT) {
    return (
      <YearTrigger
        year={startYear}
        label={formatDate(start, dateFormat)}
        entryId={entryId}
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <span>{formatDate(start, dateFormat)}</span>
        {dash}
        <span>{formatDate(end, dateFormat)}</span>
      </YearTrigger>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
      <YearTrigger year={startYear} label={formatDate(start, dateFormat)} entryId={entryId} className="hover:text-zinc-900 dark:hover:text-zinc-100" />
      {dash}
      <YearTrigger
        year={endYear}
        label={end === PRESENT ? PRESENT : formatDate(end, dateFormat)}
        entryId={entryId}
        className="hover:text-zinc-900 dark:hover:text-zinc-100"
      />
    </div>
  );
}
