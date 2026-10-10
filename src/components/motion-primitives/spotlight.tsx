'use client';
// motion-primitives Spotlight, as shipped on the site: reparents its tracking to the parent
// element (forcing `position: relative; overflow: hidden` on it) and swaps the radial
// gradient by theme (white in dark/pre-mount, black in light).
import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, type SpringOptions } from 'motion/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/useMounted';
import { isDarkTheme } from '@/lib/themes';

export type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

const DARK_GRADIENT =
  'radial-gradient(circle at center, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.5) 80%, transparent 80%)';
const LIGHT_GRADIENT =
  'radial-gradient(circle at center, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.4) 80%, transparent 80%)';

export function Spotlight({ className, size = 200, springOptions = { bounce: 0 } }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const dark = !mounted || isDarkTheme(resolvedTheme);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';
    parent.style.overflow = 'hidden';

    const abort = new AbortController();
    const { signal } = abort;
    parent.addEventListener(
      'mousemove',
      (event: MouseEvent) => {
        const { left, top } = parent.getBoundingClientRect();
        mouseX.set(event.clientX - left);
        mouseY.set(event.clientY - top);
      },
      { signal },
    );
    parent.addEventListener('mouseenter', () => setIsHovered(true), { signal });
    parent.addEventListener('mouseleave', () => setIsHovered(false), { signal });
    return () => abort.abort();
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full blur-xl transition-opacity duration-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: dark ? DARK_GRADIENT : LIGHT_GRADIENT,
        left: spotlightLeft,
        top: spotlightTop,
      }}
    />
  );
}
