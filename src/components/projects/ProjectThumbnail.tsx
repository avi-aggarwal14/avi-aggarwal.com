'use client';
import Image from 'next/image';
import { siteContent, type Project } from '@/content/site-content';

const PLATE_SIZES = '(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) 50vw, 368px';
const ART_OFFSET = { transform: 'translate(-2.5px, 2.5px)' } as const;
const ART_CLASS = 'pointer-events-none absolute inset-0 object-contain';

/**
 * The four stacked layers: colour plate, vector art, photographic overlay (z-20), logo overlay (z-30).
 * Monochrome art is inverted in dark themes; a project with `thumb.mainDark` swaps in a dark-theme file instead (brand colours stay).
 */
export function ProjectThumbnail({ project }: { project: Project }) {
  const { assets } = siteContent;
  return (
    <div className="group relative aspect-[1.91/1] w-full overflow-hidden">
      <div className="relative size-full">
        <Image
          src={`${assets.projectBackgroundsDir}/${project.thumb.color}.png`}
          alt={`${project.name} project`}
          width={1000}
          height={1000}
          draggable={false}
          loading="lazy"
          sizes={PLATE_SIZES}
          className="size-full squircle-thumb object-cover dark:filter dark:brightness-90"
        />
        {project.thumb.mainDark ? (
          <>
            <Image src={`${assets.projectArtDir}/${project.thumb.slug}/main.svg`} alt="" aria-hidden="true" fill draggable={false} className={`${ART_CLASS} dark:hidden`} style={ART_OFFSET} />
            <Image src={project.thumb.mainDark} alt="" aria-hidden="true" fill draggable={false} className={`${ART_CLASS} hidden dark:block`} style={ART_OFFSET} />
          </>
        ) : (
          <Image src={`${assets.projectArtDir}/${project.thumb.slug}/main.svg`} alt="" aria-hidden="true" fill draggable={false} className={`${ART_CLASS} dark:invert`} style={ART_OFFSET} />
        )}
      </div>
      <Image
        src={assets.projectOverlayProfile}
        alt=""
        aria-hidden="true"
        fill
        priority
        draggable={false}
        sizes={PLATE_SIZES}
        className="pointer-events-none absolute inset-0 z-20 size-full object-contain opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:duration-200"
      />
      <Image
        src={assets.projectOverlayLogo}
        alt=""
        aria-hidden="true"
        fill
        draggable={false}
        loading="lazy"
        className="pointer-events-none absolute inset-0 z-30 size-full object-contain opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:duration-200 dark:invert"
      />
    </div>
  );
}
