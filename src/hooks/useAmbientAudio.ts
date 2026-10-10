'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { AUDIO_BY_THEME, isTypingTarget } from '@/lib/themes';

const TARGET_VOLUME = 0.35;
const FADE_MS = 1500;

/** Linear rAF volume ramp; returns a cancel function. */
function fadeVolume(el: HTMLAudioElement, target: number, duration: number, onComplete?: () => void) {
  let cancelled = false;
  const startVolume = el.volume;
  const startTime = performance.now();
  const step = (now: number) => {
    if (cancelled) return;
    const p = Math.min((now - startTime) / duration, 1);
    el.volume = Math.min(1, Math.max(0, startVolume + (target - startVolume) * p));
    if (p < 1) requestAnimationFrame(step);
    else onComplete?.();
  };
  requestAnimationFrame(step);
  return () => {
    cancelled = true;
  };
}

/**
 * Ambient audio engine: one looping track per ambient theme, muted by default, never plays before
 * the first user gesture, crossfades between themes (1.5 s in / 1.5 s out), `m` toggles mute.
 */
export function useAmbientAudio() {
  const { resolvedTheme } = useTheme();
  const [muted, setMuted] = useState(true);
  const currentRef = useRef<HTMLAudioElement | null>(null);
  const pendingRef = useRef<string | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);
  const hasInteractedRef = useRef(false);
  const mutedRef = useRef(muted);
  const themeRef = useRef(resolvedTheme);

  useLayoutEffect(() => {
    mutedRef.current = muted;
    themeRef.current = resolvedTheme;
  }, [muted, resolvedTheme]);

  const start = useCallback((themeId: string) => {
    const src = AUDIO_BY_THEME[themeId];
    if (!src) return;
    const previous = currentRef.current;
    pendingRef.current = themeId;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        if (pendingRef.current !== themeId) {
          audio.pause();
          audio.src = '';
          return;
        }
        currentRef.current = audio;
        cancelFadeRef.current?.();
        cancelFadeRef.current = fadeVolume(audio, TARGET_VOLUME, FADE_MS);
        if (previous) {
          fadeVolume(previous, 0, FADE_MS, () => {
            previous.pause();
            previous.src = '';
          });
        }
      })
      .catch(() => {
        audio.src = '';
      });
  }, []);

  const stop = useCallback(() => {
    const el = currentRef.current;
    if (!el || el.paused) return;
    cancelFadeRef.current?.();
    pendingRef.current = null;
    cancelFadeRef.current = fadeVolume(el, 0, FADE_MS, () => {
      el.pause();
      el.src = '';
    });
  }, []);

  // react to theme / mute changes (only after a gesture)
  useEffect(() => {
    if (!resolvedTheme) return;
    if (!hasInteractedRef.current) return;
    if (!AUDIO_BY_THEME[resolvedTheme] || muted) stop();
    else if (pendingRef.current !== resolvedTheme) start(resolvedTheme);
  }, [resolvedTheme, muted, start, stop]);

  // first gesture gate + `m` shortcut + unmount cleanup
  useEffect(() => {
    const onFirstGesture = () => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
      const t = themeRef.current;
      if (t && !mutedRef.current && AUDIO_BY_THEME[t]) start(t);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e)) return;
      if (e.key === 'm') setMuted((m) => !m);
    };
    window.addEventListener('click', onFirstGesture);
    window.addEventListener('keydown', onFirstGesture);
    window.addEventListener('touchstart', onFirstGesture);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
      window.removeEventListener('keydown', onKeyDown);
      cancelFadeRef.current?.();
      if (currentRef.current) {
        currentRef.current.pause();
        currentRef.current.src = '';
      }
    };
  }, [start]);

  return { muted, toggleMuted: () => setMuted((m) => !m) };
}
