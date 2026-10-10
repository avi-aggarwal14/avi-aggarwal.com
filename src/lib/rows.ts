import {
  siteContent,
  type AwardEntry,
  type DateRangeFields,
  type EducationEntry,
  type Location,
  type ResearchEntry,
  type TalkEntry,
  type TimelineType,
  type VolunteeringEntry,
  type WorkEntry,
} from '@/content/site-content';
import type { DateFormat } from '@/lib/dates';
import { assertUnreachable } from '@/lib/assert';

/** Normalised row data shared by the six entry sections; `hideDates` rows render no date range. */
export type EntryRowData = {
  id: string;
  type: TimelineType;
  title: string;
  subtitle: string;
  link: string;
  logo: string;
  location: Location;
  description: string;
  wip: boolean;
  dateFormat: DateFormat;
} & DateRangeFields;

export type AnyEntry = WorkEntry | EducationEntry | ResearchEntry | TalkEntry | VolunteeringEntry | AwardEntry;

type Picked = { title: string; subtitle: string; description: string } & DateRangeFields;

/** Copies the dated / dateless discriminant as is, so a dateless entry stays dateless on its row. */
const range = (e: DateRangeFields): DateRangeFields => (e.hideDates ? { hideDates: true, start: '', end: '' } : { start: e.start, end: e.end });

function pick(type: TimelineType, item: AnyEntry): Picked {
  switch (type) {
    case 'work': {
      const e = item as WorkEntry;
      return { title: e.title, subtitle: e.company, description: e.description, ...range(e) };
    }
    case 'education': {
      const e = item as EducationEntry;
      return { title: e.degree, subtitle: e.institution, description: e.description, ...range(e) };
    }
    case 'research': {
      const e = item as ResearchEntry;
      return { title: e.title, subtitle: e.institution, description: e.description, ...range(e) };
    }
    case 'talks': {
      const e = item as TalkEntry;
      return { title: e.title, subtitle: e.event, start: e.date, end: e.date, description: '' };
    }
    case 'volunteering': {
      const e = item as VolunteeringEntry;
      return { title: e.title, subtitle: e.organization, description: e.description, ...range(e) };
    }
    case 'awards': {
      const e = item as AwardEntry;
      return { title: e.title, subtitle: e.organization, description: e.description, ...range(e) };
    }
    default:
      return assertUnreachable(type);
  }
}

/** Map a content collection to rows. Order is preserved exactly (no sorting). `wip` entries are dropped. */
export function toEntryRows(type: TimelineType, items: AnyEntry[]): EntryRowData[] {
  return items
    .filter((item) => !item.wip)
    .map((item) => {
      const location = siteContent.locations[item.locationId];
      if (!location) throw new Error(`Unknown locationId "${item.locationId}" on ${item.id}`);
      return {
        id: item.id,
        type,
        link: item.link,
        logo: item.logo,
        location,
        wip: item.wip,
        dateFormat: 'short-month-year',
        ...pick(type, item),
      };
    });
}
