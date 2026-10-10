import { assertUnreachable } from '@/lib/assert';

export const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const PRESENT = 'Present';

/** `year` -> "2025" · `month-year` -> "November 2025" · `short-month-year` -> "Nov 2025" */
export type DateFormat = 'year' | 'month-year' | 'short-month-year';

/**
 * Parse "Mon YYYY" / "Month YYYY". `Present` resolves to Dec 31 23:59:59 of
 * max(referenceYear, currentYear) for range maths.
 */
export function parseDate(value: string, referenceYear?: number): Date {
  if (value === PRESENT) {
    const year = Math.max(referenceYear ?? 0, new Date().getFullYear());
    return new Date(year, 11, 31, 23, 59, 59);
  }
  const [month, year] = value.trim().split(/\s+/);
  let index = FULL_MONTHS.indexOf(month);
  if (index === -1) index = SHORT_MONTHS.indexOf(month);
  if (index !== -1 && year && !Number.isNaN(Number(year))) return new Date(Number(year), index, 1);
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;
  return new Date(NaN);
}

export function formatDate(value: string, format: DateFormat): string {
  if (value === PRESENT) return PRESENT;
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return value;
  switch (format) {
    case 'year':
      return String(date.getFullYear());
    case 'month-year':
      return `${FULL_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    case 'short-month-year':
      return `${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    default:
      return assertUnreachable(format);
  }
}

/** Calendar year of a date string; `Present` -> `currentYear`. */
export function yearOf(value: string, currentYear: number): number {
  if (value === PRESENT) return currentYear;
  return parseDate(value).getFullYear();
}

/**
 * Entry date ranges: "Jun 2026" when start and end fall in the same month (or the same unit of
 * `format`), otherwise "Nov 2025 - Jun 2026" / "Mar 2026 - Present". `presentLabel` swaps the
 * label of an ongoing range (the popups use "....").
 */
export function formatRange(start: string, end: string, format: DateFormat = 'short-month-year', presentLabel: string = PRESENT): string {
  const from = formatDate(start, format);
  const to = end === PRESENT ? presentLabel : formatDate(end, format);
  return start === end || from === to ? from : `${from} - ${to}`;
}
