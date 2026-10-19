'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { Command, Inbox } from 'lucide-react';
import { TextLoop } from '@/components/motion-primitives/text-loop';
import { TextMorph } from '@/components/motion-primitives/text-morph';
import { useActivityEntries } from '@/components/popups/timeline-context';
import { useMounted } from '@/hooks/useMounted';
import { usePopupOverlay } from '@/hooks/usePopupOverlay';
import { formatRange, parseDate, PRESENT } from '@/lib/dates';
import { CLOSE_ALL_POPUPS, CUSTOM_CURSOR_DISABLE, CUSTOM_CURSOR_ENABLE, CUSTOM_CURSOR_RESET, dispatch } from '@/lib/events';
import { getLogoImageClass } from '@/lib/logo-class';
import { scrollToElement } from '@/lib/scroll';
import { sectionColor } from '@/lib/section-colors';
import { NAV_SECTIONS } from '@/lib/sections';
import { ALL_THEMES } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { fireConfetti } from '@/components/shell/confetti';
import { BLOG_ICON, CONFETTI_ICON, NAVIGATION_ICONS, PROJECT_IMAGE_ICON, PROJECT_VIDEO_ICON, SOCIAL_ICONS, THEME_ICONS } from '@/components/shell/command-bar-icons';
import { hasDates, siteContent } from '@/content/site-content';

type ResultType = 'navigation' | 'work' | 'education' | 'research' | 'talks' | 'volunteering' | 'awards' | 'project' | 'blogpost' | 'action' | 'social';

type Result = {
  id: string;
  title: string;
  subtitle?: string;
  type: ResultType;
  icon?: ReactNode;
  logo?: string;
  url?: string;
  keywords?: string[];
  date?: string;
  startDate?: string;
  endDate?: string;
  action: () => void;
};

/** Fixed render order (also the flat index order for arrow navigation). */
const GROUP_ORDER: ResultType[] = ['navigation', 'work', 'education', 'research', 'talks', 'volunteering', 'awards', 'project', 'blogpost', 'action', 'social'];

