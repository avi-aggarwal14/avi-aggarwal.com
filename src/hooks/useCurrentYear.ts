'use client';
import { useSyncExternalStore } from 'react';

/** Server/pre-hydration value; the client corrects it on mount (deliberate one-frame swap). */
const FALLBACK_YEAR = 2025;
const subscribe = () => () => {};

export function useCurrentYear() {
  return useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => FALLBACK_YEAR);
}
