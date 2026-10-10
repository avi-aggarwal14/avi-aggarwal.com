'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader2, LocateFixed, Minus, Plus } from 'lucide-react';
import { addVisitedCountries, flyToLocation, loadStyle, setupMapLibre, type LngLat } from '@/components/popups/map/map-lib';
import { getLogoImageClass } from '@/lib/logo-class';
import { cn } from '@/lib/utils';
import type { ActivityEntry, Location } from '@/content/site-content';

export type MarkerGroup = { key: string; location: Location; entries: ActivityEntry[] };

export type CityMapProps = {
  location: Location;
  groups: MarkerGroup[];
  isDark: boolean;
  /** fly here when it changes (list-row hover, debounced by the caller) */
  flyTarget: Location | null;
  onMarkerClick?: (location: Location) => void;
  onMarkerHover?: (location: Location | null) => void;
  onCenterChange?: (center: LngLat) => void;
};

const GROUP_CLASS =
  'flex flex-col overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-zinc-200/50 [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-zinc-200/50 dark:bg-zinc-800 dark:ring-zinc-700/50 dark:[&>button:not(:last-child)]:border-zinc-700/50';
const CONTROL_CLASS =
  'flex size-7 items-center justify-center text-zinc-700 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/50 focus:outline-none disabled:pointer-events-none disabled:opacity-50';

