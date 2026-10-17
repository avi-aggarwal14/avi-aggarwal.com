import Script from 'next/script';

/**
 * Web analytics: PostHog (EU cloud) in cookieless mode, the same setup as hypjam.com.
 * - No cookies, no local or session storage for tracking, no session recording, no identify().
 *   Visitors are counted by PostHog's server-side hash with a daily salt, so nobody is recognised day to day.
 * - Events go through the first-party proxy at /relay (rewrites in next.config.ts), so ad blockers
 *   that block posthog.com do not drop them.
 * - Shares hypjam's PostHog project (the free plan allows one project). Every event carries
 *   site = "avi-aggarwal.com", and the Web analytics domain filter separates the two sites.
 * - Only the production host sends events. Previews and localhost send nothing unless ?ph_debug=1.
 * - Owner opt-out for one browser: open the site with ?internal=on (undo with ?internal=off).
 */
const POSTHOG_KEY = 'phc_zR9VB9hbrFTkMYN4sKBmnFquKeaFpX6hBxHAZYn6KMDw';
const PROD_HOST = 'avi-aggarwal.com';

const SNIPPET = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags on onFeatureFlags onSessionId reset get_distinct_id get_session_id set_config captureException get_property getSessionProperty opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);`;

const INIT = `(function () {
  var w = window, l = w.location, flag = 'avi_internal', dbg = /[?&]ph_debug=1\\b/.test(l.search);
  try {
    var m = l.search.match(/[?&]internal=(on|off)\\b/);
    if (m && m[1] === 'on') w.localStorage.setItem(flag, '1');
    if (m && m[1] === 'off') w.localStorage.removeItem(flag);
    if (w.localStorage.getItem(flag) === '1') return;
  } catch (e) {}
  if (l.hostname !== '${PROD_HOST}' && !dbg) return;
  ${SNIPPET}
  posthog.init('${POSTHOG_KEY}', {
    api_host: '/relay',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-05-30',
    cookieless_mode: 'always',
    person_profiles: 'never',
    disable_session_recording: true,
    disable_surveys: true,
    enable_heatmaps: true,
    capture_dead_clicks: true,
    capture_exceptions: true,
    debug: dbg
  });
  posthog.register({ site: '${PROD_HOST}' });
  if (dbg) posthog.register({ internal_test: true });
})();`;

export function PostHogAnalytics() {
  return (
    <Script id="posthog-analytics" strategy="afterInteractive">
      {INIT}
    </Script>
  );
}
