'use client';
import { useTheme } from 'next-themes';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { useMounted } from '@/hooks/useMounted';
import { FOOTER_BUTTON_CLASS } from '@/components/shell/ThemeToggle';
import { getThemeConfig } from '@/lib/themes';

const ICON_CLASS = 'size-4 opacity-60 brightness-0 dark:brightness-0 dark:invert';

/** Speaker with a cross (muted) / with three arcs (unmuted); only shown while the theme has an audio track. */
export function MuteButton() {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const { muted, toggleMuted } = useAmbientAudio();
  if (!mounted || !resolvedTheme || !getThemeConfig(resolvedTheme)?.audio) return null;

  return (
    <button type="button" aria-label={muted ? 'Unmute music' : 'Mute music'} className={FOOTER_BUTTON_CLASS} onClick={toggleMuted}>
      {muted ? (
        <svg viewBox="0 0 16 16" className={ICON_CLASS} fill="currentColor" aria-hidden="true">
          <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className={ICON_CLASS} fill="currentColor" aria-hidden="true">
          <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z" />
          <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z" />
          <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475z" />
          <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06" />
        </svg>
      )}
    </button>
  );
}
