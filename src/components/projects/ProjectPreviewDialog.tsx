'use client';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Download, Star } from 'lucide-react';
import { MorphingDialogContainer, MorphingDialogContent, useMorphingDialog } from '@/components/motion-primitives/morphing-dialog';
import { Carousel, CarouselContent, CarouselIndicator, CarouselItem, CarouselNavigation } from '@/components/motion-primitives/carousel';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { PopupClose } from '@/components/popups/popup-shell';
import { STAT_PROVIDERS, hostOf, latestValue } from '@/components/popups/stats-series';
import { getLogoImageClass } from '@/lib/logo-class';
import { isDarkTheme } from '@/lib/themes';
import { scrollToElement } from '@/lib/scroll';
import { CUSTOM_CURSOR_DISABLE, CUSTOM_CURSOR_ENABLE, OPEN_STATS_DIALOG, dispatch } from '@/lib/events';
import { siteContent, type Project, type ProjectVideo } from '@/content/site-content';

const PANEL =
  'relative flex max-h-[85vh] w-[95vw] max-w-5xl flex-col squircle-panel bg-zinc-50/50 p-1 shadow-2xl ring-1 ring-zinc-200/50 ring-inset backdrop-blur-xl md:w-[85vw] dark:bg-zinc-900/50 dark:ring-zinc-800/50';
const IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px';
const PILL =
  'magnetic-social-link group relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-200 px-2.5 py-1 text-xs text-black hover:bg-zinc-900 hover:text-zinc-50 hover:transition-colors hover:duration-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700';
const YT_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';

const youtubeSrc = (id: string, autoplay: boolean, jsapi: boolean) =>
  `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&mute=0&loop=1&controls=1&modestbranding=1${jsapi ? '&enablejsapi=1' : ''}`;

type MediaEl = HTMLVideoElement | HTMLIFrameElement | null;