const GROUP_SYNONYMS: Record<ResultType, string[]> = {
  navigation: ['navigation', 'navigate', 'goto', 'menu'],
  work: ['work', 'job', 'career', 'employment', 'experience'],
  education: ['education', 'school', 'degree', 'university', 'study'],
  research: ['research', 'paper', 'publication', 'study'],
  talks: ['talks', 'speak', 'presentation', 'conference'],
  volunteering: ['volunteering', 'volunteer', 'volunteer work', 'community'],
  awards: ['awards', 'award', 'scholarship', 'fellowship', 'grant', 'honor'],
  project: ['projects', 'portfolio'],
  blogpost: ['blogs', 'posts', 'writings', 'articles'],
  action: ['actions', 'theme', 'settings'],
  social: ['social', 'contact', 'connect', 'follow', 'links'],
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function matches(item: Result, q: string, yearQuery: number | null, matchedTypes: Set<ResultType>, currentYear: number): boolean {
  if (matchedTypes.has(item.type)) return true;
  if (item.title.toLowerCase().includes(q)) return true;
  if (item.subtitle?.toLowerCase().includes(q)) return true;
  if (item.date) {
    if (yearQuery !== null) {
      const startYear = item.startDate ? parseDate(item.startDate).getFullYear() : NaN;
      if (!Number.isNaN(startYear)) {
        const endYear = item.endDate === PRESENT ? currentYear : item.endDate ? parseDate(item.endDate).getFullYear() : NaN;
        if (Number.isNaN(endYear) ? startYear === yearQuery : startYear <= yearQuery && yearQuery <= endYear) return true;
      }
    } else if (item.date.toLowerCase().includes(q)) return true;
  }
  return item.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
}

/** ⌘K command palette: navigation, grouped keyword search, actions and socials. */
export function CommandBar() {
  const mounted = useMounted();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const entries = useActivityEntries();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState({ index: 0, key: '' });
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  usePopupOverlay(isOpen);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setHasTyped(false);
    setIsKeyboardNav(false);
  }, []);

  const goToSection = useCallback(
    (sectionId: string) => {
      close();
      dispatch(CLOSE_ALL_POPUPS);
      setTimeout(() => scrollToElement(sectionId, { block: 'start', highlight: true }), 10);
    },
    [close],
  );
  const goToEntry = useCallback(
    (entryId: string) => {
      close();
      dispatch(CLOSE_ALL_POPUPS);
      setTimeout(() => scrollToElement(entryId, { highlight: true }), 10);
    },
    [close],
  );

  const allItems = useMemo<Result[]>(() => {
    const { projects, writing, socials, commandBar } = siteContent;
    const navigation: Result[] = [...NAV_SECTIONS.map((s) => ({ label: s.label, type: s.type })), { label: capitalise('connect'), type: 'connect' as const }].map((s) => ({
      id: `nav-${s.type}`,
      title: s.label,
      type: 'navigation' as const,
      icon: NAVIGATION_ICONS[s.type],
      keywords: [],
      action: () => goToSection(s.type),
    }));
    const timeline: Result[] = entries.map((e) => ({
      id: e.id,
      title: e.title,
      subtitle: e.subtitle,
      type: e.type as ResultType,
      // dateless (privacy) entries carry no date fields, so year queries never match them
      ...(hasDates(e) ? { date: formatRange(e.start, e.end), startDate: e.start, endDate: e.end } : {}),
      logo: e.logo,
      keywords: e.keywords,
      action: () => goToEntry(e.id),
    }));
    const projectItems: Result[] = projects
      .filter((p) => !p.hide)
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.description,
        type: 'project' as const,
        url: p.link,
        keywords: p.keywords,
        icon: p.videos?.length ? PROJECT_VIDEO_ICON : PROJECT_IMAGE_ICON,
        action: () => goToEntry(p.id),
      }));
    const posts: Result[] = writing
      .filter((post) => !post.wip && post.title !== 'Coming Soon')
      .map((post) => ({
        id: post.uid,
        title: post.title,
        subtitle: post.description,
        type: 'blogpost' as const,
        url: post.link,
        keywords: post.keywords,
        icon: BLOG_ICON,
        action: () => {
          router.push(post.link);
          close();
        },
      }));
    const current = theme ?? resolvedTheme ?? 'light';
    const actions: Result[] = [
      {
        id: 'action-confetti',
        title: 'Celebrate',
        subtitle: 'Trigger confetti',
        type: 'action',
        icon: CONFETTI_ICON,
        keywords: ['confetti', 'celebrate', 'celebration', 'party', 'fun'],
        action: () => {
          fireConfetti();
          close();
        },
      },
      ...ALL_THEMES.filter((t) => t !== 'system' && t !== current).map((t) => ({
        id: `action-theme-${t}`,
        title: `Switch to ${capitalise(t)} Mode`,
        subtitle: 'Change color theme',
        type: 'action' as const,
        icon: THEME_ICONS[t],
        keywords: ['theme', t, 'mode', 'color', 'appearance'],
        action: () => {
          setTheme(t);
          close();
        },
      })),
    ];
    const socialItems: Result[] = socials.map((s) => ({
      id: s.id,
      title: s.label,
      subtitle: 'Open in new tab',
      type: 'social' as const,
      url: s.link,
      icon: SOCIAL_ICONS[s.label],
      keywords: s.keywords,
      action: () => window.open(s.link, '_blank'),
    }));
    void commandBar;
    return [...navigation, ...timeline, ...projectItems, ...posts, ...actions, ...socialItems];
  }, [entries, theme, resolvedTheme, setTheme, router, close, goToSection, goToEntry]);

  const results = useMemo(() => {
    if (!query) return allItems;
    const q = query.trim().toLowerCase();
    const yearQuery = /^\d{4}$/.test(q) ? parseInt(q, 10) : null;
    const matchedTypes = new Set<ResultType>();
    for (const [type, synonyms] of Object.entries(GROUP_SYNONYMS) as [ResultType, string[]][]) {
      if (synonyms.some((syn) => syn.startsWith(q) || syn.includes(q) || q.includes(syn))) matchedTypes.add(type);
    }
    const currentYear = new Date().getFullYear();
    return allItems.filter((item) => matches(item, q, yearQuery, matchedTypes, currentYear));
  }, [allItems, query]);

  const grouped = useMemo(() => {
    const groups = new Map<ResultType, Result[]>(GROUP_ORDER.map((g) => [g, []]));
    for (const r of results) groups.get(r.type)?.push(r);
    return groups;
  }, [results]);
  const flatResults = useMemo(() => GROUP_ORDER.flatMap((g) => grouped.get(g) ?? []), [grouped]);
  const resultsKey = flatResults.map((r) => r.id).join('|');
  const selectedIndex = selection.key === resultsKey ? selection.index : 0;
  const select = (index: number) => setSelection({ index, key: resultsKey });

  const onSelect = useCallback(
    (item: Result) => {
      item.action();
      if (item.type !== 'action') close();
    },
    [close],
  );

  const toggle = useCallback(() => {
    setIsOpen((open) => {
      if (open) return false;
      setQuery('');
      return true;
    });
  }, []);

  // 6.1 global listener (capture phase)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
        return;
      }
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      } else if (e.key === 'ArrowDown' && flatResults.length) {
        e.preventDefault();
        setIsKeyboardNav(true);
        select(Math.min(selectedIndex + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp' && flatResults.length) {
        e.preventDefault();
        setIsKeyboardNav(true);
        select(Math.max(selectedIndex - 1, 0));
      } else if (e.key === 'Enter' && flatResults.length) {
        e.preventDefault();
        onSelect(flatResults[selectedIndex]);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  });

  // 6.2 keep the selected row visible during keyboard navigation
  useEffect(() => {
    if (!isOpen || !isKeyboardNav) return;
    const container = resultsRef.current;
    if (!container) return;
    if (selectedIndex === 0) container.scrollTop = 0;
    else if (selectedIndex === flatResults.length - 1) container.scrollTop = container.scrollHeight - container.clientHeight;
    else {
      const row = container.querySelectorAll('button')[selectedIndex];
      if (!row) return;
      const c = container.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      if (r.top < c.top) container.scrollTop += r.top - c.top - 8;
      else if (r.bottom > c.bottom) container.scrollTop += r.bottom - c.bottom + 8;
    }
  }, [isOpen, isKeyboardNav, selectedIndex, flatResults.length]);

  // 6.3 first mouse move hands control back to the pointer
  useEffect(() => {
    if (!isOpen) return;
    const onMove = () => {
      setIsKeyboardNav(false);
      setHasTyped(false);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [isOpen]);

  // 7.2 custom cursor coordination
  useEffect(() => {
    if (isOpen && (isKeyboardNav || hasTyped)) {
      dispatch(CUSTOM_CURSOR_DISABLE);
      document.body.classList.remove('regular-cursor-enabled');
    } else if (isOpen && !isKeyboardNav && !hasTyped) {
      dispatch(CUSTOM_CURSOR_ENABLE);
    }
  }, [isOpen, isKeyboardNav, hasTyped]);

  if (!mounted) return null;

  const handleMouseEnter = (i: number) => {
    if (!isKeyboardNav) select(i);
  };
  const handleMouseMove = (i: number) => {
    if (!isKeyboardNav && i !== selectedIndex) select(i);
  };
  const onBackdropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  };

  const { commandBar } = siteContent;

  return createPortal(
    <AnimatePresence onExitComplete={() => dispatch(CUSTOM_CURSOR_RESET)}>
      {isOpen && (
        <>
          <motion.div
            key="cmdk-backdrop"
            className="fixed inset-0 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={onBackdropMouseDown}
          />
          <div key="cmdk-layer" className="fixed inset-0 z-50 flex items-start justify-center pt-[25vh]" onMouseDown={onBackdropMouseDown}>
            <motion.div
              className="relative w-full max-w-2xl overflow-hidden squircle-panel border border-zinc-200/20 bg-zinc-100/80 shadow-xl shadow-black/15 backdrop-blur-md dark:border-zinc-500/20 dark:bg-zinc-900/80 dark:shadow-zinc-900/15"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="relative size-full">
                <div className="relative px-2 pt-2">
                  <div className="relative rounded-full bg-zinc-200/80 dark:bg-zinc-800/80">
                    {query ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center px-4">
                        <TextMorph as="div" className="font-normal text-zinc-900 dark:text-zinc-100">
                          {query}
                        </TextMorph>
                      </div>
                    ) : (
                      <div className="pointer-events-none absolute inset-0 flex items-center px-4">
                        <span className="inline-flex items-center font-normal text-zinc-600 dark:text-zinc-400">
                          Search for
                          <TextLoop className="ml-2.5 overflow-y-clip" interval={3} transition={{ type: 'spring', stiffness: 180, damping: 15, mass: 0.5 }}>
                            {commandBar.placeholders.map((word) => (
                              <span key={word}>{word}...</span>
                            ))}
                          </TextLoop>
                        </span>
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder=""
                      autoFocus
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setHasTyped(true);
                        setIsKeyboardNav(true);
                      }}
                      className={cn(
                        'w-full bg-transparent px-4 py-3 font-normal focus:outline-none caret-zinc-900 dark:caret-zinc-100',
                        query ? 'text-transparent' : 'text-zinc-900 dark:text-zinc-100',
                      )}
                    />
                  </div>
                </div>
                <div className="relative">
                  {flatResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-5.5">
                      <Inbox className="size-4 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-sm text-zinc-400 dark:text-zinc-500">No results</span>
                    </div>
                  ) : (
                    <div ref={resultsRef} className="max-h-[30vh] overflow-y-auto px-2 scroll-p-0.5">
                      <div className="py-2">
                        {GROUP_ORDER.map((group) => {
                          const items = grouped.get(group) ?? [];
                          if (items.length === 0) return null;
                          const base = flatResults.findIndex((r) => r.type === group);
                          return (
                            <div key={group}>
                              <div className="px-3 py-2">
                                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{commandBar.groupLabels[group] ?? capitalise(group)}</p>
                              </div>
                              <div>
                                {items.map((result, i) => {
                                  const index = base + i;
                                  const selected = index === selectedIndex;
                                  const color = sectionColor(result.type);
                                  const displaySubtitle =
                                    result.type === 'project' && result.subtitle ? `${result.subtitle.split(' ').slice(0, 6).join(' ')}...` : result.subtitle;
                                  return (
                                    <button
                                      key={result.id}
                                      type="button"
                                      className={cn('group relative flex w-full items-center gap-3 rounded-full px-3 py-2 text-left', selected && 'bg-zinc-200 dark:bg-zinc-800')}
                                      onClick={() => onSelect(result)}
                                      onMouseEnter={() => handleMouseEnter(index)}
                                      onMouseMove={() => handleMouseMove(index)}
                                    >
                                      {result.logo ? (
                                        <span className="flex size-6 shrink-0 items-center justify-center">
                                          <Image src={result.logo} alt={`${result.subtitle ?? result.title} logo`} width={20} height={20} draggable={false} className={getLogoImageClass(result.logo, false, 'timeline')} />
                                        </span>
                                      ) : !result.icon && color.badge ? (
                                        <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium', color.badge)}>{color.label}</span>
                                      ) : (
                                        <span className={cn('flex size-6 shrink-0 items-center justify-center', selected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500')}>
                                          {result.icon ?? <Command className="size-4" />}
                                        </span>
                                      )}
                                      <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <span className="truncate pr-px font-normal text-zinc-900 dark:text-zinc-100">{result.title}</span>
                                        {displaySubtitle ? (
                                          <>
                                            <span className="text-zinc-400 dark:text-zinc-500">·</span>
                                            <span className="truncate text-sm text-zinc-600 dark:text-zinc-400">{displaySubtitle}</span>
                                          </>
                                        ) : null}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
