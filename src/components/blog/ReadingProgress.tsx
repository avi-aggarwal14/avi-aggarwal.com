'use client';
import { motion, useScroll } from 'motion/react';

/** 2px reading-progress bar driven by scrollYProgress. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="inset-x-0 origin-left fixed top-0 z-20 h-0.5 bg-gray-300 dark:bg-zinc-600" style={{ scaleX: scrollYProgress }} />;
}
