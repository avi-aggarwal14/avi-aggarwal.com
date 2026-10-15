// Dev tool: regenerate src/content/site-content.ts from the owner's content JSON.
// Usage: node scripts/gen-content.mjs [path/to/site-content.json]   (default: handoff/avi/site-content.avi.json)
// Run scripts/gen-brand.mjs first: the personal mark path is read from scripts/brand/logo-mark.json.
import fs from 'node:fs';

const SRC = process.argv[2] ?? 'handoff/avi/site-content.avi.json';
const OUT = 'src/content/site-content.ts';
const REF_OUT = 'scripts/qa/timeline-reference.json';

const json = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const { _README: readme, timelineEntries_reference, ...data } = json;
void readme;

// Optional: a reference timeline list (RSC dedup references "$5:props:…:6:location" resolved) for scripts/qa/check-timeline.mjs.
if (timelineEntries_reference) {
  const ref = timelineEntries_reference.map((e) => ({ ...e }));
  for (const e of ref) {
    if (typeof e.location === 'string') {
      const m = e.location.match(/:allTimelineEntries:(\d+):location$/);
      e.location = ref[Number(m[1])].location;
    }
  }
  fs.writeFileSync(REF_OUT, JSON.stringify(ref, null, 2) + '\n');
} else if (fs.existsSync(REF_OUT)) fs.unlinkSync(REF_OUT);

// Unrendered reference notes are not shipped to the client.
for (const key of ['work', 'education', 'research', 'talks', 'volunteering', 'awards']) {
  for (const entry of data[key] ?? []) delete entry.note;
}

// Date validation: every interval entry is either dated ("Mon YYYY" / "Present") or, for privacy,
// explicitly dateless (hideDates: true with empty start and end). Talks always carry one date.
const MONTH_YEAR = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
const isEnd = (v) => v === 'Present' || MONTH_YEAR.test(v);
for (const key of ['work', 'education', 'research', 'volunteering', 'awards']) {
  for (const entry of data[key] ?? []) {
    const dateless = entry.hideDates === true;
    const ok = dateless ? entry.start === '' && entry.end === '' : MONTH_YEAR.test(entry.start) && isEnd(entry.end);
    if (!ok) throw new Error(`${key}/${entry.id}: ${dateless ? 'hideDates entries need start: "" and end: ""' : `bad dates "${entry.start}" - "${entry.end}"`}`);
    if (entry.hideDates === false) delete entry.hideDates;
  }
}
for (const entry of data.talks ?? []) {
  if (!MONTH_YEAR.test(entry.date)) throw new Error(`talks/${entry.id}: bad date "${entry.date}"`);
}

// Links: always a string; "" means "no public site yet" (the name renders as plain text, no link row).
for (const key of ['work', 'education', 'research', 'talks', 'volunteering', 'awards']) {
  for (const entry of data[key] ?? []) {
    if (typeof entry.link !== 'string') throw new Error(`${key}/${entry.id}: link must be a string ("" for none)`);
  }
}
for (const project of data.projects) {
  if (typeof project.link !== 'string') throw new Error(`projects/${project.id}: link must be a string ("" for none)`);
  for (const l of project.links) if (!l.url) throw new Error(`projects/${project.id}: every entry in links needs a url`);
  if (!project.link && !project.links.length && !(project.videos?.length || project.images?.length)) {
    throw new Error(`projects/${project.id}: a project with no link needs media, otherwise the card leads nowhere`);
  }
}

// Visible counts: per-section overrides of showMoreThreshold ("work": 4 shows four rows before "Show more").
const { visibleCounts = {}, showMoreThreshold, order } = data.sections;
if (!Number.isInteger(showMoreThreshold) || showMoreThreshold < 1) throw new Error(`sections.showMoreThreshold must be a positive integer`);
for (const [id, n] of Object.entries(visibleCounts)) {
  if (!order.includes(id)) throw new Error(`sections.visibleCounts: "${id}" is not a section in sections.order`);
  if (!Number.isInteger(n) || n < 1) throw new Error(`sections.visibleCounts.${id}: must be a positive integer, got ${JSON.stringify(n)}`);
}

