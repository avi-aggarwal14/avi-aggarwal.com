import * as maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import { siteContent } from '@/content/site-content';

type Theme = 'light' | 'dark';
const styleCache = new Map<Theme, StyleSpecification | string>();
let workerConfigured = false;

/** Point MapLibre at the self-hosted worker once. */
export function setupMapLibre() {
  if (!workerConfigured) {
    workerConfigured = true;
    try {
      maplibregl.setWorkerUrl(`/maplibre/${siteContent.map.maplibreVersion}/maplibre-gl-worker.mjs`);
    } catch {
      /* fall back to the bundled worker */
    }
  }
}

/** CARTO style JSON, fetched once per theme and patched so theme switches do not cross-fade. */
export async function loadStyle(theme: Theme): Promise<StyleSpecification | string> {
  const cached = styleCache.get(theme);
  if (cached) return cached;
  const url = siteContent.map.styles[theme];
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as StyleSpecification;
    json.transition = { duration: 0, delay: 0 };
    styleCache.set(theme, json);
    return json;
  } catch {
    styleCache.set(theme, url);
    return url;
  }
}

export const VISITED_SOURCE = 'visited-countries';
export const VISITED_LAYER = 'visited-countries-fill';

/** Adds the visited-countries GeoJSON fill beneath the water layer (idempotent). */
export function addVisitedCountries(map: maplibregl.Map, isDark: boolean) {
  if (map.getSource(VISITED_SOURCE)) {
    map.setPaintProperty(VISITED_LAYER, 'fill-color', isDark ? '#fbfbfb' : '#121214');
    map.setPaintProperty(VISITED_LAYER, 'fill-opacity', isDark ? 0.08 : 0.04);
    return;
  }
  map.addSource(VISITED_SOURCE, { type: 'geojson', data: siteContent.map.visitedCountries });
  map.addLayer(
    {
      id: VISITED_LAYER,
      type: 'fill',
      source: VISITED_SOURCE,
      paint: { 'fill-color': isDark ? '#fbfbfb' : '#121214', 'fill-opacity': isDark ? 0.08 : 0.04 },
    },
    map.getLayer('water') ? 'water' : undefined,
  );
}

export type LngLat = { lng: number; lat: number };

/** easeOutCubic fly-to whose duration scales with distance (3–10 s); no-op when already there. */
export function flyToLocation(map: maplibregl.Map, target: LngLat) {
  const center = map.getCenter();
  const dLat = Math.abs(center.lat - target.lat);
  const dLng = Math.abs(center.lng - target.lng);
  if (dLat < 1e-4 && dLng < 1e-4 && Math.abs(map.getZoom() - 15) < 0.01) return;
  const duration = Math.min(10_000, Math.max(3000, Math.hypot(dLat, dLng) * 1e5));
  map.stop();
  map.flyTo({ center: [target.lng, target.lat], zoom: 15, duration, essential: true, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
}

/** Great-circle distance in km (earth radius 6371 km). */
export function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
