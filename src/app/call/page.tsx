import type { Metadata } from 'next';
import Script from 'next/script';

const CAL_LINK = 'avi-aggarwal/call';
const CAL_URL = `https://cal.com/${CAL_LINK}`;

export const metadata: Metadata = {
  title: 'Book a call',
  description: 'Pick a time for a call with Avi Aggarwal.',
  alternates: { canonical: '/call' },
};

/** Cal.com's standard inline embed snippet; it sizes the booking widget to its content (no inner scrollbar). */
const CAL_EMBED = `
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "call", { origin: "https://app.cal.com" });
Cal.ns.call("inline", { elementOrSelector: "#cal-inline-call", config: { layout: "month_view" }, calLink: "${CAL_LINK}" });
Cal.ns.call("ui", { hideEventTypeDetails: false, layout: "month_view" });
`;

/** /call: the Cal.com "Call with Avi" booking page, embedded inside the normal site shell. */
export default function CallPage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Book a call</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Pick a time that works for you. Times are shown in your own timezone.
      </p>
      <div id="cal-inline-call" className="min-h-[600px] w-full" />
      <Script id="cal-embed-call" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: CAL_EMBED }} />
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