// Writing is gone (FIX-HERO-SOCIALS): the blog route code was deleted, so the JSON must not expose it anywhere.
if (data.writing?.length) throw new Error(`writing: the Writing section was removed; ${data.writing.length} post(s) found`);
for (const [where, list] of [['sections.order', order], ['sections.navItems', data.sections.navItems], ['commandBar.placeholders', data.commandBar.placeholders]]) {
  if (list.includes('writing')) throw new Error(`${where}: "writing" is no longer a section`);
}
delete data.writing;
delete data.commandBar.groupLabels.blogpost;

// Hero and footer social rows: labels resolve to socials[].label, no duplicates (Luma is deliberately absent, Meet lives in the glass nav).
for (const [where, labels] of [['hero.socials', data.hero?.socials], ['footer.socials', data.footer?.socials]]) {
  if (!Array.isArray(labels) || labels.length === 0) throw new Error(`${where}: expected a non-empty list of social labels`);
  for (const label of labels) if (!data.socials.some((s) => s.label === label)) throw new Error(`${where}: "${label}" is not a socials[].label`);
  if (new Set(labels).size !== labels.length) throw new Error(`${where}: duplicate labels`);
}

// Every referenced file under public/ must exist (logos, card art, media, overlays), and banned names never ship.
// spelled in two parts so `grep -rni` for the banned name stays empty across scripts/ as well
const BANNED = ['growth' + 'kit'];
{
  const text = JSON.stringify(data).toLowerCase();
  for (const word of BANNED) if (text.includes(word)) throw new Error(`banned content "${word}" found in ${SRC}`);
}
const missing = new Set();
const need = (p, who) => {
  if (typeof p !== 'string' || !p.startsWith('/') || /^https?:/.test(p)) return;
  if (!fs.existsSync(`public${p}`)) missing.add(`${who}: public${p}`);
};
for (const key of ['work', 'education', 'research', 'talks', 'volunteering', 'awards']) {
  for (const entry of data[key] ?? []) need(entry.logo, `${key}/${entry.id}`);
}
for (const p of data.projects) {
  need(`/projects/${p.thumb.slug}/main.svg`, `projects/${p.id}`);
  need(`/projects/backgrounds/${p.thumb.color}.png`, `projects/${p.id}`);
  for (const v of p.videos ?? []) if (v.type === 'direct') need(v.url, `projects/${p.id}`);
  for (const src of p.images ?? []) need(src, `projects/${p.id}`);
  for (const l of p.links) need(l.logo, `projects/${p.id}`);
}
for (const p of [data.profile.avatar, data.profile.wordmark, data.profile.footerWordmark, data.profile.favicon]) need(p, 'profile');
if (missing.size) throw new Error(`missing files:\n  ${[...missing].join('\n  ')}`);

// SEO: site.homeTitle is the homepage <title>; seo.* feeds the IndexNow key file and the JSON-LD graph, so every id must resolve.
{
  const seo = data.seo;
  if (typeof data.site.homeTitle !== 'string' || !data.site.homeTitle.trim()) throw new Error('site.homeTitle is required');
  if (!seo || !/^[a-f0-9]{32}$/.test(seo.indexNowKey)) throw new Error('seo.indexNowKey must be 32 hex characters');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(seo.profilePageCreated)) throw new Error('seo.profilePageCreated must be an ISO date (YYYY-MM-DD)');
  const liveWork = new Set(data.work.filter((w) => !w.wip).map((w) => w.id));
  for (const id of [seo.worksFor, ...(seo.affiliations ?? [])]) if (!liveWork.has(id)) throw new Error(`seo: "${id}" is not a live work entry`);
  if (!data.locations[seo.homeLocationId]) throw new Error(`seo.homeLocationId: unknown location "${seo.homeLocationId}"`);
  for (const key of ['affiliations', 'knowsAbout', 'extraSameAs']) {
    if (!Array.isArray(seo[key]) || seo[key].some((v) => typeof v !== 'string' || !v)) throw new Error(`seo.${key} must be a list of non-empty strings`);
  }
  for (const url of seo.extraSameAs) if (!/^https?:\/\//.test(url)) throw new Error(`seo.extraSameAs: "${url}" is not absolute`);
  if (!Array.isArray(seo.sourceCode)) throw new Error('seo.sourceCode must be a list');
  for (const s of seo.sourceCode) {
    const p = data.projects.find((p) => p.id === s.projectId && !p.hide);
    if (!p) throw new Error(`seo.sourceCode: "${s.projectId}" is not a visible project`);
    if (!p.links.some((l) => l.url.startsWith('https://github.com/'))) throw new Error(`seo.sourceCode: ${p.id} has no GitHub link to use as codeRepository`);
    if (!p.link) throw new Error(`seo.sourceCode: ${p.id} needs a link (the SoftwareSourceCode url)`);
    for (const key of ['programmingLanguage', 'license']) if (typeof s[key] !== 'string' || !s[key]) throw new Error(`seo.sourceCode/${p.id}: ${key} is required`);
  }
  // IndexNow key file: served as /<key>.txt with exactly the key as its body (no newline); stale key files go
  for (const file of fs.readdirSync('public')) {
    if (/^[a-f0-9]{32}\.txt$/.test(file) && file !== `${seo.indexNowKey}.txt`) fs.unlinkSync(`public/${file}`);
  }
  fs.writeFileSync(`public/${seo.indexNowKey}.txt`, seo.indexNowKey);
}

