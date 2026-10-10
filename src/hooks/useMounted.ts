'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** `false` during SSR and hydration, `true` once mounted on the client. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
