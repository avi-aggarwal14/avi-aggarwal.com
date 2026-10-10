import Image from 'next/image';
import Link from 'next/link';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { siteContent } from '@/content/site-content';

/** In-page identity header: avatar, name, per-character animated role line. */
export function Header() {
  const { profile } = siteContent;
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <Image
            src={profile.avatar}
            alt="Profile photo"
            className="size-16 rounded-full transition-all duration-300"
            width={256}
            height={256}
            priority
            draggable={false}
          />
        </Link>
        <div>
          <Link href="/" className="font-semibold text-black dark:text-white">
            {profile.name}
          </Link>
          <TextEffect as="p" preset="fade" per="char" className="text-zinc-600 dark:text-zinc-500" delay={0.5}>
            {profile.role}
          </TextEffect>
        </div>
      </div>
    </header>
  );
}