// No em dash (U+2014) anywhere in the shipped content (the character is built from its code point so this script passes the same grep).
if (JSON.stringify(data).includes(String.fromCharCode(0x2014))) throw new Error('em dash (U+2014) found in the content JSON');

// Per-project overrides: hypjam's brand rules forbid recolouring the jam-orange play triangle,
// so its card art uses the real lockups (light / dark) instead of the inverted monochrome art.
for (const project of data.projects) {
  if (project.thumb.slug === 'hypjam') project.thumb.mainDark = '/projects/hypjam/main-dark.svg';
}

// Asset configuration: paths and per-file rendering rules for the files in public/.
const markFile = 'scripts/brand/logo-mark.json';
const logoMark = fs.existsSync(markFile)
  ? JSON.parse(fs.readFileSync(markFile, 'utf8'))
  : (console.warn(`${markFile} missing: run scripts/gen-brand.mjs, using an empty mark`), { path: '', viewBox: '0 0 16 16', footerViewBox: '0 0 16 8' });
data.assets = {
  projectBackgroundsDir: '/projects/backgrounds',
  projectArtDir: '/projects',
  projectOverlayProfile: '/projects/overlay-profile.png',
  projectOverlayLogo: '/projects/overlay-logo.svg',
  externalLinkIcon: '/icons/external-link.svg',
  youtubeIcon: '/icons/youtube.svg',
  // colour logos and dark tiles keep their colours in dark mode; monochrome black logos get dark:invert
  logoNoInvert: [
    'npm.svg', 'hypjam.svg', 'ignura.svg', 'cluely.png', 'gtmcakes.png', 'yummers.png', 'qe.png',
    'oxford.svg', 'barnet.png', 'vex.png', 'bebras.png', 'ugc.svg',
  ],
  logoNoCorner: [],
  logoRoundFull: [],
  darkImageVariantSlugs: [],
  logoMark,
};

const literal = JSON.stringify(data, null, 2).replace(/^(\s*)"([A-Za-z_$][\w$]*)":/gm, '$1$2:');

