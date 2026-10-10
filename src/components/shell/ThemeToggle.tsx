'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/useMounted';
import { getNextTheme } from '@/lib/themes';
import { siteContent } from '@/content/site-content';

export const FOOTER_BUTTON_CLASS =
  'inline-flex size-7 items-center justify-center rounded-lg transition-colors duration-100 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80';

/** Cycles light → dark → sunny → rain → night → light, spinning the favicon glyph 360° per press. */
export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const reduced = useReducedMotion();
  const [rotation, setRotation] = useState(0);
  if (!mounted) return null;

  const next = getNextTheme(theme ?? 'system');
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      className={FOOTER_BUTTON_CLASS}
      onClick={() => {
        if (!reduced) setRotation((r) => r + 360);
        setTheme(next);
      }}
    >
      <motion.span className="block size-4" initial={false} animate={{ rotate: rotation }} transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}>
        <Image
          src={siteContent.profile.favicon}
          alt="Theme toggle"
          width={16}
          height={16}
          draggable={false}
          className="size-4 opacity-60 brightness-0 dark:brightness-0 dark:invert"
        />
      </motion.span>
    </button>
  );
}
