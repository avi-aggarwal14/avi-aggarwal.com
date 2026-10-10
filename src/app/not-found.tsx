import Link from 'next/link';

/** Custom 404, rendered inside the normal shell (nav, identity header, footer). */
export default function NotFound() {
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
    </div>
  );
}
