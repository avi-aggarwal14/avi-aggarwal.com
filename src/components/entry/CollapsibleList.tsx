'use client';
import React, { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EXPAND_FOR_ELEMENT } from '@/lib/events';

export type CollapsibleListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  threshold?: number;
  className?: string;
  itemsClassName?: string;
  renderPlaceholder?: () => ReactNode;
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};
const BASE_DURATION = 0.3;
const STAGGER_STEP = 0.15;
const LAYOUT_EASE = [0.25, 0.1, 0.25, 1] as const;

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** First `threshold` items always; the rest behind a centred "Show more" with staggered reveal. */
export function CollapsibleList<T>({
  items,
  renderItem,
  keyExtractor,
  threshold = 3,
  className,
  itemsClassName,
  renderPlaceholder,
}: CollapsibleListProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingLayout, setIsAnimatingLayout] = useState(false);
  const uid = useId();

  const hasMore = items.length > threshold;
  const visible = useMemo(() => items.slice(0, threshold), [items, threshold]);
  const hidden = useMemo(() => items.slice(threshold), [items, threshold]);
  const hiddenCount = hidden.length;
  const shownCount = isExpanded ? items.length : Math.min(items.length, threshold);
  const layoutDuration = BASE_DURATION + (hiddenCount - 1) * STAGGER_STEP;
  const layoutTransition = { layout: { duration: layoutDuration, ease: LAYOUT_EASE } };

  useEffect(() => {
    const onExpandFor = (event: Event) => {
      const targetId = (event as CustomEvent<{ elementId: string }>).detail?.elementId;
      if (targetId && hidden.some((item) => keyExtractor(item) === targetId) && !isExpanded) {
        setIsExpanded(true);
      }
    };
    window.addEventListener(EXPAND_FOR_ELEMENT, onExpandFor);
    return () => window.removeEventListener(EXPAND_FOR_ELEMENT, onExpandFor);
  }, [hidden, keyExtractor, isExpanded]);

  return (
    <div className={cn(className)}>
      <div className={cn(itemsClassName?.replace('space-y-2', 'gap-2'))}>
        {visible.map((item, i) => (
          <React.Fragment key={keyExtractor(item)}>{renderItem(item, i)}</React.Fragment>
        ))}

        <AnimatePresence initial={false} mode="popLayout">
          {isExpanded &&
            hasMore &&
            hidden.map((item, i) => (
              <motion.div
                key={`${uid}-${keyExtractor(item)}`}
                variants={ITEM_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: BASE_DURATION, delay: STAGGER_STEP * i }}
              >
                {renderItem(item, i + threshold)}
              </motion.div>
            ))}
        </AnimatePresence>

        <AnimatePresence initial={false} mode="popLayout">
          {renderPlaceholder && shownCount % 2 === 1 && (
            <motion.div
              key={`${uid}-placeholder`}
              variants={ITEM_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: BASE_DURATION }}
            >
              {renderPlaceholder()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasMore && (
        <motion.div
          layout
          className="mt-4 flex justify-center"
          transition={layoutTransition}
          onLayoutAnimationComplete={() => setIsAnimatingLayout(false)}
        >
          <motion.button
            layout
            onClick={() => {
              setIsAnimatingLayout(true);
              setIsExpanded((v) => !v);
            }}
            className={cn(
              'flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400/60 transition-all duration-200 dark:text-zinc-500/60',
              !isAnimatingLayout && 'hover:bg-zinc-200/80 hover:text-zinc-500 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-400',
            )}
            aria-expanded={isExpanded}
            aria-controls={`collapsible-${uid}`}
            transition={layoutTransition}
          >
            <span>{isExpanded ? 'Show less' : 'Show more'}</span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
              className="flex h-4 shrink-0 items-center justify-center"
            >
              <ChevronDownIcon className="size-3" />
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
