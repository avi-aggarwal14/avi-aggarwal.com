'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * The identity name: the page's single h1 on the homepage, a plain block elsewhere (the 404 has its own h1).
 * Tailwind preflight resets heading size, weight and margins, so the box is the same either way.
 */
export function NameHeading({ children }: { children: ReactNode }) {
  return usePathname() === '/' ? <h1>{children}</h1> : <div>{children}</div>;
}
