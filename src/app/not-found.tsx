import Link from 'next/link';
import { BookCallButton } from '@/components/cta/BookCallButton';
import { BrandIcon } from '@/components/shell/brand-icons';
import { siteContent } from '@/content/site-content';

/** Custom 404, rendered inside the normal shell (nav, identity header, footer). */
export default function NotFound() {
  const { follow } = siteContent;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-4xl font-semibold text-zinc-900 dark:text-zinc-100">404</h1>
      <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">This page could not be found.</p>
      <Link
        href="/"
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Go back home
      </Link>
      {/* under the existing content: a way to talk and a way to follow */}
      <div className="mt-10 flex flex-col items-center gap-4">
        <BookCallButton position="not-found" magnetic />
        <a
          href={follow.x.href}
          target="_blank"
          rel="noopener noreferrer"
          data-ph-capture-attribute-cta="follow-x-404"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <BrandIcon label={follow.x.name} className="size-3.5" />
          {follow.x.label}
        </a>
      </div>
    </div>
  );
}
