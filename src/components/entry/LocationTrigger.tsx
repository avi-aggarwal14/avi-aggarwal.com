'use client';
import { MorphingDialog, MorphingDialogTrigger } from '@/components/motion-primitives/morphing-dialog';
import { AnimatedLink } from '@/components/entry/AnimatedLink';
import { LocationMapDialog, prefetchCityMap } from '@/components/popups/LocationMapDialog';
import type { Location } from '@/content/site-content';

const MAP_DIALOG_TRANSITION = { type: 'spring', bounce: 0, duration: 0.3 } as const;

/** "City, Country" button that opens the map popup; hovering/focusing warms the map chunk. */
export function LocationTrigger({ location, entryId }: { location: Location; entryId?: string }) {
  return (
    <MorphingDialog transition={MAP_DIALOG_TRANSITION}>
      <MorphingDialogTrigger onPointerEnter={prefetchCityMap} onPointerDown={prefetchCityMap} onFocus={prefetchCityMap}>
        <AnimatedLink as="button" className="truncate text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          {location.city}
          {', '}
          {location.country}
        </AnimatedLink>
      </MorphingDialogTrigger>
      <LocationMapDialog location={location} currentItemId={entryId} />
    </MorphingDialog>
  );
}
