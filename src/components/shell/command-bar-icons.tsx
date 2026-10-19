import type { ReactNode } from 'react';
import { BrandIcon } from '@/components/shell/brand-icons';
import {
  Award,
  Briefcase,
  CalendarDays,
  CloudRain,
  CloudSun,
  FlaskConical,
  FolderCode,
  GraduationCap,
  HandHelping,
  Image as ImageIcon,
  Mail,
  Moon,
  MoonStar,
  PartyPopper,
  Presentation,
  Signature,
  Sparkle,
  Sun,
  Video,
} from 'lucide-react';

/** Navigation group icons by section id. */
export const NAVIGATION_ICONS: Record<string, ReactNode> = {
  work: <Briefcase className="size-4" />,
  projects: <FolderCode className="size-4" />,
  education: <GraduationCap className="size-4" />,
  research: <FlaskConical className="size-4" />,
  writing: <Signature className="size-4" />,
  talks: <Presentation className="size-4" />,
  volunteering: <HandHelping className="size-4" />,
  awards: <Award className="size-4" />,
  connect: <Mail className="size-4" />,
};

/** Per-theme glyphs for the "Switch to … Mode" actions. */
export const THEME_ICONS: Record<string, ReactNode> = {
  light: <Sun className="size-4" />,
  dark: <Moon className="size-4" />,
  sunny: <CloudSun className="size-4" />,
  rain: <CloudRain className="size-4" />,
  night: <MoonStar className="size-4" />,
};

export const PROJECT_VIDEO_ICON = <Video className="size-4" />;
export const PROJECT_IMAGE_ICON = <ImageIcon className="size-4" />;
export const BLOG_ICON = <Signature className="size-4" />;
export const CONFETTI_ICON = <PartyPopper className="size-4" />;

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Social glyphs keyed by the social label used in content (Github / X / Instagram / TikTok / LinkedIn / Luma / Meet). */
export const SOCIAL_ICONS: Record<string, ReactNode> = {
  Github: (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" {...stroke}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  X: <BrandIcon label="X" className="size-4" />,
  LinkedIn: (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" {...stroke}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  Instagram: <BrandIcon label="Instagram" className="size-4" />,
  TikTok: <BrandIcon label="TikTok" className="size-4" />,
  Luma: <Sparkle className="size-4" />,
  Meet: <CalendarDays className="size-4" />,
};
