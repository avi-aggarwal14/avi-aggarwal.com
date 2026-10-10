import { siteContent } from '@/content/site-content';

export type LogoContext = 'timeline' | 'project-card' | 'city-map';

const BASE: Record<LogoContext, string> = {
  timeline: 'size-5 object-contain',
  'project-card': 'size-4 object-contain',
  'city-map': 'object-contain',
};

/** Size, corner and dark-mode inversion classes for a logo file (rules live in content.assets). */
export function getLogoImageClass(src: string, withGroupHover = false, context: LogoContext = 'timeline'): string {
  const { logoNoInvert, logoNoCorner, logoRoundFull } = siteContent.assets;
  const file = src.slice(src.lastIndexOf('/') + 1);
  const corner = logoRoundFull.includes(file) ? 'rounded-full' : logoNoCorner.includes(file) ? '' : 'rounded-sm';
  const invert = logoNoInvert.includes(file)
    ? ''
    : withGroupHover
      ? 'dark:invert group-hover:invert group-hover:transition-all group-hover:duration-200'
      : 'dark:invert';
  return [BASE[context], corner, invert].filter(Boolean).join(' ');
}
