'use client';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/sections';
import { scrollToElement } from '@/lib/scroll';
import { CONTENT_OVERLAY_HIDE, CONTENT_OVERLAY_SHOW } from '@/lib/events';
import { siteContent } from '@/content/site-content';

const SCROLL_THRESHOLD = 100;

/** Scroll-spy: highest intersection ratio inside the 20%–30% viewport band wins; only on `/`. */
function useActiveSection() {
  const [active, setActive] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') return;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(best.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    const t = setTimeout(() => {
      document.querySelectorAll('section[id]').forEach((el) => io.observe(el));
    }, 50);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);

  return pathname === '/' ? active : '';
}

const NAV_BASE =
  'w-[95vw] max-w-5xl -translate-x-1/2 transform-gpu squircle-panel border border-zinc-200/20 bg-zinc-100/50 px-6 py-2 shadow-xl shadow-black/15 backdrop-blur-md will-change-transform';
const NAV_DARK = 'dark:border-zinc-500/20 dark:bg-zinc-900/50 dark:shadow-zinc-900/15';
const LOGO_LINK_CLASS = 'flex items-center gap-2 font-medium text-zinc-900 transition-transform hover:scale-105 dark:text-zinc-100';
const MEET_PILL_CLASS =
  'group relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-200 px-2.5 py-1 text-[13px] font-medium text-zinc-900 hover:bg-zinc-900 hover:text-zinc-50 hover:transition-colors hover:duration-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700';

/** Two fixed glass navs (mobile `lg:hidden`, desktop `hidden lg:block`), shown after 100 px of scroll. */
export function GlassHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverlayHidden, setIsOverlayHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const activeSection = useActiveSection();
  const pathname = usePathname();
  const { profile, socials, assets } = siteContent;
  const meet = socials.find((s) => s.label.toLowerCase() === 'meet');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    const onHide = () => {
      setIsOverlayHidden(true);
      setIsScrolled(false);
    };
    const onShow = () => {
      setIsOverlayHidden(false);
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener(CONTENT_OVERLAY_HIDE, onHide);
    window.addEventListener(CONTENT_OVERLAY_SHOW, onShow);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener(CONTENT_OVERLAY_HIDE, onHide);
      window.removeEventListener(CONTENT_OVERLAY_SHOW, onShow);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('click', onDocClick), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', onDocClick);
    };
  }, [isMenuOpen]);

  const handleSectionClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    e.stopPropagation();
    const id = href.substring(1);
    requestAnimationFrame(() => scrollToElement(id, { block: 'start' }));
    setIsMenuOpen(false);
  };

  const stateClasses =
    `${isOverlayHidden ? '' : 'transition-all duration-300'} ` +
    `${isScrolled ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'}`;

  const logo = (wordmarkHeight: number, onClick?: () => void) => (
    <Link href="/" onClick={onClick} className={LOGO_LINK_CLASS}>
      <Image src={profile.avatar} alt={profile.name} width={64} height={64} className="size-7 rounded-full object-cover" draggable={false} />
      <Image src={profile.wordmark} alt={profile.handle} width={120} height={wordmarkHeight} className="h-6 w-auto translate-y-[1.5px] dark:invert" draggable={false} />
    </Link>
  );

  const externalIcon = (
    <Image src={assets.externalLinkIcon} alt="" aria-hidden="true" className="size-3 group-hover:invert dark:invert group-hover:transition-all group-hover:duration-200" width={12} height={12} draggable={false} />
  );

  return (
    <>
      {/* mobile */}
      <nav ref={navRef} aria-label="Site navigation" className={`fixed top-2 left-1/2 z-50 ${NAV_BASE} lg:hidden ${NAV_DARK} ${stateClasses}`}>
        <div>
          <div className="flex items-center justify-between">
            {logo(36, () => {
              if (pathname === '/') {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            })}
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="relative size-7 rounded-full p-0.5 transition-all hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80"
              aria-label="Toggle menu"
            >
              <div className="relative flex size-full items-center justify-center">
                <motion.span animate={{ rotate: isMenuOpen ? 0 : 90 }} transition={{ duration: 0.2, bounce: 0 }} className="absolute h-0.5 w-3.5 bg-zinc-900 dark:bg-zinc-100" />
                <motion.span className="absolute h-0.5 w-3.5 bg-zinc-900 dark:bg-zinc-100" />
              </div>
            </button>
          </div>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, bounce: 0 }}
                className="overflow-hidden"
              >
                <ul className="mt-4 space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={handleSectionClick}
                        className={`block rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                          activeSection === item.href.slice(1)
                            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                            : 'text-zinc-600 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-800/80'
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                  {meet && (
                    <li>
                      <a
                        href={meet.link}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between rounded-full px-3 py-2 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-200/80 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
                      >
                        <span>{meet.label}</span>
                        <Image src={assets.externalLinkIcon} alt="" aria-hidden="true" className="size-3 dark:invert" width={12} height={12} draggable={false} />
                      </a>
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* desktop */}
      <nav aria-label="Site navigation" className={`fixed top-2 left-1/2 z-50 hidden ${NAV_BASE} lg:block ${NAV_DARK} ${stateClasses}`}>
        <div className="relative flex items-center gap-4">
          {logo(48)}
          <ul className="relative mx-auto flex items-center gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.slice(1);
              return (
                <li key={item.href}>
                  <a href={item.href} onClick={handleSectionClick} className="group relative overflow-hidden rounded-full px-3 py-1 text-[13px] font-medium  transition-colors">
                    {isActive ? (
                      <motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-800" style={{ backfaceVisibility: 'hidden' }} />
                    ) : (
                      <span className="pointer-events-none absolute inset-0 rounded-full bg-zinc-200/80 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-800/80" aria-hidden="true" />
                    )}
                    <span className={`relative z-10 will-change-transform ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          {meet && (
            <a href={meet.link} className={MEET_PILL_CLASS}>
              <CalendarDays className="size-3 group-hover:transition-colors group-hover:duration-200" />
              {meet.label}
              <span className="group-hover:transition-all group-hover:duration-200">{externalIcon}</span>
            </a>
          )}
        </div>
      </nav>
    </>
  );
}
