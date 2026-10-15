// Generates Avi's brand assets from Bricolage Grotesque ExtraBold (SIL OFL). Every wordmark is text
// converted to SVG paths (no webfont is loaded by the site), plus the sticker mark, favicons, the
// project-card overlays and art, and the monochrome icons the content references.
// Usage: node scripts/gen-brand.mjs            (then: node scripts/gen-content.mjs)
// Inputs: src/assets/fonts/BricolageGrotesque-ExtraBold.ttf, scripts/brand/sources/*, the avatar and the hypjam lockups.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
const nextDir = path.dirname(require.resolve('next/package.json'));
const sharp = require(path.join(nextDir, '..', 'sharp'));

const FONT = fontkit.openSync('src/assets/fonts/BricolageGrotesque-ExtraBold.ttf');
const UPM = FONT.unitsPerEm;
const AVATAR = path.join(os.homedir(), 'Desktop/avi-site-media/avatar/nb2_03.png');
// Folder holding the hypjam brand logos (hypjam-lockup-on-light.svg / -on-dark.svg). Set HYPJAM_LOGOS to regenerate.
const HYPJAM = process.env.HYPJAM_LOGOS ?? 'assets/hypjam-logos';
const SRC = 'scripts/brand/sources';
const INK = '#18181b';
const STICKER = '#ffc29a';
const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';

