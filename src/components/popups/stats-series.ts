import data from '@/content/project-stats.json';

export type StatRow = { date: string } & Record<string, number | string>;
export type SeriesAxis = 'stars' | 'downloads';
export type SeriesIcon = 'github' | 'npm' | null;
export type SeriesMeta = { label: string; icon: SeriesIcon; axis: SeriesAxis; color: { light: string; dark: string } };

/**
 * Chart metadata keyed by project URL (register new series here when the dataset grows).
 * Star series are deliberately absent: every repository star is Avi's own, so only npm downloads are charted.
 */
export const SERIES_META: Record<string, SeriesMeta> = {
  'https://www.npmjs.com/package/dare-mcp-server': { label: 'dare-mcp-server', icon: 'npm', axis: 'downloads', color: { light: '#fdba74', dark: '#fdba74' } },
};

export const STAT_ROWS = data as StatRow[];

/** Source glyph (tinted via mask) by URL prefix. */
export function sourceIconFor(url: string): SeriesIcon {
  if (url.startsWith('https://github.com')) return 'github';
  if (url.startsWith('https://www.npmjs.com')) return 'npm';
  return null;
}

export function seriesMeta(url: string): SeriesMeta {
  const icon = sourceIconFor(url);
  return SERIES_META[url] ?? { label: url, icon, axis: icon === 'github' ? 'stars' : 'downloads', color: { light: '#71717a', dark: '#a1a1aa' } };
}

/** Latest non-negative finite value for a URL, or null. */
export function latestValue(url: string): number | null {
  for (let i = STAT_ROWS.length - 1; i >= 0; i--) {
    const v = STAT_ROWS[i][url];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return v;
  }
  return null;
}

/** Provider table for the inline stat row in the project preview dialog. */
export const STAT_PROVIDERS: { host: string; label: string; metric: 'stars' | 'downloads' }[] = [
  { host: 'github.com', label: 'GitHub stars', metric: 'stars' },
  { host: 'npmjs.com', label: 'npm downloads', metric: 'downloads' },
];

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