const file = `// Avi Aggarwal's site content. Generated by scripts/gen-content.mjs; edit the JSON source
// (or this file directly) and keep the two in sync.
//
// This is the single source of truth for all copy, links, logos and media paths.
// Components never contain content; they read from this module.
// Entries with wip: true stay hidden everywhere until they are confirmed.

export type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
export type MonthYear = \`\${Month} \${number}\`; // e.g. "Nov 2025"
export type EndValue = MonthYear | 'Present';

/**
 * Interval entries are dated unless they opt out with \`hideDates: true\` (privacy: the owner's
 * school years must not be inferable). Dateless entries render no dates anywhere, never appear on
 * the timeline and have empty \`start\` / \`end\`.
 */
export type DatedRange = { hideDates?: false; start: MonthYear; end: EndValue };
export type DatelessRange = { hideDates: true; start: ''; end: '' };
export type DateRangeFields = DatedRange | DatelessRange;

export interface Location {
  id: string;
  city: string;
  country: string;
  coordinates: { latitude: number; longitude: number };
}

export interface BaseEntry {
  id: string;
  /** organisation site; "" = no public site yet (the name renders as plain text) */
  link: string;
  logo: string;
  locationId: string;
  description: string;
  wip: boolean;
  keywords: string[];
}
export type WorkEntry = BaseEntry & { company: string; title: string } & DateRangeFields;
export type EducationEntry = BaseEntry & { institution: string; degree: string } & DateRangeFields;
export type ResearchEntry = BaseEntry & { institution: string; title: string } & DateRangeFields;
export interface TalkEntry extends Omit<BaseEntry, 'description'> { event: string; title: string; date: MonthYear }
export type VolunteeringEntry = BaseEntry & { organization: string; title: string } & DateRangeFields;
export type AwardEntry = BaseEntry & { organization: string; title: string } & DateRangeFields;

export type ProjectVideo =
  | { type: 'direct'; url: string; title: string }
  | { type: 'youtube'; id: string; title: string };

export type ThumbColor = 'grey' | 'yellow' | 'red' | 'pink' | 'orange' | 'green';

export interface Project {
  id: string;
  name: string;
  description: string;
  /** project site; "" = no public site yet (unlinked title, no link row; the thumbnail still opens the preview when there is media) */
  link: string;
  /** -> /projects/backgrounds/<color>.png + /projects/<slug>/main.svg; mainDark swaps in a dark-theme art file (no inversion) */
  thumb: { color: ThumbColor; slug: string; mainDark?: string };
  videos?: ProjectVideo[];
  images?: string[];
  links: { url: string; logo: string; label: string }[];
  hide: boolean;
  keywords: string[];
}

export interface SocialLink { id: string; label: string; link: string; keywords: string[] }

export type ThemeId = 'system' | 'light' | 'dark' | 'sunny' | 'rain' | 'night';

export interface CustomTheme {
  id: string;
  label: string;
  video: string;
  audio: string;
  baseTheme: 'light' | 'dark';
}

export type SectionId =
  | 'about' | 'work' | 'projects' | 'education' | 'research'
  | 'talks' | 'volunteering' | 'awards' | 'connect';

export interface SiteContent {
  site: {
    url: string; title: string; titleTemplate: string; description: string;
    twitterCreator: string; ogImageAlt: string; locale: string;
    themeColorLight: string; themeColorDark: string;
    /** the homepage <title>, used verbatim (absolute, no template); other routes keep titleTemplate */
    homeTitle: string;
  };
  profile: {
    name: string; handle: string; role: string; about: string; email: string;
    avatar: string; wordmark: string; footerWordmark: string; favicon: string; meetRedirect: string;
  };
  socials: SocialLink[];
  /** social labels (socials[].label) shown as a monochrome icon row under the about paragraph */
  hero: { socials: string[] };
  /** provider url contains the literal {PROMPT} placeholder */
  ai: { prompt: string; providers: { id: string; name: string; icon: string; url: string }[] };
  themes: {
    list: ThemeId[]; cycleOrder: ThemeId[]; storageKey: 'theme'; defaultTheme: 'system';
    custom: CustomTheme[];
  };
  commandBar: { placeholders: string[]; groupLabels: Record<string, string> };
  /** visibleCounts overrides showMoreThreshold per section (rows or cards shown before "Show more") */
  sections: { order: SectionId[]; navItems: SectionId[]; showMoreThreshold: number; visibleCounts?: Partial<Record<SectionId, number>> };
  work: WorkEntry[];
  projects: Project[];
  education: EducationEntry[];
  research: ResearchEntry[];
  talks: TalkEntry[];
  volunteering: VolunteeringEntry[];
  awards: AwardEntry[];
  locations: Record<string, Location>;
  connect: { intro: string; email: string; links: string[] };
  /** "{year}" is replaced with the current year; credit renders under the control bar in the same muted style; socials is the icon row next to it */
  footer: { copyright: string; credit?: { text: string; url: string }; socials: string[] };
  /** visitedCountries is a GeoJSON file built from map.visitedCountryCodes (scripts/gen-visited-countries.mjs) */
  map: { maplibreVersion: string; styles: { dark: string; light: string }; visitedCountries: string; visitedCountryCodes: string[] };
  /** Technical SEO: the IndexNow key (served at /<key>.txt) and the facts behind the JSON-LD graph (ids resolve into work, projects and locations). */
  seo: {
    indexNowKey: string;
    /** ProfilePage.dateCreated (YYYY-MM-DD) */
    profilePageCreated: string;
    /** work entry id of the Organization in Person.worksFor; its title is the Person.jobTitle */
    worksFor: string;
    /** work entry ids listed under Person.affiliation (membership only, no founder claims) */
    affiliations: string[];
    /** locations key of Person.homeLocation */
    homeLocationId: string;
    knowsAbout: string[];
    /** absolute profile URLs added to Person.sameAs after the socials */
    extraSameAs: string[];
    /** SoftwareSourceCode blocks: the project's GitHub link is the codeRepository, its link the url */
    sourceCode: { projectId: string; programmingLanguage: string; license: string }[];
  };
  /** Asset configuration: paths and per-file rendering rules for the files in public/. */
  assets: {
    projectBackgroundsDir: string;
    projectArtDir: string;
    projectOverlayProfile: string;
    projectOverlayLogo: string;
    externalLinkIcon: string;
    youtubeIcon: string;
    /** logo file names that must NOT get dark:invert (already colourful / dark-safe) */
    logoNoInvert: string[];
    /** logo file names rendered without rounded corners */
    logoNoCorner: string[];
    /** logo file names rendered fully round */
    logoRoundFull: string[];
    /** project slugs whose preview images have @dark siblings swapped in by theme */
    darkImageVariantSlugs: string[];
    /** the personal mark (favicon glyph + mobile footer outline) */
    logoMark: { path: string; viewBox: string; footerViewBox: string };
  };
}

export const siteContent: SiteContent = ${literal};

export default siteContent;

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

export type TimelineType = 'work' | 'education' | 'research' | 'talks' | 'volunteering' | 'awards';

interface ActivityBase {
  id: string;
  title: string;
  subtitle: string;
  type: TimelineType;
  location: Location;
  logo: string;
  keywords: string[];
}
/** A dated activity: the only kind the year timeline, month tiles and year search ever see. */
export type TimelineEntry = ActivityBase & DatedRange;
/** Any live activity, dated or (for privacy) dateless. The location popup and the command bar list these. */
export type ActivityEntry = ActivityBase & DateRangeFields;

export function hasDates(entry: ActivityEntry): entry is TimelineEntry {
  return entry.hideDates !== true;
}

/**
 * One flat list built from all six entry collections, in section order
 * (work → education → research → talks → volunteering → awards), including entries
 * that are collapsed behind "Show more" in their own section and dateless entries.
 * \`wip\` entries are excluded. Talks contribute start === end === date.
 */
export function getActivityEntries(content: SiteContent = siteContent): ActivityEntry[] {
  const loc = (id: string): Location => {
    const l = content.locations[id];
    if (!l) throw new Error(\`Unknown locationId "\${id}" in site content\`);
    return l;
  };
  const live = <T extends { wip: boolean }>(items: T[]) => items.filter((i) => !i.wip);
  const range = (e: DateRangeFields): DateRangeFields => (e.hideDates ? { hideDates: true, start: '', end: '' } : { start: e.start, end: e.end });
  return [
    ...live(content.work).map((e): ActivityEntry => ({ id: e.id, title: e.title, subtitle: e.company, type: 'work', location: loc(e.locationId), logo: e.logo, keywords: e.keywords, ...range(e) })),
    ...live(content.education).map((e): ActivityEntry => ({ id: e.id, title: e.degree, subtitle: e.institution, type: 'education', location: loc(e.locationId), logo: e.logo, keywords: e.keywords, ...range(e) })),
    ...live(content.research).map((e): ActivityEntry => ({ id: e.id, title: e.title, subtitle: e.institution, type: 'research', location: loc(e.locationId), logo: e.logo, keywords: e.keywords, ...range(e) })),
    ...live(content.talks).map((e): ActivityEntry => ({ id: e.id, title: e.title, subtitle: e.event, start: e.date, end: e.date, type: 'talks', location: loc(e.locationId), logo: e.logo, keywords: e.keywords })),
    ...live(content.volunteering).map((e): ActivityEntry => ({ id: e.id, title: e.title, subtitle: e.organization, type: 'volunteering', location: loc(e.locationId), logo: e.logo, keywords: e.keywords, ...range(e) })),
    ...live(content.awards).map((e): ActivityEntry => ({ id: e.id, title: e.title, subtitle: e.organization, type: 'awards', location: loc(e.locationId), logo: e.logo, keywords: e.keywords, ...range(e) })),
  ];
}

/** The derived timeline: \`getActivityEntries()\` without the dateless entries, so they never reach a year popup, a month tile or a year search. */
export function getTimelineEntries(content: SiteContent = siteContent): TimelineEntry[] {
  return getActivityEntries(content).filter(hasDates);
}
`;
fs.writeFileSync(OUT, file);
console.log(`wrote ${OUT} (${file.length} chars)`);
