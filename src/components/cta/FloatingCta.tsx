'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BookCallButton, HERO_CTA_ID } from '@/components/cta/BookCallButton';
import { FollowButton } from '@/components/cta/FollowButton';
import { CONTENT_OVERLAY_HIDE, CONTENT_OVERLAY_SHOW } from '@/lib/events';
import { siteContent } from '@/content/site-content';

/** The dock's buttons lift off the page the same way the old pill did. */
const DOCK_SHADOW = 'py-2 shadow-xl shadow-black/15 md:py-1.5 dark:shadow-zinc-900/15';

/**
 * The small dock fixed to the bottom of every page except the booking page itself: the compact booking pill and a
 * compact "Follow" (X) button in one row. Centred on mobile (above the safe area), bottom-right on md+ and, on the
 * homepage, left of the ⌘K hint. On the homepage it stays hidden while the hero button is on screen and slides in
 * once that has scrolled away, so two booking buttons are never on screen together at the top. Like the ⌘K hint it
 * steps aside while a popup is open. The in-flow spacer keeps the last content and the footer reachable above it.
 */
export function FloatingCta() {
  const pathname = usePathname();
  if (pathname.replace(/\/+$/, '') === siteContent.cta.href) return null;
  // keyed by route so the hero state starts fresh on every navigation
  return <FloatingDock key={pathname} isHome={pathname === '/'} />;
}

function FloatingDock({ isHome }: { isHome: boolean }) {
  const reduced = useReducedMotion();
  // on the homepage the hero button is taken to be on screen until the observer reports otherwise (no flash at the top)
  const [heroOnScreen, setHeroOnScreen] = useState(isHome);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const hero = document.getElementById(HERO_CTA_ID);
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setHeroOnScreen(entry.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, [isHome]);

  useEffect(() => {
    const hide = () => setOverlayOpen(true);
    const show = () => setOverlayOpen(false);
    window.addEventListener(CONTENT_OVERLAY_HIDE, hide);
    window.addEventListener(CONTENT_OVERLAY_SHOW, show);
    return () => {
      window.removeEventListener(CONTENT_OVERLAY_HIDE, hide);
      window.removeEventListener(CONTENT_OVERLAY_SHOW, show);
    };
  }, []);

  const show = !heroOnScreen && !overlayOpen;
  const transition = { duration: reduced ? 0 : 0.3, ease: 'easeOut' as const };
  return (
    <>
      {/* in flow: room for the dock under the last content and the footer (plus the safe area on phones) */}
      <div aria-hidden="true" className="h-[calc(3.5rem_+_env(safe-area-inset-bottom))]" />
      <div
        data-floating-cta
        className={`pointer-events-none fixed right-0 left-0 z-40 flex justify-center bottom-[calc(1rem_+_env(safe-area-inset-bottom))] md:bottom-6 md:left-auto ${isHome ? 'md:right-18' : 'md:right-6'}`}
      >
        <AnimatePresence initial={false}>
          {show && (
            <motion.div
              key="floating-cta"
              className="pointer-events-auto"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={transition}
            >
              <div data-floating-dock className="flex items-center gap-2">
                <BookCallButton position="floating" size="md" className={DOCK_SHADOW} />
                <FollowButton network="x" position="follow-x-floating" size="md" short className={DOCK_SHADOW} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
