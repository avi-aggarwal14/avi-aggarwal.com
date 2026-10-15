import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { siteContent } from '@/content/site-content';
import { ALL_THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/themes';
import { ThemeInitializer } from '@/components/shell/ThemeInitializer';
import { ThemeOverlay } from '@/components/shell/ThemeOverlay';
import { CustomCursor } from '@/components/shell/CustomCursor';
import { CommandBar } from '@/components/shell/CommandBar';
import { GlassHeader } from '@/components/shell/GlassHeader';
import { Header } from '@/components/shell/Header';
import { SiteFooter } from '@/components/shell/SiteFooter';
import { LANG, ROBOTS, profileUrls, socialMetadata } from '@/lib/seo';
import { SITE_URL } from '@/lib/site-url';

const { site, profile } = siteContent;

/** Defaults for every route; the homepage replaces the title (absolute) and the social card title in page.tsx. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: site.titleTemplate },
  description: site.description,
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  publisher: profile.name,
  robots: ROBOTS,
  alternates: { canonical: SITE_URL },
  ...socialMetadata(site.title),
  icons: [
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png', sizes: '180x180' },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: site.themeColorLight },
    { media: '(prefers-color-scheme: dark)', color: site.themeColorDark },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang={LANG} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* rel="me": the social profiles this site claims (IndieAuth / Mastodon-style identity links) */}
        {profileUrls().map((url) => (
          <link key={url} rel="me" href={url} />
        ))}
      </head>
      <body className="bg-zinc-50 tracking-tighter antialiased dark:bg-zinc-900">
        <ThemeProvider
          themes={ALL_THEMES}
          enableSystem
          enableColorScheme
          attribute="class"
          storageKey={THEME_STORAGE_KEY}
          defaultTheme={DEFAULT_THEME}
        >
          <ThemeInitializer />
          <ThemeOverlay />
          {/* Vercel scripts only exist on Vercel; mounting them locally just logs 404s. */}
          {process.env.VERCEL === '1' && (
            <>
              <SpeedInsights />
              <Analytics />
            </>
          )}
          <CustomCursor />
          <CommandBar />
          <div className="relative z-10 flex min-h-screen w-full flex-col">
            <GlassHeader />
            <main className="relative mx-auto w-full max-w-3xl flex-1 px-8 pt-20 lg:px-4">
              <Header />
              {children}
              <SiteFooter />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
