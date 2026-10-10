import { siteContent, type CustomTheme } from '@/content/site-content';

/** Ambient themes (video + audio + base colour mode). Content-driven. */
export const CUSTOM_THEMES: CustomTheme[] = siteContent.themes.custom;

/** `['system','light','dark','sunny','rain','night']` */
export const ALL_THEMES: string[] = siteContent.themes.list;

/** Toggle order; `system` is excluded: `['light','dark','sunny','rain','night']` */
export const CYCLE_THEMES: string[] = siteContent.themes.cycleOrder;

export const THEME_STORAGE_KEY = siteContent.themes.storageKey;
export const DEFAULT_THEME = siteContent.themes.defaultTheme;

export function getThemeConfig(id?: string | null): CustomTheme | undefined {
  return CUSTOM_THEMES.find((t) => t.id === id);
}

/**
 * system -> dark, light -> dark, dark -> sunny, sunny -> rain, rain -> night, night -> light.
 * Unknown ids (including `system`) collapse to index 0, hence `system -> dark`.
 */
export function getNextTheme(current: string): string {
  let i = CYCLE_THEMES.indexOf(current);
  if (i === -1) i = 0;
  return CYCLE_THEMES[(i + 1) % CYCLE_THEMES.length];
}

/** `true` only for `dark` and ambient themes whose `baseTheme` is dark (`night`). */
export function isDarkTheme(id?: string | null): boolean {
  return Boolean(id) && (id === 'dark' || getThemeConfig(id)?.baseTheme === 'dark');
}

/** Single-key shortcuts: a(uto) l d plus the first letter of each ambient theme id. */
export const THEME_KEY_SHORTCUTS: Record<string, string> = {
  a: 'system',
  l: 'light',
  d: 'dark',
  ...Object.fromEntries(CUSTOM_THEMES.map((t) => [t.id[0], t.id])),
};

/** Audio track per ambient theme id. */
export const AUDIO_BY_THEME: Record<string, string> = Object.fromEntries(
  CUSTOM_THEMES.filter((t) => t.audio).map((t) => [t.id, t.audio]),
);

/** `true` when a keydown should be ignored by single-key shortcuts (modifier held or typing). */
export function isTypingTarget(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return true;
  const t = event.target;
  return (
    t instanceof HTMLInputElement ||
    t instanceof HTMLTextAreaElement ||
    (t instanceof HTMLElement && t.isContentEditable)
  );
}
