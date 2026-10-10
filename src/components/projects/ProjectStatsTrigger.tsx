'use client';
import { Suspense, lazy, startTransition, useEffect, useRef, useState } from 'react';
import { MorphingDialog, MorphingDialogContainer, MorphingDialogContent, MorphingDialogTrigger } from '@/components/motion-primitives/morphing-dialog';
import { PopupClose } from '@/components/popups/popup-shell';
import { OPEN_STATS_DIALOG } from '@/lib/events';

const STATS_TRANSITION = { type: 'spring', bounce: 0, duration: 0.3 } as const;
const StatChart = lazy(() => import('@/components/popups/StatChart'));
const prefetchChart = () => import('@/components/popups/StatChart').catch(() => {});

/** The chart glyph beside the Projects heading and the statistics popup it opens. */
export function ProjectStatsTrigger() {
  const [open, setOpen] = useState(false);
  const openedProgrammatically = useRef(false);

  // warm the chart chunk when the browser is idle
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetchChart);
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(prefetchChart, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      openedProgrammatically.current = true;
      startTransition(() => setOpen(true));
      setTimeout(() => {
        openedProgrammatically.current = false;
      }, 0);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener(OPEN_STATS_DIALOG, onOpen);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener(OPEN_STATS_DIALOG, onOpen);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <MorphingDialog transition={STATS_TRANSITION} open={open} onOpenChange={(next) => setOpen(next && !openedProgrammatically.current)}>
        <MorphingDialogTrigger tabIndex={0} className="flex size-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100">
          <span className="sr-only">Open project statistics</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
            <path d="M1 12 5 7l3 3 3-4 3-3" />
          </svg>
        </MorphingDialogTrigger>
        <MorphingDialogContainer>
          <MorphingDialogContent className="relative w-[95vw] max-w-4xl overflow-hidden squircle-panel bg-zinc-50/50 p-1 shadow-2xl ring-1 ring-zinc-200/50 ring-inset backdrop-blur-xl md:w-[85vw] dark:bg-zinc-900/50 dark:ring-zinc-800/50">
            <div className="w-full rounded-xl px-6 py-8">
              <Suspense fallback={null}>
                <StatChart height={300} />
              </Suspense>
            </div>
          </MorphingDialogContent>
          <PopupClose />
        </MorphingDialogContainer>
      </MorphingDialog>
    </Suspense>
  );
}
