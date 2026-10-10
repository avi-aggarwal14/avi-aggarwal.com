import type { TimelineEntry } from '@/content/site-content';
import { formatDate, formatRange, parseDate, PRESENT, type DateFormat } from '@/lib/dates';

/** `Present` resolves to Dec 31 23:59:59 of max(year, currentYear). */
export function resolvedEnd(entry: TimelineEntry, year: number, currentYear: number): Date {
  if (entry.end === PRESENT) return new Date(Math.max(year, currentYear), 11, 31, 23, 59, 59);
  return parseDate(entry.end);
}

/** Overlap test: a 2023–2025 role counts in 2023, 2024 and 2025. */
export function entryOverlapsYear(entry: TimelineEntry, year: number, currentYear: number): boolean {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);
  return parseDate(entry.start) <= yearEnd && resolvedEnd(entry, year, currentYear) >= yearStart;
}

/** Entries shown for a year, newest start first (the one place the site sorts). */
export function entriesForYear(entries: TimelineEntry[], year: number, currentYear: number): TimelineEntry[] {
  return entries
    .filter((e) => entryOverlapsYear(e, year, currentYear))
    .sort((a, b) => parseDate(b.start).getTime() - parseDate(a.start).getTime());
}

/** Every year any entry touches (start…end), ascending. */
export function yearsCovered(entries: TimelineEntry[], currentYear: number): number[] {
  const years = new Set<number>();
  for (const e of entries) {
    const start = parseDate(e.start).getFullYear();
    const end = e.end === PRESENT ? currentYear : parseDate(e.end).getFullYear();
    for (let y = start; y <= end; y++) years.add(y);
  }
  return [...years].sort((a, b) => a - b);
}

/** Talks are point events; everything else is an interval. */
export function entryOverlapsMonth(entry: TimelineEntry, year: number, month: number, currentYear: number): boolean {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
  const start = parseDate(entry.start);
  if (entry.type === 'talks') return start >= monthStart && start <= monthEnd;
  return start <= monthEnd && resolvedEnd(entry, year, currentYear) >= monthStart;
}

/** "Oct 2026 - ...." for ongoing items, "Nov 2025 - Jun 2026" otherwise; a single "Jun 2026" for talks and one-month items. */
export function timelineDateText(entry: TimelineEntry, dateFormat: DateFormat = 'short-month-year'): string {
  if (entry.type === 'talks') return formatDate(entry.start, dateFormat);
  return formatRange(entry.start, entry.end, dateFormat, '....');
}

export function sameCoordinates(a: TimelineEntry['location'], b: TimelineEntry['location']): boolean {
  return a.coordinates.latitude === b.coordinates.latitude && a.coordinates.longitude === b.coordinates.longitude;
}
