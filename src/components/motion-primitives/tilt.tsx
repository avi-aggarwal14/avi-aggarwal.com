'use client';
// motion-primitives Tilt + the site's content-overlay freeze: while a popup is open the
// rotation is hard-reset to 0 and pointer tracking is ignored; it re-arms 500 ms after close.
import React, { useEffect, useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
  type SpringOptions,
} from 'motion/react';
import { CONTENT_OVERLAY_HIDE, CONTENT_OVERLAY_SHOW } from '@/lib/events';

export type TiltProps = {
  children: React.ReactNode;
  className?: string;
  style?: MotionStyle;
  rotationFactor?: number;
  isReverse?: boolean;
  springOptions?: SpringOptions;
};

export function Tilt({
  children,
  className,
  style,
  rotationFactor = 15,
  isReverse = false,
  springOptions,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frozen = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, springOptions);
  const ySpring = useSpring(y, springOptions);

  const rotateX = useTransform(
    ySpring,
    [-0.5, 0.5],
    isReverse ? [rotationFactor, -rotationFactor] : [-rotationFactor, rotationFactor],
  );
  const rotateY = useTransform(
    xSpring,
    [-0.5, 0.5],
    isReverse ? [-rotationFactor, rotationFactor] : [rotationFactor, -rotationFactor],
  );

  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onHide = () => {
      frozen.current = true;
      x.jump(0);
      y.jump(0);
      xSpring.jump(0);
      ySpring.jump(0);
    };
    const onShow = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        frozen.current = false;
      }, 500);
    };
    window.addEventListener(CONTENT_OVERLAY_HIDE, onHide);
    window.addEventListener(CONTENT_OVERLAY_SHOW, onShow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONTENT_OVERLAY_HIDE, onHide);
      window.removeEventListener(CONTENT_OVERLAY_SHOW, onShow);
    };
  }, [x, y, xSpring, ySpring]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (frozen.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', ...style, transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
