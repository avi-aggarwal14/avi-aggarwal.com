// Build public/data/visited-countries.geojson from Natural Earth 1:110m admin-0 countries (public domain),
// keeping only the geometry and the ISO A3 code of the visited countries.
// Usage: node scripts/gen-visited-countries.mjs [GBR USA ...]   (defaults to map.visitedCountryCodes in src/content/site-content.ts)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const OUT = 'public/data/visited-countries.geojson';

const content = fs.readFileSync('src/content/site-content.ts', 'utf8');
const fromContent = /visitedCountryCodes:\s*\[([^\]]*)\]/.exec(content)?.[1].match(/[A-Z]{3}/g) ?? [];
const codes = process.argv.length > 2 ? process.argv.slice(2) : fromContent;
if (codes.length === 0) throw new Error('no country codes (pass them as arguments)');

const cache = path.join(os.tmpdir(), 'avi-b', 'ne_110m_admin_0_countries.geojson');
let text;
if (fs.existsSync(cache)) text = fs.readFileSync(cache, 'utf8');
else {
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  text = await res.text();
  fs.mkdirSync(path.dirname(cache), { recursive: true });
  fs.writeFileSync(cache, text);
}
const ne = JSON.parse(text);
const round = (c) => (Array.isArray(c[0]) ? c.map(round) : [Math.round(c[0] * 1000) / 1000, Math.round(c[1] * 1000) / 1000]);
const features = ne.features
  .filter((f) => {
    const p = f.properties;
    return codes.includes(p.ADM0_A3) || codes.includes(p.ISO_A3_EH) || codes.includes(p.ISO_A3);
  })
  .map((f) => ({
    type: 'Feature',
    properties: { iso: f.properties.ADM0_A3 },
    geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
  }));
const found = features.map((f) => f.properties.iso);
const missing = codes.filter((c) => !found.includes(c));
if (missing.length) console.warn('not found in Natural Earth:', missing.join(', '));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`wrote ${OUT}: ${features.length} features (${found.join(', ')}), ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