const r2 = (n) => Math.round(n * 100) / 100;
const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`wrote ${file} (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
};

/** Text as one SVG path: y down, baseline at y=origin.y, first glyph at x=origin.x. */
function textPath(text, size, origin = { x: 0, y: 0 }, tracking = 0) {
  const run = FONT.layout(text);
  const s = size / UPM;
  let x = origin.x;
  let d = '';
  const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const contours = [];
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const ox = x + p.xOffset * s;
    const oy = origin.y - p.yOffset * s;
    const X = (v) => r2(ox + v * s);
    const Y = (v) => r2(oy - v * s);
    let cur = null;
    for (const c of g.path.commands) {
      const a = c.args;
      switch (c.command) {
        case 'moveTo':
          d += `M${X(a[0])} ${Y(a[1])}`;
          cur = { minX: X(a[0]), maxX: X(a[0]), minY: Y(a[1]), maxY: Y(a[1]) };
          contours.push(cur);
          break;
        case 'lineTo':
          d += `L${X(a[0])} ${Y(a[1])}`;
          break;
        case 'quadraticCurveTo':
          d += `Q${X(a[0])} ${Y(a[1])} ${X(a[2])} ${Y(a[3])}`;
          break;
        case 'bezierCurveTo':
          d += `C${X(a[0])} ${Y(a[1])} ${X(a[2])} ${Y(a[3])} ${X(a[4])} ${Y(a[5])}`;
          break;
        case 'closePath':
          d += 'Z';
          break;
      }
      if (cur && c.command !== 'closePath') {
        for (let k = 0; k < a.length; k += 2) {
          cur.minX = Math.min(cur.minX, X(a[k]));
          cur.maxX = Math.max(cur.maxX, X(a[k]));
          cur.minY = Math.min(cur.minY, Y(a[k + 1]));
          cur.maxY = Math.max(cur.maxY, Y(a[k + 1]));
        }
      }
    }
    const gb = g.bbox;
    if (gb.minX !== gb.maxX) {
      bbox.minX = Math.min(bbox.minX, ox + gb.minX * s);
      bbox.maxX = Math.max(bbox.maxX, ox + gb.maxX * s);
      bbox.minY = Math.min(bbox.minY, oy - gb.maxY * s);
      bbox.maxY = Math.max(bbox.maxY, oy - gb.minY * s);
    }
    x += p.xAdvance * s + tracking;
  });
  const m = (v) => (v / UPM) * size;
  return { d, width: x - origin.x, bbox, contours, ascent: m(FONT.ascent), descent: m(-FONT.descent), xHeight: m(FONT.xHeight), capHeight: m(FONT.capHeight) };
}
const vb = (b, pad = 0) => `${r2(b.minX - pad)} ${r2(b.minY - pad)} ${r2(b.maxX - b.minX + pad * 2)} ${r2(b.maxY - b.minY + pad * 2)}`;

// ---------------------------------------------------------------------------
// 1. Nav / header wordmark: tight horizontally, the font's em box vertically (so it sets like 24px type at h-6)
// ---------------------------------------------------------------------------
const word = textPath('aviaggarwal', 100);
const wordBox = { minX: word.bbox.minX - 2, maxX: word.bbox.maxX + 2, minY: -word.ascent, maxY: word.descent };
write('public/generated/aviaggarwal.svg', `<svg ${XMLNS} viewBox="${vb(wordBox)}" fill="currentColor">\n  <path d="${word.d}"/>\n</svg>\n`);

// ---------------------------------------------------------------------------
// 2. The mark: lowercase "a" as a sticker (fill + dark stroke behind), plus the raw glyph path for inline use
// ---------------------------------------------------------------------------
const BOX = 1024;
const probe = textPath('a', 1000);
const glyphH = probe.bbox.maxY - probe.bbox.minY;
const markSize = 1000 * (640 / glyphH); // glyph 640 units tall inside the 1024 box
const probe2 = textPath('a', markSize);
const gw = probe2.bbox.maxX - probe2.bbox.minX;
const gh = probe2.bbox.maxY - probe2.bbox.minY;
const mark = textPath('a', markSize, { x: (BOX - gw) / 2 - probe2.bbox.minX, y: (BOX - gh) / 2 - probe2.bbox.minY });
const counter = [...mark.contours].sort((a, b) => a.maxX - a.minX - (b.maxX - b.minX))[0];
const counterW = counter.maxX - counter.minX;
const STROKE = Math.round(Math.min(96, counterW * 0.55));
console.log(`mark: glyph ${r2(gw)}x${r2(gh)} in ${BOX}, counter ${r2(counterW)} wide, stroke ${STROKE}`);
const stickerBox = { minX: mark.bbox.minX - STROKE / 2 - 6, maxX: mark.bbox.maxX + STROKE / 2 + 6, minY: mark.bbox.minY - STROKE / 2 - 6, maxY: mark.bbox.maxY + STROKE / 2 + 6 };
const faviconSvg = `<svg ${XMLNS} width="64" height="64" viewBox="${vb(stickerBox)}"><path fill="${STICKER}" stroke="${INK}" stroke-width="${STROKE}" stroke-linejoin="round" paint-order="stroke fill" d="${mark.d}"/></svg>\n`;
write('public/favicon.svg', faviconSvg);
{
  const h = gh * 1.3; // room for the -10 degree sticker tilt applied by the footer
  const w = h * 2;
  const cx = (mark.bbox.minX + mark.bbox.maxX) / 2;
  const cy = (mark.bbox.minY + mark.bbox.maxY) / 2;
  const footerViewBox = `${r2(cx - w / 2)} ${r2(cy - h / 2)} ${r2(w)} ${r2(h)}`;
  write('scripts/brand/logo-mark.json', JSON.stringify({ path: mark.d, viewBox: vb(stickerBox), footerViewBox }, null, 2) + '\n');
}

// favicon.ico (PNG frames) and the apple touch icon
async function raster(svg, size) {
  return sharp(Buffer.from(svg), { density: 400 }).resize(size, size).png().toBuffer();
}
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = 6 + 16 * frames.length;
  const entries = [];
  const datas = [];
  for (const { size, buf } of frames) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;
    e[1] = e[0];
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    datas.push(buf);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...datas]);
}
const frames = [];
for (const size of [16, 32, 48]) frames.push({ size, buf: await raster(faviconSvg, size) });
write('public/favicon.ico', ico(frames));
const touch = await raster(faviconSvg, 126);
write(
  'public/apple-touch-icon.png',
  await sharp({ create: { width: 180, height: 180, channels: 4, background: '#fafafa' } }).composite([{ input: touch, left: 27, top: 27 }]).png().toBuffer(),
);

// ---------------------------------------------------------------------------
// 3. Footer wordmark: faint hairline outlines of the word (left) and the mark (right), like the original
// ---------------------------------------------------------------------------
// The page shows the top 8:1 band of this 1100x215 frame (about the top 137 units), so the word is top-aligned and
// the mark (95 % of the word's ascender height, 0.4 em after the last letter, tilted like a sticker) sits on the
// same baseline. Everything, including the tilted mark's corners, stays inside that window.
{
  const wordW = word.bbox.maxX - word.bbox.minX;
  const wordH = word.bbox.maxY - word.bbox.minY;
  const ascH = -word.bbox.minY; // baseline to ascender top, in the word's 100-unit em
  const TILT = -10;
  const rad = (Math.abs(TILT) * Math.PI) / 180;
  const markHem = 0.95 * ascH;
  const markWem = markHem * (gw / gh);
  const rotW = markWem * Math.cos(rad) + markHem * Math.sin(rad);
  const rotH = markHem * Math.cos(rad) + markWem * Math.sin(rad);
  const GAPem = 40; // 0.4 em
  const scale = 1100 / (wordW + GAPem + rotW);
  const W = r2(wordW * scale);
  const markH = r2(markHem * scale);
  const markW = r2(markWem * scale);
  const baseline = ascH * scale;
  const x = r2(W + GAPem * scale + (rotW * scale - markW) / 2);
  const y = r2(baseline - markH + (rotH * scale - markH) / 2);
  const cx = r2(x + markW / 2);
  const cy = r2(y + markH / 2);
  console.log(`footer wordmark: word ${W} wide, gap ${r2(GAPem * scale)}, mark ${markW}x${markH} tilted ${TILT} deg, bottom ${r2(cy + (rotH * scale) / 2)} of the 137-unit window`);
  write(
    'public/generated/footer-wordmark.svg',
    `<svg ${XMLNS} viewBox="0 0 1100 215" fill="none" stroke="currentColor" stroke-opacity="0.06" stroke-width="1">
  <svg x="0" y="0" width="${W}" height="${r2(wordH * scale)}" viewBox="${vb(word.bbox)}" overflow="visible">
    <path d="${word.d}" vector-effect="non-scaling-stroke"/>
  </svg>
  <g transform="rotate(${TILT} ${cx} ${cy})">
    <svg x="${x}" y="${y}" width="${markW}" height="${markH}" viewBox="${vb(mark.bbox)}" overflow="visible">
      <path d="${mark.d}" vector-effect="non-scaling-stroke"/>
    </svg>
  </g>
