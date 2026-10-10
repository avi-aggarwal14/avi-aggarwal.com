'use client';
// motion-primitives MorphingDialog, adapted to the site's observed popup contract:
// controlled `open`/`onOpenChange`, `close-all-popups`, reference-counted body scroll lock
// (`usePopupOverlay`), div trigger with role=button, z-40 blurred backdrop, Escape that
// respects `defaultPrevented`, mousedown/touchstart outside-click, focus trap + restore.
import React, { useCallback, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion, type Transition, type Variant } from 'motion/react';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/useMounted';
import useClickOutside from '@/hooks/useClickOutside';
import { usePopupOverlay } from '@/hooks/usePopupOverlay';
import { CLOSE_ALL_POPUPS } from '@/lib/events';

export type MorphingDialogContextType = {
  isOpen: boolean;
  setIsOpen: (next: boolean) => void;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLDivElement | null>;
};

const MorphingDialogContext = React.createContext<MorphingDialogContextType | null>(null);

export function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);
  if (!context) throw new Error('useMorphingDialog must be used within a MorphingDialog');
  return context;
}

export type MorphingDialogProps = {
  children: React.ReactNode;
  transition?: Transition;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional stable id (defaults to React's useId). */
  id?: string;
};

function MorphingDialog({ children, transition, open, onOpenChange, id }: MorphingDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const reactId = useId();
  const uniqueId = id ?? reactId;
  const triggerRef = useRef<HTMLDivElement>(null);

  const setIsOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    const close = () => setIsOpen(false);
    window.addEventListener(CLOSE_ALL_POPUPS, close);
    return () => window.removeEventListener(CLOSE_ALL_POPUPS, close);
  }, [setIsOpen]);

  usePopupOverlay(isOpen);

  const contextValue = useMemo(
    () => ({ isOpen, setIsOpen, uniqueId, triggerRef }),
    [isOpen, setIsOpen, uniqueId],
  );

  return (
    <MorphingDialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </MorphingDialogContext.Provider>
  );
}

export type MorphingDialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  onPointerEnter?: React.PointerEventHandler<HTMLDivElement>;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
};

function MorphingDialogTrigger({
  children,
  className,
  style,
  tabIndex,
  onPointerEnter,
  onPointerDown,
  onFocus,
}: MorphingDialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();

  const handleClick = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen],
  );

  return (
    <motion.div
      ref={triggerRef}
      layoutId={`dialog-${uniqueId}`}
      className={cn('relative cursor-pointer', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={onPointerEnter}
      onPointerDown={onPointerDown}
      onFocus={onFocus}
      style={style}
      tabIndex={tabIndex}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export type MorphingDialogContentProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogContent({ children, className, style }: MorphingDialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (event.defaultPrevented) return;
        setIsOpen(false);
        return;
      }
      if (event.key === 'Tab') {
        const focusable = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    containerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      trigger?.focus();
    };
  }, [isOpen, triggerRef]);

  const onOutside = useCallback(() => {
    if (isOpen) setIsOpen(false);
  }, [isOpen, setIsOpen]);
  useClickOutside(containerRef, onOutside);

  return (
    <motion.div
      ref={containerRef}
      layoutId={`dialog-${uniqueId}`}
      className={cn('overflow-hidden', className)}
      style={style}
      role="dialog"
      aria-modal="true"
      id={`motion-ui-morphing-dialog-content-${uniqueId}`}
      aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
      aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogContainerProps = {
  children: React.ReactNode;
};

function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
  const { isOpen, uniqueId } = useMorphingDialog();
  const mounted = useMounted();
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className="fixed inset-0 z-40 size-full bg-white/40 backdrop-blur-xs dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">{children}</div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export type MorphingDialogCloseProps = {
  children?: React.ReactNode;
  className?: string;
  variants?: { initial: Variant; animate: Variant; exit: Variant };
};

function MorphingDialogClose({ children, className, variants }: MorphingDialogCloseProps) {
  const { setIsOpen, uniqueId } = useMorphingDialog();
  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

  return (
    <motion.button
      onClick={handleClose}
      type="button"
      aria-label="Close dialog"
      key={`dialog-close-${uniqueId}`}
      className={cn('absolute top-6 right-6', className)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children || <XIcon size={24} />}
    </motion.button>
  );
}

export { MorphingDialog, MorphingDialogTrigger, MorphingDialogContainer, MorphingDialogContent, MorphingDialogClose };
