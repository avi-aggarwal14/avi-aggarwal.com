import { siteContent } from '@/content/site-content';

type LogoMarkProps = {
  className?: string;
  /** hairline outline (footer, mobile) instead of a solid fill */
  outline?: boolean;
  /** override the viewBox crop */
  viewBox?: string;
  /** sticker tilt in degrees around the centre of the viewBox (the footer uses -10) */
  tilt?: number;
};

/** The personal mark as an inline SVG (same path as /favicon.svg). */
export function LogoMark({ className, outline = false, viewBox, tilt }: LogoMarkProps) {
  const { logoMark } = siteContent.assets;
  const box = viewBox ?? logoMark.viewBox;
  const [x, y, w, h] = box.split(' ').map(Number);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={box} aria-hidden="true" focusable="false" className={className}>
      <path
        d={logoMark.path}
        fillRule="evenodd"
        transform={tilt ? `rotate(${tilt} ${x + w / 2} ${y + h / 2})` : undefined}
        {...(outline
          ? { fill: 'none', stroke: 'currentColor', strokeOpacity: 0.06, strokeWidth: 1, vectorEffect: 'non-scaling-stroke' }
          : { fill: 'currentColor' })}
      />
    </svg>
  );
}