</svg>
`,
  );
}

// ---------------------------------------------------------------------------
// 4. Profile image and the project-card hover overlays (same geometry as the originals)
// ---------------------------------------------------------------------------
write('public/profile.png', await sharp(AVATAR).resize(512, 512).png({ compressionLevel: 9 }).toBuffer());
{
  const D = 192; // 48 px circle in the 1200x630 frame, rendered at 4x
  const circle = Buffer.from(`<svg ${XMLNS} width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`);
  const avatar = await sharp(AVATAR).resize(D, D).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
  write(
    'public/projects/overlay-profile.png',
    await sharp({ create: { width: 4800, height: 2520, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: avatar, left: 200, top: 2184 }])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );
}
{
  const small = textPath('aviaggarwal', 36, { x: 108, y: 571.5 + (FONT.xHeight / UPM) * 18 });
  const markH = 38;
  const mSize = (markH / glyphH) * 1000;
  const probeM = textPath('a', mSize);
  const mW = probeM.bbox.maxX - probeM.bbox.minX;
  const m = textPath('a', mSize, { x: 1151 - mW - probeM.bbox.minX, y: 551 - probeM.bbox.minY });
  write(
    'public/projects/overlay-logo.svg',
    `<svg ${XMLNS} width="1200" height="630" viewBox="0 0 1200 630" fill="none">\n  <path fill="black" d="${small.d}"/>\n  <path fill="black" d="${m.d}"/>\n</svg>\n`,
  );
}

// ---------------------------------------------------------------------------
// 5. Project card art: monochrome glyph + wordmark, centred in the 1200x630 frame
// ---------------------------------------------------------------------------
const iconPath = (file) => /<path[^>]*\sd="([^"]+)"/.exec(fs.readFileSync(path.join(SRC, file), 'utf8'))[1];

/**
 * Traces a pixel-art icon (1-unit rects, "M8 1h1v1h-1z") into one monochrome outline path: every filled
 * cell counts, the colours are dropped, shared cell edges cancel out and the remaining edges chain into
 * loops (outer loops clockwise, holes counter-clockwise, so nonzero fill is correct). Returns the path
 * and the tight bounding box of the filled cells.
 */
function tracePixelArt(file, skipFills = []) {
  const svg = fs.readFileSync(file, 'utf8');
  const cells = new Set();
  for (const [, attrs] of svg.matchAll(/<path([^>]*)>/g)) {
    const fill = /fill="([^"]+)"/.exec(attrs)?.[1];
    if (fill && skipFills.includes(fill.toLowerCase())) continue; // left empty: a hole in the silhouette
    const d = /\sd="([^"]+)"/.exec(attrs)?.[1] ?? '';
    for (const [, x, y, w] of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      for (let i = 0; i < Number(w); i++) cells.add(`${Number(x) + i},${y}`);
    }
  }
  if (cells.size === 0) throw new Error(`${file}: no pixel rects found`);
  const has = (x, y) => cells.has(`${x},${y}`);
  const edges = new Map(); // "x,y" (edge start) -> [edge end], clockwise around each filled cell, minus shared edges
  const add = (ax, ay, bx, by) => {
    const back = `${bx},${by}`;
    const list = edges.get(back);
    const i = list ? list.findIndex(([x, y]) => x === ax && y === ay) : -1;
    if (i !== -1) list.splice(i, 1); // the neighbouring cell already added the opposite edge: interior
    else (edges.get(`${ax},${ay}`) ?? edges.set(`${ax},${ay}`, []).get(`${ax},${ay}`)).push([bx, by]);
  };
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const key of cells) {
    const [x, y] = key.split(',').map(Number);
    box.minX = Math.min(box.minX, x); box.minY = Math.min(box.minY, y); box.maxX = Math.max(box.maxX, x + 1); box.maxY = Math.max(box.maxY, y + 1);
    if (!has(x, y - 1)) add(x, y, x + 1, y);
    if (!has(x + 1, y)) add(x + 1, y, x + 1, y + 1);
    if (!has(x, y + 1)) add(x + 1, y + 1, x, y + 1);
    if (!has(x - 1, y)) add(x, y + 1, x, y);
  }
  let d = '';
  for (const [start, ends] of edges) {
    while (ends.length) {
      const pts = [start.split(',').map(Number)];
      let cur = ends.shift();
      while (`${cur[0]},${cur[1]}` !== start) {
        pts.push(cur);
        const next = edges.get(`${cur[0]},${cur[1]}`);
        if (!next?.length) throw new Error(`${file}: open outline at ${cur}`);
        cur = next.shift();
      }
      // drop collinear points so each straight run is one segment
      const keep = pts.filter((p, i) => {
        const a = pts[(i + pts.length - 1) % pts.length], b = pts[(i + 1) % pts.length];
        return (a[0] === p[0]) !== (p[0] === b[0]);
      });
      d += keep.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('') + 'Z';
    }
  }
  return { d, ...box, w: box.maxX - box.minX, h: box.maxY - box.minY };
}
// the pale core (#FFE58F) stays open, so the silhouette reads as a flame with an inner tongue rather than a drop
const flame = tracePixelArt('public/icons/ignura.svg', ['#ffe58f']);
console.log(`ignura flame traced: ${flame.w}x${flame.h} cells, ${flame.d.length} chars`);

const GLYPHS = {
  mcp: { viewBox: '0 0 24 24', w: 24, h: 24, svg: `<path fill="black" d="${iconPath('modelcontextprotocol.svg')}"/>` },
  // Ignura: the pixel flame from public/icons/ignura.svg as one black silhouette (crisp edges keep the pixel look)
  flame: {
    viewBox: `${flame.minX} ${flame.minY} ${flame.w} ${flame.h}`,
    w: flame.w,
    h: flame.h,
    svg: `<path fill="black" shape-rendering="crispEdges" d="${flame.d}"/>`,
  },
  // Yummers: an original dish glyph: a serving cloche (knob, dome) lifted just above its plate
  cloche: {
    viewBox: '0 14 100 76',
    w: 100,
    h: 76,
    svg: `<circle cx="50" cy="22" r="7.5" fill="black"/><rect x="46" y="26" width="8" height="10" fill="black"/><path fill="black" d="M10 74A40 40 0 0 1 90 74Z"/><rect x="2" y="81" width="96" height="9" rx="4.5" fill="black"/>`,
  },
};

// [slug, glyph, text, glyph height as a multiple of the text size]; add a row per project card (slug = thumb.slug in the content JSON)
const CARDS = [
  ['ignura', 'flame', 'Ignura', 1.08],
  ['yummers', 'cloche', 'Yummers', 1],
  ['dare-mcp', 'mcp', 'dare-mcp-server', 1],
];
const MAX_WIDTH = 0.55 * 1200;
const GAP_RATIO = 30 / 96;
// composition width at text size S: S * (k + GAP_RATIO) * ... -> solve S for the widest card at a reference size
const TEXT_SIZE = (() => {
  const ref = 96;
  let widest = 0;
  for (const [, glyphKey, text, k] of CARDS) {
    const g = GLYPHS[glyphKey];
    const t = textPath(text, ref);
    const w = ref * k * (g.w / g.h) + ref * GAP_RATIO + (t.bbox.maxX - t.bbox.minX);
    widest = Math.max(widest, w);
  }
  return r2((ref * MAX_WIDTH) / widest);
})();
console.log(`card text size ${TEXT_SIZE} (cap height ${r2((FONT.capHeight / UPM) * TEXT_SIZE)}) so the widest art is ${MAX_WIDTH} of 1200`);

function card(glyphKey, text, k = 1) {
  const g = GLYPHS[glyphKey];
  const t = textPath(text, TEXT_SIZE);
  const gap = TEXT_SIZE * GAP_RATIO;
  const glyphH = r2(TEXT_SIZE * k);
  const glyphW = (glyphH * g.w) / g.h;
  const textW = t.bbox.maxX - t.bbox.minX;
  const left = (1200 - glyphW - gap - textW) / 2;
  const cy = 315;
  const baseline = cy + t.xHeight / 2;
  const tx = left + glyphW + gap - t.bbox.minX;
  return `<svg ${XMLNS} width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <svg x="${r2(left)}" y="${r2(cy - glyphH / 2)}" width="${r2(glyphW)}" height="${glyphH}" viewBox="${g.viewBox}" overflow="visible">${g.svg}</svg>
  <path fill="black" transform="translate(${r2(tx)} ${r2(baseline)})" d="${t.d}"/>