/** Media slot that hands the native cursor back while the pointer is over the player. */
function MediaTile({ children, className = 'aspect-video w-full' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onLeave = (e: ReactMouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dispatch(CUSTOM_CURSOR_ENABLE);
  };
  return (
    <div ref={ref} className={className} onMouseEnter={() => dispatch(CUSTOM_CURSOR_DISABLE)} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

function Player({ video, autoPlay, jsapi, register }: { video: ProjectVideo; autoPlay: boolean; jsapi: boolean; register?: (el: MediaEl) => void }) {
  if (video.type === 'direct') {
    return (
      <video ref={register} src={video.url} className="squircle-thumb-t size-full" title={video.title} autoPlay={autoPlay} loop controls playsInline controlsList="nodownload" />
    );
  }
  return (
    <iframe ref={register} className="squircle-thumb-t size-full" title={video.title} allowFullScreen allow={YT_ALLOW} src={youtubeSrc(video.id, autoPlay, jsapi)} />
  );
}

const ytCommand = (frame: HTMLIFrameElement, func: string, args: unknown[] = []) =>
  frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');

function PreviewBody({ project }: { project: Project }) {
  const { setIsOpen } = useMorphingDialog();
  const { resolvedTheme } = useTheme();
  const isDark = isDarkTheme(resolvedTheme);
  const [index, setIndex] = useState(0);
  const mediaRefs = useRef<MediaEl[]>([]);
  const { assets } = siteContent;

  const videos = project.videos ?? [];
  const images = project.images ?? [];
  const itemCount = videos.length > 0 ? videos.length : images.length;
  const hasMultiple = itemCount > 1;

  const themed = (src: string) =>
    isDark && assets.darkImageVariantSlugs.includes(project.thumb.slug) ? src.replace(/(\.[a-z0-9]+)$/i, '@dark$1') : src;

  // active slide plays, the others pause
  useEffect(() => {
    mediaRefs.current.forEach((el, i) => {
      if (!el) return;
      if (el instanceof HTMLVideoElement) {
        if (i === index) {
          el.currentTime = 0;
          el.play().catch(() => {});
        } else el.pause();
      } else if (i === index) {
        ytCommand(el, 'seekTo', [0, true]);
        ytCommand(el, 'playVideo');
      } else ytCommand(el, 'pauseVideo');
    });
  }, [index]);

  // arrow keys change slides while open and there is more than one item
  useEffect(() => {
    if (!hasMultiple) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(itemCount - 1, i + 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasMultiple, itemCount]);

  const carouselChrome = (
    <>
      <CarouselNavigation className="left-0 w-full px-4" classNameButton="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700" />
      <CarouselIndicator className="bottom-4" classNameButton="!bg-white/50 [&.w-4]:!bg-white" />
    </>
  );

  let media: ReactNode = null;
  if (videos.length > 1) {
    media = (
      <Carousel index={index} onIndexChange={setIndex}>
        <CarouselContent>
          {videos.map((video, i) => (
            <CarouselItem key={`${video.type}-${i}`}>
              <MediaTile>
                <Player video={video} autoPlay={i === 0} jsapi register={(el) => (mediaRefs.current[i] = el)} />
              </MediaTile>
            </CarouselItem>
          ))}
        </CarouselContent>
        {carouselChrome}
      </Carousel>
    );
  } else if (videos.length === 1) {
    media = (
      <MediaTile>
        <Player video={videos[0]} autoPlay jsapi={false} />
      </MediaTile>
    );
  } else if (images.length === 1) {
    media = (
      <div className="relative aspect-video w-full">
        <Image src={themed(images[0])} alt={`${project.name} screenshot`} fill priority draggable={false} className="squircle-thumb-t object-cover" sizes={IMAGE_SIZES} />
      </div>
    );
  } else if (images.length > 1) {
    media = (
      <Carousel index={index} onIndexChange={setIndex}>
        <CarouselContent>
          {images.map((src, i) => (
            <CarouselItem key={src}>
              <div className="relative aspect-video w-full">
                <Image src={themed(src)} alt={`${project.name} screenshot ${i + 1}`} fill priority={i === 0} draggable={false} className="squircle-thumb-t cursor-none object-cover" sizes={IMAGE_SIZES} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {carouselChrome}
      </Carousel>
    );
  }

  const stats = STAT_PROVIDERS.flatMap((provider) => {
    const link = project.links.find((l) => hostOf(l.url) === provider.host);
    if (!link) return [];
    const value = latestValue(link.url);
    return value === null ? [] : [{ ...provider, value }];
  });

  const openStats = () => {
    setIsOpen(false);
    setTimeout(() => scrollToElement('projects', { block: 'start' }), 200);
    setTimeout(() => dispatch(OPEN_STATS_DIALOG), 700);
  };

  const youtubeVideos = videos.filter((v): v is Extract<ProjectVideo, { type: 'youtube' }> => v.type === 'youtube');
  const pills = [
    ...youtubeVideos.map((v, i) => ({
      key: `yt-${v.id}`,
      href: `https://www.youtube.com/watch?v=${v.id}`,
      logo: assets.youtubeIcon,
      label: youtubeVideos.length > 1 ? `YouTube ${i + 1}` : 'YouTube',
    })),
    ...project.links.map((l) => ({ key: `${l.url}-${l.label}`, href: l.url, logo: l.logo, label: l.label })),
  ];

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="relative shrink-0 overflow-hidden">{media}</div>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-left text-base font-semibold text-zinc-900 md:text-lg dark:text-zinc-100">{project.name}</h3>
            {stats.length > 0 && (
              <div className="flex items-center gap-3">
                {stats.map((stat) => (
                  <button
                    key={stat.host}
                    type="button"
                    aria-label={`${stat.label}: ${stat.value}`}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                    onClick={openStats}
                  >
                    {stat.metric === 'stars' ? <Star className="size-3.5" /> : <Download className="size-3.5" />}
                    <span>{stat.value.toLocaleString('en-US')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        </div>
        {pills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {pills.map((pill) => (
              <Magnetic key={pill.key} springOptions={{ bounce: 0 }} intensity={0.3}>
                <a href={pill.href} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} ${pill.label}`} className={PILL}>
                  <Image className={getLogoImageClass(pill.logo, true, 'project-card')} width={16} height={16} alt="" aria-hidden="true" draggable={false} src={pill.logo} />
                  {pill.label}
                  <span className="text-black group-hover:text-white dark:text-zinc-100 dark:group-hover:text-black group-hover:transition-colors group-hover:duration-200">
                    <Image className="size-3 group-hover:invert dark:invert group-hover:transition-all group-hover:duration-200" width={12} height={12} alt="" aria-hidden="true" draggable={false} src={assets.externalLinkIcon} />
                  </span>
                </a>
              </Magnetic>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Project preview popup content (centred, max-w-5xl); mount inside the card's `MorphingDialog`. */
export function ProjectPreviewDialog({ project }: { project: Project }) {
  return (
    <MorphingDialogContainer>
      <MorphingDialogContent className={PANEL}>
        <PreviewBody project={project} />
      </MorphingDialogContent>
      <PopupClose />
    </MorphingDialogContainer>
  );
}
