import { siteContent, type SectionId } from '@/content/site-content';

/** Section heading / nav label derived from the section id ("work" -> "Work"). */
export function sectionTitle(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export type NavSection = { label: string; href: `#${string}`; type: SectionId };

/** Every content section except About/Connect (8 entries): used by the command bar and the header. */
export const NAV_SECTIONS: NavSection[] = siteContent.sections.order
  .filter((id) => id !== 'about' && id !== 'connect')
  .map((id) => ({ label: sectionTitle(id), href: `#${id}` as const, type: id }));

/** The header renders only the first six (`sections.navItems`). */
export const NAV_ITEMS: NavSection[] = NAV_SECTIONS.filter((s) => siteContent.sections.navItems.includes(s.type));

/** Rows or cards shown before "Show more": `sections.visibleCounts[id]`, else the shared `showMoreThreshold`. */
export function visibleCount(id: SectionId): number {
  const { showMoreThreshold, visibleCounts } = siteContent.sections;
  return visibleCounts?.[id] ?? showMoreThreshold;
}