</svg>
`;
}
for (const [slug, glyphKey, text, k] of CARDS) write(`public/projects/${slug}/main.svg`, card(glyphKey, text, k));

// hypjam: the real lockups, never recoloured (light / dark variants), metadata stripped
for (const [variant, out] of [['on-light', 'main.svg'], ['on-dark', 'main-dark.svg']]) {
  const raw = fs.readFileSync(path.join(HYPJAM, `hypjam-lockup-${variant}.svg`), 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/, '');
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  const H = r2(TEXT_SIZE * 1.75); // lockup letters land near the other cards' cap height
  const W = r2((H * 860) / 262);
  write(
    `public/projects/hypjam/${out}`,
    `<svg ${XMLNS} width="1200" height="630" viewBox="0 0 1200 630" fill="none">\n  <svg x="${(1200 - W) / 2}" y="${r2(315 - H / 2)}" width="${W}" height="${H}" viewBox="0 -30 860 262" overflow="visible">\n${inner}\n  </svg>\n</svg>\n`,
  );
}

// ---------------------------------------------------------------------------
// 6. Icons referenced by the content (monochrome, currentColor, like github.svg)
// ---------------------------------------------------------------------------
const icon24 = (d) => `<svg ${XMLNS} viewBox="0 0 24 24" fill="currentColor"><path d="${d}"/></svg>\n`;
write('public/icons/tiktok.svg', icon24(iconPath('tiktok.svg')));
write('public/icons/instagram.svg', icon24(iconPath('instagram.svg')));
write('public/icons/cal.svg', icon24(iconPath('caldotcom.svg')));
write('public/icons/youtube.svg', icon24(iconPath('youtube.svg')));
write(
  'public/icons/link.svg',
  `<svg ${XMLNS} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>\n`,
);
write(
  'public/icons/calendar.svg',
  `<svg ${XMLNS} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18"/><rect width="18" height="18" x="3" y="4" rx="2"/></svg>\n`,
);
console.log('done');
