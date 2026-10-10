'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/useMounted';
import { getThemeConfig } from '@/lib/themes';

/** Full-bleed looping background video for the ambient themes (sunny / rain / night). */
export function ThemeOverlay() {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const config = resolvedTheme ? getThemeConfig(resolvedTheme) : undefined;
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = config?.video;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoSrc) return;
    if (el.getAttribute('src') !== videoSrc) el.setAttribute('src', videoSrc);
    el.muted = true;
    el.setAttribute('muted', '');
    el.play().catch(() => {});
    return () => {
      el.pause();
      el.removeAttribute('src');
      el.load();
    };
  }, [videoSrc, mounted]);

  if (!mounted || !config) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video
        key={config.id}
        ref={videoRef}
        src={config.video}
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover transition-opacity duration-300"
      />
    </div>
  );
}
