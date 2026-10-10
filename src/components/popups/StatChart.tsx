'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { Download, Star } from 'lucide-react';
import { SourceGlyph } from '@/components/popups/SourceGlyph';
import { STAT_ROWS, seriesMeta, type SeriesMeta } from '@/components/popups/stats-series';
import { isDarkTheme } from '@/lib/themes';
import { cn } from '@/lib/utils';

const STRIP = 20;
const TOOLTIP_W = 256;
const TICKS = [0, 0.25, 0.5, 0.75, 1];

const fmt = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parse = (date: string) => new Date(`${date}T12:00:00`);
/** Axis label: "5 Sep" for short ranges, "Sep 26" otherwise. */
const xLabel = (date: string, short: boolean) => {
  const d = parse(date);
  return short ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
};
const tipDate = (date: string) => {
  const d = parse(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const nudge = (t: number) => (t === 0 ? -3 : t === 1 ? 8 : 3.5);

type Series = { key: string; meta: SeriesMeta; values: (number | null)[]; index: number };

function buildPath(values: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  let d = '';
  let prev: { x: number; y: number } | null = null;
  values.forEach((v, i) => {
    if (v === null) {
      prev = null;
      return;
    }
    const px = x(i);
    const py = y(v);
    if (!prev) d += `M${px},${py}`;
    else {
      const mx = (prev.x + px) / 2;
      d += `C${mx},${prev.y} ${mx},${py} ${px},${py}`;
    }
    prev = { x: px, y: py };
  });
  return d;
}

/** Rolling digits for the tooltip values (y 100% → 0 → −100%, bounce 0, 0.15 s). */
function RollingNumber({ value }: { value: number }) {
  const chars = value.toLocaleString('en-US').split('');
  return (
    <span className="inline-flex tabular-nums">
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={`${chars.length}-${i}`} className="relative inline-block h-[1.1em] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={ch}
                className="inline-block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.15 }}
              >
                {ch}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <span key={`${chars.length}-${i}`}>{ch}</span>
        ),
      )}
    </span>
  );
}

