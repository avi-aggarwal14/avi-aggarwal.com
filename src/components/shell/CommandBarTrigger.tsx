'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CONTENT_OVERLAY_HIDE, CONTENT_OVERLAY_SHOW } from '@/lib/events';

/** Floating "⌘ K" hint (md+). Clicking synthesises the keyboard shortcut instead of calling the palette directly. */
export function CommandBarTrigger() {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const hide = () => setShowHint(false);
    const show = () => setShowHint(true);
    window.addEventListener(CONTENT_OVERLAY_HIDE, hide);
    window.addEventListener(CONTENT_OVERLAY_SHOW, show);
    return () => {
      window.removeEventListener(CONTENT_OVERLAY_HIDE, hide);
      window.removeEventListener(CONTENT_OVERLAY_SHOW, show);
    };
  }, []);

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          key="keyboard-hint"
          className="fixed right-6 bottom-6 z-40 hidden md:block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5, ease: 'easeOut' } }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          whileHover={{ y: -5 }}
        >
          <button
            aria-label="Open command palette"
            className="group flex items-center gap-1 rounded-lg bg-zinc-100/50 px-2 py-1.5 shadow-sm ring-1 ring-zinc-900/5 backdrop-blur-sm transition-all hover:bg-zinc-100/80 hover:shadow dark:bg-zinc-800/50 dark:ring-white/5 dark:hover:bg-zinc-800/80"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          >
            <kbd className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">⌘ K</kbd>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
