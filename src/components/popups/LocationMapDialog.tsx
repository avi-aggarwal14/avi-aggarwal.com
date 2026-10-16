'use client';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { MorphingDialogContainer, MorphingDialogContent } from '@/components/motion-primitives/morphing-dialog';
import { TextMorph } from '@/components/motion-primitives/text-morph';
import { POPUP_PANEL, PopupClose } from '@/components/popups/popup-shell';
import { AnimatedNumber } from '@/components/popups/AnimatedNumber';
import { TimelineList } from '@/components/popups/TimelineList';
import { useActivityEntries } from '@/components/popups/timeline-context';
import type { MarkerGroup } from '@/components/popups/map/CityMap';
import { haversineKm } from '@/lib/geo';
import { useCurrentYear } from '@/hooks/useCurrentYear';
import { isDarkTheme } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { siteContent, type Location } from '@/content/site-content';

const CityMap = lazy(() => import('@/components/popups/map/CityMap'));

/** Fire-and-forget warm-up of the map chunk (called from the trigger's pointer/focus handlers). */
export function prefetchCityMap() {
  import('@/components/popups/map/CityMap').catch(() => {});
}

function LocationMapBody({ location, currentItemId }: { location: Location; currentItemId?: string }) {
  const entries = useActivityEntries();
  const currentYear = useCurrentYear();
  const { resolvedTheme } = useTheme();
  const isDark = isDarkTheme(resolvedTheme);
  const [displayedLocation, setDisplayedLocation] = useState<Location>(location);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [flyTarget, setFlyTarget] = useState<Location | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const shown = hoveredLocation ?? displayedLocation;
  const listEntries = useMemo(
    () => entries.filter((e) => e.location.city === shown.city && e.location.country === shown.country),
    [entries, shown.city, shown.country],
  );

  const groups = useMemo<MarkerGroup[]>(() => {
    const map = new Map<string, MarkerGroup>();
    for (const e of entries) {
      const key = `${e.location.coordinates.latitude},${e.location.coordinates.longitude}`;
      const g = map.get(key);
      if (g) g.entries.push(e);
      else map.set(key, { key, location: e.location, entries: [e] });
    }
    return [...map.values()];
  }, [entries]);

  const clearHoverTimer = () => clearTimeout(hoverTimer.current);
  useEffect(() => clearHoverTimer, []);

  const onHoveredEntryChange = (id: string | null) => {
    clearHoverTimer();
    if (!id) return;
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    hoverTimer.current = setTimeout(() => setFlyTarget(entry.location), 300);
  };

  const onCenterChange = ({ lng, lat }: { lng: number; lat: number }) => {
    const here = { latitude: lat, longitude: lng };
    let best: Location | null = null;
    let bestKm = Infinity;
    for (const loc of Object.values(siteContent.locations)) {
      const km = haversineKm(here, loc.coordinates);
      if (km < bestKm) {
        bestKm = km;
        best = loc;
      }
    }
    if (best) setDisplayedLocation(best);
  };

  const count = listEntries.length;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="relative shrink-0 overflow-hidden">
        <div className="aspect-video w-full">
          <Suspense fallback={<div className="squircle-thumb size-full bg-zinc-100 dark:bg-zinc-800" />}>
            <CityMap
              location={location}
              groups={groups}
              isDark={isDark}
              flyTarget={flyTarget}
              onMarkerClick={(loc) => {
                clearHoverTimer();
                setHoveredLocation(null);
                setDisplayedLocation(loc);
              }}
              onMarkerHover={(loc) => {
                clearHoverTimer();
                setHoveredLocation(loc);
              }}
              onCenterChange={onCenterChange}
            />
          </Suspense>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4 md:pt-4 md:pr-6 md:pb-6 md:pl-6">
        <div>
          <h3 className="shrink-0 text-left text-base font-semibold text-zinc-900 md:text-lg dark:text-zinc-100">
            <TextMorph as="span" className="inline">{`${shown.city},`}</TextMorph>
            <TextMorph as="span" className="inline ml-0.5">{shown.country}</TextMorph>
          </h3>
          {count > 0 && (
            <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
              <AnimatedNumber value={count} inline />
              <span className="ml-1">{count === 1 ? 'activity' : 'activities'}</span>
            </div>
          )}
        </div>
        {count > 0 && (
          <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
            <TimelineList
              entries={listEntries}
              currentItemId={currentItemId}
              dateFormat="short-month-year"
              currentYear={currentYear}
              hoveredLocation={hoveredLocation}
              onHoveredEntryChange={onHoveredEntryChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Location popup content; mount inside a `MorphingDialog` next to its trigger. */
export function LocationMapDialog(props: { location: Location; currentItemId?: string }) {
  return (
    <MorphingDialogContainer>
      <div className="fixed inset-0 flex items-start justify-center overflow-hidden pt-[max(7.5dvh,env(safe-area-inset-top))]">
        <MorphingDialogContent className={cn(POPUP_PANEL, 'flex max-h-[85dvh] flex-col')}>
          <LocationMapBody {...props} />
        </MorphingDialogContent>
      </div>
      <PopupClose />
    </MorphingDialogContainer>
  );
}