export default function StatChart({ height = 300 }: { height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(560);
  const [hover, setHover] = useState<number | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const dark = isDarkTheme(resolvedTheme);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rows = STAT_ROWS;
  const n = rows.length;
  const dates = useMemo(() => rows.map((r) => r.date), [rows]);

  const series = useMemo<Series[]>(() => {
    const keys = [...new Set(rows.flatMap((r) => Object.keys(r).filter((k) => k !== 'date')))];
    return keys
      .map((key, index) => ({
        key,
        index,
        meta: seriesMeta(key),
        values: rows.map((r) => (typeof r[key] === 'number' && Number.isFinite(r[key]) ? (r[key] as number) : null)),
      }))
      .filter((s) => s.values.filter((v) => v !== null).length >= 2);
  }, [rows]);

  const starsMax = Math.max(1, ...series.filter((s) => s.meta.axis === 'stars').flatMap((s) => s.values.filter((v): v is number => v !== null)));
  const downloadsMax = Math.max(1, ...series.filter((s) => s.meta.axis === 'downloads').flatMap((s) => s.values.filter((v): v is number => v !== null)));
  const axisMax = (s: Series) => (s.meta.axis === 'stars' ? starsMax : downloadsMax);
  // an axis only exists when a series uses it; without star series the downloads plot takes the full width
  const hasStars = series.some((s) => s.meta.axis === 'stars');
  const hasDownloads = series.some((s) => s.meta.axis === 'downloads');
  const LEFT = hasStars ? 44 : 12;
  const RIGHT = hasDownloads ? 48 : 12;
  const shortDates = n > 1 && (parse(dates[n - 1]).getTime() - parse(dates[0]).getTime()) / 86_400_000 <= 120;

  const T = width - LEFT - RIGHT;
  const plotH = height - STRIP;
  const x = (i: number) => LEFT + (i / (n - 1)) * T;
  const y = (v: number, m: number) => plotH - (v / m) * plotH;
  const gy = (t: number) => plotH * (1 - t);

  const grid = dark ? '#52525b' : '#d4d4d8';
  const label = dark ? '#71717a' : '#a1a1aa';
  const dotStroke = dark ? '#18181b' : '#fff';
  const color = (s: Series) => (dark ? s.meta.color.dark : s.meta.color.light);
  const dimmed = (s: Series) => focused !== null && focused !== s.key;

  const xTicks = Array.from({ length: 6 }, (_, i) => Math.round((i / 5) * (n - 1)));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const idx = Math.round(((e.clientX - rect.left - LEFT) / T) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, idx)));
  };

  const tooltipRows = hover === null ? [] : series
    .filter((s) => s.values[hover] !== null)
    .map((s) => ({ s, value: s.values[hover] as number, norm: (s.values[hover] as number) / axisMax(s) }))
    .sort((a, b) => b.norm - a.norm)
    .map((row, rank) => ({ ...row, rank }));
  const tooltipLeft = hover === null ? 0 : hover > n / 2 ? Math.max(LEFT, x(hover) - TOOLTIP_W - 16) : Math.min(x(hover) + 16, width - TOOLTIP_W);

  return (
    <div ref={wrapRef} className="w-full">
      <div className="relative select-none">
        <svg ref={svgRef} width={width} height={height} className="overflow-visible" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          {TICKS.map((t) => (
            <line key={`g${t}`} x1={LEFT} x2={width - RIGHT} y1={gy(t)} y2={gy(t)} stroke={grid} strokeWidth={1} />
          ))}
          {hasStars &&
            TICKS.map((t) => (
              <text key={`l${t}`} x={40} y={gy(t) + nudge(t)} textAnchor="end" fontSize={9} fill={label}>
                {fmt(starsMax * t)}
              </text>
            ))}
          {hasDownloads &&
            TICKS.map((t) => (
              <text key={`r${t}`} x={width - RIGHT + 4} y={gy(t) + nudge(t)} textAnchor="start" fontSize={9} fill={label}>
                {fmt(downloadsMax * t)}
              </text>
            ))}
          {hasStars && (
            <>
              <text x={10} y={plotH / 2} fontSize={9} fill={label} textAnchor="middle" transform={`rotate(-90 10 ${plotH / 2})`}>
                stars
              </text>
              <line x1={10} x2={10} y1={plotH / 2 + 18} y2={plotH / 2 + 28} stroke={label} strokeWidth={1} strokeLinecap="round" />
            </>
          )}
          {hasDownloads && (
            <>
              <text x={width - 10} y={plotH / 2} fontSize={9} fill={label} textAnchor="middle" transform={`rotate(90 ${width - 10} ${plotH / 2})`}>
                downloads
              </text>
              <line x1={width - 10} x2={width - 10} y1={plotH / 2 - 30} y2={plotH / 2 - 40} stroke={label} strokeWidth={1} strokeDasharray="2 2" strokeLinecap="round" />
            </>
          )}
          {xTicks.map((i) => (
            <text key={`x${i}`} x={x(i)} y={height - 4} fontSize={9} fill={label} textAnchor="middle">
              {xLabel(dates[i], shortDates)}
            </text>
          ))}
          <defs>
            {series
              .filter((s) => s.meta.axis === 'downloads')
              .map((s) => (
                <clipPath key={`clip-${s.index}`} id={`clip-${s.index}`}>
                  <motion.rect x={0} y={-4} height={height + 8} initial={{ width: 0 }} animate={{ width }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.1 * s.index }} />
                </clipPath>
              ))}
          </defs>
          {series.map((s) => {
            const d = buildPath(s.values, x, (v) => y(v, axisMax(s)));
            const common = {
              d,
              fill: 'none',
              stroke: color(s),
              strokeWidth: 1.5,
              strokeLinecap: 'round' as const,
              strokeLinejoin: 'round' as const,
              className: 'transition-opacity duration-150',
              style: { opacity: dimmed(s) ? 0.25 : 1 },
            };
            return s.meta.axis === 'stars' ? (
              <motion.path key={s.key} {...common} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.1 * s.index }} />
            ) : (
              <path key={s.key} {...common} strokeDasharray="4 3" clipPath={`url(#clip-${s.index})`} />
            );
          })}
          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={0} y2={plotH} stroke={grid} strokeDasharray="3 3" />
              {series.map((s) => {
                const v = s.values[hover];
                if (v === null) return null;
                return <circle key={`c-${s.key}`} cx={x(hover)} cy={y(v, axisMax(s))} r={3} fill={color(s)} stroke={dotStroke} strokeWidth={1.5} style={{ opacity: dimmed(s) ? 0.25 : 1 }} className="transition-opacity duration-150" />;
              })}
            </>
          )}
          <rect x={LEFT} y={0} width={Math.max(0, T)} height={plotH} fill="transparent" />
        </svg>
        {hover !== null && tooltipRows.length > 0 && (
          <div className="pointer-events-none absolute z-10 rounded-lg bg-white px-2.5 py-2 text-xs shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700" style={{ top: 8, left: tooltipLeft, width: TOOLTIP_W }}>
            <div className="mb-1.5 text-zinc-400 dark:text-zinc-500">{tipDate(dates[hover])}</div>
            <div className="relative" style={{ height: 20 * tooltipRows.length }}>
              {tooltipRows.map(({ s, value, rank }) => (
                <motion.div key={s.key} className="absolute flex h-5 w-full items-center gap-1.5" animate={{ y: 20 * rank }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}>
                  <SourceGlyph icon={s.meta.icon} color={color(s)} className="size-3 shrink-0" />
                  <span className="text-zinc-500 dark:text-zinc-400">{s.meta.label}</span>
                  <span className="ml-auto flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
                    <RollingNumber value={value} />
                    {s.meta.axis === 'stars' ? <Star className="size-3" /> : <Download className="size-3" />}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {series.map((s) => (
          <div
            key={s.key}
            className={cn('flex items-center gap-1.5 transition-opacity duration-150', dimmed(s) ? 'opacity-40' : 'opacity-100')}
            onPointerEnter={() => setFocused(s.key)}
            onPointerLeave={() => setFocused(null)}
          >
            <SourceGlyph icon={s.meta.icon} color={color(s)} className="size-3 shrink-0" />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{s.meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
