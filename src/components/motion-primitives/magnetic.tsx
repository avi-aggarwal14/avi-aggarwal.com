'use client';
// motion-primitives Magnetic (earlier API: intensity / range / springOptions, mousemove on
// the wrapper itself). Wrapper carries `will-change-transform` as observed on the site.
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, type SpringOptions } from 'motion/react';

const SPRING_CONFIG: SpringOptions = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

export type MagneticProps = {
  children: React.ReactNode;
  intensity?: number;
  range?: number;
  springOptions?: SpringOptions;
  className?: string;
};

export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  springOptions = SPRING_CONFIG,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx ** 2 + dy ** 2);
    if (dist <= range) {
      const falloff = 1 - dist / range;
      x.set(dx * intensity * falloff);
      y.set(dy * intensity * falloff);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className ?? 'will-change-transform'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}
