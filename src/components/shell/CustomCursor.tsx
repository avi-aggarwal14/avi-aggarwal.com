'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useTheme } from 'next-themes';
import { isDarkTheme } from '@/lib/themes';
import { CUSTOM_CURSOR_DISABLE, CUSTOM_CURSOR_ENABLE, CUSTOM_CURSOR_RESET } from '@/lib/events';

const SPRING = { stiffness: 200, damping: 20, mass: 0.3 };
const SIZE_SPRING = { type: 'spring', bounce: 0.001, duration: 0.5 } as const;
const REGULAR = 'regular-cursor-enabled';
const SCROLLBAR_BAND = 20;

const isTouchDevice = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/** Global spring-following dot that swaps into a "More +" pill over `.cursor-zoom-in` content. */
export function CustomCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, SPRING);
  const springY = useSpring(mouseY, SPRING);

  const [isOverInteractive, setIsOverInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHidden, setIsHidden] = useState(isTouchDevice);
  const [hasMoved, setHasMoved] = useState(false);
  const [isForceDisabled, setIsForceDisabled] = useState(false);
  const [isOverScrollbar, setIsOverScrollbar] = useState(false);
  const [isZoomIn, setIsZoomIn] = useState(false);
  const [isMagneticSocial, setIsMagneticSocial] = useState(false);
  const [isOverInput, setIsOverInput] = useState(false);
  const [isOverEmbed, setIsOverEmbed] = useState(false);
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [, setIsScrolling] = useState(false);

  // Mirrors of state for listeners registered once (written in handlers, never during render).
  const isTouchRef = useRef(false);
  const forceDisabledRef = useRef(false);
  const scrollingRef = useRef(false);
  const { resolvedTheme } = useTheme();

  const resolve = useCallback((el: Element | null) => {
    setIsOverInteractive(!!el?.closest('a, button, .cursor-pointer'));
    setIsZoomIn(!!el?.closest('.cursor-zoom-in'));
    setIsMagneticSocial(!!el?.closest('.magnetic-social-link'));
    setIsOverInput(!!el?.closest('input, textarea, [contenteditable="true"]'));
    const inMap = !!el?.closest('.maplibregl-map');
    setIsMapInteractive(inMap && !!el?.closest('.maplibregl-marker, button'));
    setIsOverEmbed(inMap || !!el?.closest('iframe, video, canvas'));
  }, []);

  // 4.1 mousemove + 4.3 scrollbar detection
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setHasMoved(true);
      resolve(document.elementFromPoint(e.clientX, e.clientY));

      const target = e.target;
      if (target instanceof Element) {
        const cs = getComputedStyle(target);
        const scrollable =
          (cs.overflowY === 'auto' || cs.overflowY === 'scroll' || cs.overflowX === 'auto' || cs.overflowX === 'scroll') &&
          (target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth);
        if (scrollable) {
          const r = target.getBoundingClientRect();
          setIsOverScrollbar(e.clientX > r.right - SCROLLBAR_BAND || e.clientY > r.bottom - SCROLLBAR_BAND);
        } else {
          setIsOverScrollbar(false);
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY, resolve]);

  // 4.2 document enter/leave + press
  useEffect(() => {
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) setIsHidden(true);
    };
    const onEnter = () => {
      if (!forceDisabledRef.current && !isTouchRef.current) setIsHidden(false);
    };
    const onDown = () => setIsPressed(true);
    const onUp = () => setIsPressed(false);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // 4.4 scroll suppression
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastMoveAt = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMove = () => {
      lastMoveAt = Date.now();
    };
    const onScroll = () => {
      const y = window.scrollY;
      const sinceMove = Date.now() - lastMoveAt;
      if (Math.abs(y - lastScrollY) > 1 && sinceMove > 100) {
        scrollingRef.current = true;
        setIsScrolling(true);
      }
      lastScrollY = y;
      clearTimeout(timer);
      timer = setTimeout(() => {
        scrollingRef.current = false;
        setIsScrolling(false);
      }, 150);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // 4.5 pointer events
  useEffect(() => {
    const onOver = (e: PointerEvent) => {
      if (e.target instanceof Element && !scrollingRef.current) resolve(e.target);
    };
    const onOut = (e: PointerEvent) => resolve(e.relatedTarget instanceof Element ? e.relatedTarget : null);
    const onUp = (e: PointerEvent) => {
      if (e.target instanceof Element) resolve(e.target);
    };
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerup', onUp);
    };
  }, [resolve]);

  // 4.6 touch detection (latched)
  useEffect(() => {
    if (isTouchDevice()) isTouchRef.current = true;
  }, []);

  // 4.7 window events
  useEffect(() => {
    let raf = 0;
    const refresh = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => resolve(document.elementFromPoint(mouseX.get(), mouseY.get())));
    };
    const onDisable = () => {
      forceDisabledRef.current = true;
      setIsHidden(true);
      setIsForceDisabled(true);
      document.body.classList.add(REGULAR);
    };
    const onEnable = () => {
      if (isTouchRef.current) return;
      forceDisabledRef.current = false;
      setIsHidden(false);
      setIsForceDisabled(false);
      document.body.classList.remove(REGULAR);
      refresh();
    };
    const onReset = () => {
      setIsPressed(false);
      setIsOverScrollbar(false);
      refresh();
    };
    window.addEventListener(CUSTOM_CURSOR_DISABLE, onDisable);
    window.addEventListener(CUSTOM_CURSOR_ENABLE, onEnable);
    window.addEventListener(CUSTOM_CURSOR_RESET, onReset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(CUSTOM_CURSOR_DISABLE, onDisable);
      window.removeEventListener(CUSTOM_CURSOR_ENABLE, onEnable);
      window.removeEventListener(CUSTOM_CURSOR_RESET, onReset);
      document.body.classList.remove(REGULAR);
    };
  }, [mouseX, mouseY, resolve]);

  // 4.8 native-cursor restore
  useEffect(() => {
    if (isForceDisabled || isOverScrollbar || isMapInteractive) document.body.classList.add(REGULAR);
    else document.body.classList.remove(REGULAR);
  }, [isForceDisabled, isOverScrollbar, isMapInteractive]);

  // 5 derived values
  const scale = isPressed && isOverInteractive ? 2.25 : isPressed ? 1.75 : isOverInteractive ? 1.5 : 1;
  const opacity = isOverInteractive ? 0.7 : 1;
  const isDark = isDarkTheme(resolvedTheme);
  const invert = isMagneticSocial && !isDark;
  const ink = invert || isDark ? 'white' : 'black';
  const inkFaint = invert || isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)';

  if (isHidden || !hasMoved || isOverScrollbar || isOverInput || isOverEmbed) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-9999 will-change-transform"
      style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
    >
      <motion.div
        animate={{ width: isZoomIn ? 64 : 8, height: isZoomIn ? 26 : 8, scale: isZoomIn ? 1 : scale }}
        transition={{ width: SIZE_SPRING, height: SIZE_SPRING, scale: { duration: 0.5 } }}
        className={
          isZoomIn
            ? 'flex items-center justify-center rounded-full bg-gray-500/40 backdrop-blur-md dark:bg-gray-300/40'
            : 'flex items-center justify-center rounded-full'
        }
        style={{
          backgroundColor: isZoomIn ? undefined : isOverInteractive ? inkFaint : ink,
          border: !isZoomIn && isOverInteractive ? `0.25px solid ${ink}` : 'none',
          opacity: isZoomIn ? 1 : opacity,
          transition: 'opacity 0.3s, border 0.3s, background-color 0.3s',
        }}
      >
        <AnimatePresence>
          {isZoomIn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="inline-flex w-full items-center justify-center"
            >
              <div className="inline-flex items-center text-xs font-medium text-white dark:text-black">More +</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
