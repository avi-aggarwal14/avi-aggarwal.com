'use client';
import { useSyncExternalStore } from 'react';
import { siteContent } from '@/content/site-content';
import { cn } from '@/lib/utils';

const { timeZone, text } = siteContent.cta.localTime;
const [before, after] = text.split('{time}');
const formatter = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone });

/** "4:33 pm": built from parts so the am/pm is always lowercase and plain, whatever the ICU build puts between them. */
function formatNow(): string {
  const parts = formatter.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('hour')}:${get('minute')} ${get('dayPeriod').toLowerCase().replace(/\./g, '')}`;
}

/** Wakes the subscriber at the next minute boundary, then every minute. */
function subscribe(onChange: () => void) {
  let interval: ReturnType<typeof setInterval> | undefined;
  const timeout = setTimeout(() => {
    onChange();
    interval = setInterval(onChange, 60_000);
  }, 60_000 - (Date.now() % 60_000) + 20);
  return () => {
    clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
}
const getServerSnapshot = () => null;

/**
 * The live local time line under the hero cluster: a green dot, then "{time} in London" in the content's time zone,
 * updated each minute. The server (and the hydration pass) render the line without a time, so there is never a
 * mismatch; the box keeps its height so nothing jumps when the time appears.
 */
export function LocalTime({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, formatNow, getServerSnapshot);
  return (
    <p data-local-time data-ready={time ? 'true' : 'false'} className={cn('flex h-5 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400', className)}>
      <span data-live-dot aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
      {/* the text is reserved (invisible) until the clock has a value on the client */}
      <span className={time ? undefined : 'invisible'} aria-hidden={time ? undefined : 'true'}>
        {before}
        {time ?? '00:00 am'}
        {after}
      </span>
    </p>
  );
}
