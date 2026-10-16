/**
 * Pure geometry, deliberately free of any maplibre-gl import: the location popup's "nearest city"
 * lookup needs this in the initial bundle, while MapLibre itself only loads with the lazy map chunk.
 */

/** Great-circle distance in km (earth radius 6371 km). */
export function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
