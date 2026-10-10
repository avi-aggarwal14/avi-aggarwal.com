import type { SeriesIcon } from '@/components/popups/stats-series';
import { cn } from '@/lib/utils';

const ICON_FILES: Record<Exclude<SeriesIcon, null>, string> = {
  github: '/icons/github.svg',
  npm: '/icons/npm.svg',
};

/** A logo file tinted to an arbitrary colour via CSS masking (used by the chart tooltip + legend). */
export function SourceGlyph({ icon, color, className }: { icon: SeriesIcon; color: string; className?: string }) {
  if (!icon) return <span className={cn('size-3 shrink-0', className)} />;
  const file = ICON_FILES[icon];
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-3 shrink-0', className)}
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url(${file})`,
        maskImage: `url(${file})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}
