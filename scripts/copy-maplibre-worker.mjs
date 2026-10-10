// Self-host the MapLibre worker (and its shared chunk) at /maplibre/<version>/, like the original site.
import fs from 'node:fs';
import path from 'node:path';
const pkg = JSON.parse(fs.readFileSync('node_modules/maplibre-gl/package.json', 'utf8'));
const content = fs.readFileSync('src/content/site-content.ts', 'utf8');
const version = /maplibreVersion:\s*["']([^"']+)["']/.exec(content)?.[1] ?? pkg.version;
if (version !== pkg.version) console.warn(`maplibre version mismatch: content ${version} vs installed ${pkg.version}`);
const dir = path.join('public', 'maplibre', version);
fs.mkdirSync(dir, { recursive: true });
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  // The vertical-text punctuation table maps U+2014 to a vertical glyph; the owner's copy rule bans U+2014 anywhere
  // under public/, so that single table entry is dropped (em dashes in vertical map labels simply stay upright).
  const source = fs.readFileSync(path.join('node_modules/maplibre-gl/dist', file), 'utf8').replace(/"\u2014":`[^`]*`,?/g, '');
  fs.writeFileSync(path.join(dir, file), source);
}
console.log(`copied maplibre worker files to ${dir}`);