function MarkerContent({ group, onClick, onHover }: { group: MarkerGroup; onClick: () => void; onHover: (over: boolean) => void }) {
  const first = group.entries[0];
  return (
    <div className="relative cursor-pointer" onClick={onClick} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <div className="relative flex -translate-y-[calc(50%+4px)] flex-col items-center">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white p-1 shadow-md ring-1 ring-zinc-200/70 dark:bg-zinc-800 dark:ring-zinc-700/70">
          {first.logo ? (
            <Image src={first.logo} alt={`${first.title} marker`} width={28} height={28} draggable={false} className={cn('size-full', getLogoImageClass(first.logo, false, 'city-map'))} />
          ) : (
            <div className="size-full rounded bg-zinc-300" />
          )}
        </div>
        <div className="-mt-[3px] size-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-white drop-shadow-[0_1px_0_rgba(0,0,0,0.08)] dark:border-t-zinc-800" />
        {group.entries.length > 1 && (
          <div className="absolute top-0 right-0 flex min-w-4 translate-x-1 -translate-y-1 items-center justify-center rounded-full bg-zinc-100 px-1 text-[10px] leading-4 font-medium text-zinc-600 tabular-nums dark:bg-zinc-800 dark:text-zinc-300">
            {group.entries.length}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CityMap({ location, groups, isDark, flyTarget, onMarkerClick, onMarkerHover, onCenterChange }: CityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const needleRef = useRef<SVGSVGElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const callbacks = useRef({ onMarkerClick, onMarkerHover, onCenterChange });
  useEffect(() => {
    callbacks.current = { onMarkerClick, onMarkerHover, onCenterChange };
  });
  const themeRef = useRef<'light' | 'dark'>(isDark ? 'dark' : 'light');
  // one host element per marker group; markers are attached in an effect, content is portalled in
  const markerElements = useMemo(() => {
    const out: Record<string, HTMLElement> = {};
    if (typeof document === 'undefined') return out;
    for (const group of groups) out[group.key] = document.createElement('div');
    return out;
  }, [groups]);

  // create the map once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let map: maplibregl.Map | null = null;
    setupMapLibre();
    const theme = themeRef.current;
    loadStyle(theme).then((style) => {
      if (cancelled) return;
      map = new maplibregl.Map({
        container,
        style,
        center: [location.coordinates.longitude, location.coordinates.latitude],
        zoom: 15,
        minZoom: 1.25,
        pitch: 45,
        scrollZoom: { around: 'center' },
        attributionControl: false,
        renderWorldCopies: false,
      });
      mapRef.current = map;
      map.on('style.load', () => {
        map?.setProjection({ type: 'globe' });
        if (map) addVisitedCountries(map, themeRef.current === 'dark');
      });
      map.on('load', () => setIsLoaded(true));
      map.on('moveend', () => {
        if (!map) return;
        const c = map.getCenter();
        callbacks.current.onCenterChange?.({ lng: c.lng, lat: c.lat });
      });
      const updateNeedle = () => {
        if (!map || !needleRef.current) return;
        needleRef.current.style.transform = `rotateX(${map.getPitch()}deg) rotateZ(${-map.getBearing()}deg)`;
      };
      map.on('rotate', updateNeedle);
      map.on('pitch', updateNeedle);
      updateNeedle();
    });
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // markers: one per unique coordinate pair, content portalled into the marker element
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;
    const markers: maplibregl.Marker[] = [];
    for (const group of groups) {
      const el = markerElements[group.key];
      if (!el) continue;
      const marker = new maplibregl.Marker({ element: el, opacityWhenCovered: '0' })
        .setLngLat([group.location.coordinates.longitude, group.location.coordinates.latitude])
        .addTo(map);
      markers.push(marker);
    }
    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [groups, markerElements, isLoaded]);

  // theme switch: restyle in place, then re-add the visited layer
  useEffect(() => {
    const next: 'light' | 'dark' = isDark ? 'dark' : 'light';
    if (themeRef.current === next) return;
    themeRef.current = next;
    const map = mapRef.current;
    if (!map) return;
    loadStyle(next).then((style) => {
      if (mapRef.current !== map) return;
      map.setStyle(style, { diff: true });
    });
  }, [isDark]);

  // fly to a hovered list row's location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTarget) return;
    flyToLocation(map, { lng: flyTarget.coordinates.longitude, lat: flyTarget.coordinates.latitude });
  }, [flyTarget]);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    const z = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), map.getZoom() + delta));
    if (z === map.getZoom()) return;
    map.zoomTo(z, { duration: 300 });
  };

  const locate = () => {
    const map = mapRef.current;
    if (!map || locating || !('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1500 });
      },
      (err) => {
        console.error(err);
        setLocating(false);
      },
    );
  };

  return (
    <div className="squircle-thumb relative aspect-video w-full overflow-hidden">
      <div ref={containerRef} className="relative size-full" />
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-50/50 backdrop-blur-xs dark:bg-zinc-900/50">
          <div className="flex gap-1">
            <span className="size-1.5 animate-pulse rounded-full bg-zinc-500/60" />
            <span className="size-1.5 animate-pulse rounded-full bg-zinc-500/60 [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-zinc-500/60 [animation-delay:300ms]" />
          </div>
        </div>
      )}
      <div className="absolute z-10 flex flex-col gap-1.5 top-2 right-2">
        <div className={GROUP_CLASS}>
          <button type="button" aria-label="Zoom in" className={CONTROL_CLASS} onClick={() => zoomBy(1)}>
            <Plus className="size-4" />
          </button>
          <button type="button" aria-label="Zoom out" className={CONTROL_CLASS} onClick={() => zoomBy(-1)}>
            <Minus className="size-4" />
          </button>
        </div>
        <div className={GROUP_CLASS}>
          <button type="button" aria-label="Reset bearing to north" className={CONTROL_CLASS} onClick={() => mapRef.current?.resetNorthPitch({ duration: 300 })}>
            <svg ref={needleRef} viewBox="0 0 24 24" className="size-5 transition-transform duration-200" style={{ transformStyle: 'preserve-3d' }} aria-hidden="true">
              <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
              <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
              <path d="M12 22L16 12H12V22Z" className="fill-zinc-500/60" />
              <path d="M12 22L8 12H12V22Z" className="fill-zinc-500/30" />
            </svg>
          </button>
        </div>
        <div className={GROUP_CLASS}>
          <button type="button" aria-label="Find my location" className={CONTROL_CLASS} onClick={locate} disabled={locating}>
            {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
          </button>
        </div>
      </div>
      {groups.map((group) => {
        const el = markerElements[group.key];
        if (!el) return null;
        return createPortal(
          <MarkerContent
            key={group.key}
            group={group}
            onClick={() => {
              const map = mapRef.current;
              if (map) flyToLocation(map, { lng: group.location.coordinates.longitude, lat: group.location.coordinates.latitude });
              callbacks.current.onMarkerHover?.(null);
              callbacks.current.onMarkerClick?.(group.location);
            }}
            onHover={(over) => callbacks.current.onMarkerHover?.(over ? group.location : null)}
          />,
          el,
          group.key,
        );
      })}
    </div>
  );
}
