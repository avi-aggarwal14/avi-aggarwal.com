'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getActivityEntries, hasDates, type ActivityEntry, type TimelineEntry } from '@/content/site-content';

const TimelineContext = createContext<ActivityEntry[] | null>(null);
/** Used when a dialog renders outside the homepage provider (every route but `/`). */
const FALLBACK_ENTRIES: ActivityEntry[] = getActivityEntries();

export function TimelineProvider({ entries, children }: { entries: ActivityEntry[]; children: ReactNode }) {
  return <TimelineContext.Provider value={entries}>{children}</TimelineContext.Provider>;
}

/** Every live activity (section order, including collapsed and dateless ones); falls back to the content module. */
export function useActivityEntries(): ActivityEntry[] {
  return useContext(TimelineContext) ?? FALLBACK_ENTRIES;
}

/** The dated activities only: the year popup, its month tiles and year searches never see a dateless entry. */
export function useTimelineEntries(): TimelineEntry[] {
  const entries = useActivityEntries();
  return useMemo(() => entries.filter(hasDates), [entries]);
}
