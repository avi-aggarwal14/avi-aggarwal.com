'use client';
import { XIcon } from 'lucide-react';
import { MorphingDialogClose } from '@/components/motion-primitives/morphing-dialog';

/** Panel classes shared by the year, location and statistics popups. */
export const POPUP_PANEL =
  'relative w-[95vw] max-w-4xl squircle-panel bg-zinc-50/50 p-1 shadow-2xl ring-1 ring-zinc-200/50 ring-inset backdrop-blur-xl md:w-[85vw] dark:bg-zinc-900/50 dark:ring-zinc-800/50';

export const CLOSE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.3, duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

/** The fixed top-right close button used by every popup. */
export function PopupClose() {
  return (
    <MorphingDialogClose
      className="group fixed top-4 right-4 flex size-7 items-center justify-center rounded-full bg-zinc-100/50 backdrop-blur-sm hover:bg-zinc-200/80 hover:transition-colors hover:duration-150 md:top-6 md:right-6 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/80"
      variants={CLOSE_VARIANTS}
    >
      <XIcon className="size-4 text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100" />
    </MorphingDialogClose>
  );
}
