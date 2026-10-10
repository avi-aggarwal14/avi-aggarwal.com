'use client';
import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

const SPRING = { stiffness: 280, damping: 18, mass: 0.3 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DigitSlot({ n, spring }: { n: number; spring: MotionValue<number> }) {
  const y = useTransform(spring, (v) => `${((((n - v) % 10) + 15) % 10) - 5}00%`);
  return (
    <motion.span className="absolute inset-0 flex items-center justify-center" style={{ y }}>
      {n}
    </motion.span>
  );
}

function Digit({ digit, className }: { digit: number; className?: string }) {
  const target = useRef(digit);
  const spring = useSpring(digit, SPRING);

  useEffect(() => {
    // modulo-10 shortest path: 9 -> 0 rolls forward by one, not back by nine
    const current = ((target.current % 10) + 10) % 10;
    let delta = digit - current;
    if (delta > 5) delta -= 10;
    else if (delta < -5) delta += 10;
    target.current += delta;
    spring.set(target.current);
  }, [digit, spring]);

  return (
    <span className={cn('relative inline-block h-[1em] w-[1ch] overflow-hidden', className)}>
      <span className="invisible">0</span>
      {DIGITS.map((n) => (
        <DigitSlot key={n} n={n} spring={spring} />
      ))}
    </span>
  );
}

type AnimatedNumberProps = { value: number; inline?: boolean; digitClassName?: string };

/** Rolling-digit counter (year heading and "N activities"). Non-digit characters render statically. */
export function AnimatedNumber({ value, inline = false, digitClassName }: AnimatedNumberProps) {
  const chars = String(value).split('');
  return (
    <span className={cn(inline ? 'inline-flex' : 'flex', 'tabular-nums')}>
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <Digit key={`${chars.length}-${i}`} digit={Number(ch)} className={digitClassName} />
        ) : (
          <span key={`${chars.length}-${i}`}>{ch}</span>
        ),
      )}
    </span>
  );
}
