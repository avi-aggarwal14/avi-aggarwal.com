import type { Metadata } from 'next';

const CAL_URL = 'https://cal.com/avi-aggarwal/call';

export const metadata: Metadata = {
  title: 'Book a call',
  description: 'Pick a time for a call with Avi Aggarwal.',
  alternates: { canonical: '/call' },
};

/** /call: the Cal.com "Call with Avi" booking page, embedded inside the normal site shell. */
export default function CallPage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Book a call</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Pick a time that works for you. Times are shown in your own timezone.
      </p>
      <iframe
        src={`${CAL_URL}?embed=true&layout=month_view`}
        title="Book a call with Avi"
        className="h-[760px] w-full rounded-xl border-0"
        loading="lazy"
      />
      <a
        href={CAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-zinc-500 underline underline-offset-4 dark:text-zinc-400"
      >
        Open the booking page in a new tab
      </a>
    </div>
  );
}
