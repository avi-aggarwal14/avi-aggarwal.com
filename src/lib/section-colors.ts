import type { TimelineType } from '@/content/site-content';

export type SectionColor = { badge: string; activity: string; label: string };

/** Category colours for timeline badges (`badge`) and month-tile dots (`activity`). */
export const SECTION_COLORS: Record<TimelineType, SectionColor> = {
  work: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', activity: 'bg-blue-500', label: 'W' },
  education: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', activity: 'bg-purple-500', label: 'E' },
  research: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', activity: 'bg-amber-500', label: 'R' },
  talks: { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', activity: 'bg-green-500', label: 'T' },
  volunteering: { badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', activity: 'bg-teal-500', label: 'V' },
  awards: { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', activity: 'bg-rose-500', label: 'A' },
};

export function sectionColor(type: string): SectionColor {
  return (SECTION_COLORS as Record<string, SectionColor>)[type] ?? { badge: '', activity: '', label: type.charAt(0).toUpperCase() };
}
