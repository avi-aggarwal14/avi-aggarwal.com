import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { siteContent } from '@/content/site-content';
import { SITE_URL } from '@/lib/site-url';

const FONTS = path.join(process.cwd(), 'src', 'assets', 'fonts');

async function font(file: string) {
  return fs.readFile(path.join(FONTS, file));
}

/** 1200x630 Open Graph card: soft mesh gradient, avatar top-left, name and role bottom-left, domain badge bottom-right. */
export async function GET() {
  const { profile, assets } = siteContent;
  const [display, sans, avatar] = await Promise.all([font('BricolageGrotesque-ExtraBold.ttf'), font('Sans-Medium.ttf'), fs.readFile(path.join(process.cwd(), 'public', profile.avatar))]);
  const domain = new URL(SITE_URL).host;
  const avatarSrc = `data:image/png;base64,${avatar.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          backgroundColor: '#a4d1e8',
          backgroundImage:
            'linear-gradient(118deg, rgba(164,209,232,1) 0%, rgba(176,214,230,1) 24%, rgba(199,216,199,0.9) 46%, rgba(238,221,150,0.95) 66%, rgba(249,219,151,1) 82%, rgba(224,207,107,1) 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage: 'radial-gradient(circle at 92% -10%, rgba(255,246,190,0.95) 0%, rgba(255,240,170,0.55) 22%, rgba(255,240,170,0) 48%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage: 'radial-gradient(circle at 5% 100%, rgba(131,184,222,0.95) 0%, rgba(131,184,222,0.5) 25%, rgba(131,184,222,0) 55%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarSrc} width={168} height={168} alt="" style={{ position: 'absolute', left: 91, top: 84, borderRadius: 9999, border: '6px solid rgba(255,255,255,0.85)' }} />
        <div style={{ position: 'absolute', left: 91, bottom: 132, display: 'flex', fontFamily: 'Display', fontSize: 80, color: '#000', lineHeight: 1, letterSpacing: -2 }}>
          {profile.name}
        </div>
        <div style={{ position: 'absolute', left: 93, bottom: 82, display: 'flex', fontFamily: 'Sans', fontSize: 30, color: 'rgba(24,24,27,0.72)', lineHeight: 1 }}>
          {profile.role}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 62,
            bottom: 88,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 28px',
            borderRadius: 9999,
            backgroundColor: 'rgba(255,255,255,0.85)',
            color: '#27272a',
            fontFamily: 'Sans',
            fontSize: 25,
          }}
        >
          <svg width="22" height="22" viewBox={assets.logoMark.viewBox} xmlns="http://www.w3.org/2000/svg">
            <path d={assets.logoMark.path} fill="#000" fillRule="evenodd" />
          </svg>
          {domain}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Display', data: display, style: 'normal', weight: 800 },
        { name: 'Sans', data: sans, style: 'normal', weight: 500 },
      ],
      headers: { 'content-disposition': 'inline', 'cache-control': 'public, max-age=0, must-revalidate' },
    },
  );
}
