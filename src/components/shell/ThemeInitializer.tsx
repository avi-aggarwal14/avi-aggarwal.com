'use client';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ALL_THEMES, THEME_KEY_SHORTCUTS, THEME_STORAGE_KEY, isTypingTarget } from '@/lib/themes';

/**
 * Renders nothing. Repairs a corrupted/stale `localStorage.theme` once on mount and maps the
 * single-letter keys (a l d s r n) to themes, ignoring modifiers and text inputs.
 */
export function ThemeInitializer() {
  const { setTheme } = useTheme();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored || !ALL_THEMES.includes(stored)) setTheme('system');
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;
      const next = THEME_KEY_SHORTCUTS[event.key];
      if (next) setTheme(next);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setTheme]);

  return null;
}
