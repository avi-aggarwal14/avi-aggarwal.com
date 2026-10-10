import { siteContent, type DateRangeFields, type SectionId } from '@/content/site-content';
import { formatRange } from '@/lib/dates';
import { sectionTitle } from '@/lib/sections';
import { SITE_URL } from '@/lib/site-url';

const md = (body: string) => new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
const SEP = ' - ';

function homepageMarkdown(): string {
  const c = siteContent;
  const loc = (id: string) => {
    const l = c.locations[id];
    return l ? `${l.city}, ${l.country}` : '';
  };
  // same month-level format as the rows ("Jun 2026", "Nov 2025 - Jun 2026", "Mar 2026 - Present"); dateless rows print nothing
  const range = (e: DateRangeFields) => (e.hideDates ? '' : `${SEP}${formatRange(e.start, e.end)}`);
  // an organisation without a public site is plain text, never an empty link
  const org = (name: string, link: string) => (link ? `[${name}](${link})` : name);
  const out: string[] = [`# ${c.site.title}`, '', c.profile.about, ''];
  const section = (id: SectionId, lines: string[]) => {
    if (lines.length === 0) return;
    out.push(`## ${sectionTitle(id)}`, '', ...lines, '');
  };
  for (const id of c.sections.order) {
    switch (id) {
      case 'about':
      case 'connect':
        break;
      case 'work':
        section(id, c.work.filter((w) => !w.wip).map((w) => `- **${w.title}** at ${org(w.company, w.link)}${SEP}${loc(w.locationId)}${range(w)}`));
        break;
      case 'projects': {
        const lines: string[] = [];
        for (const p of c.projects.filter((p) => !p.hide)) {
          lines.push(`### ${org(p.name, p.link)}`, '', p.description);
          if (p.links.length) lines.push('', p.links.map((l) => `[${l.label}](${l.url})`).join(' · '));
          lines.push('');
        }
        section(id, lines);
        break;
      }
      case 'education':
        section(id, c.education.filter((e) => !e.wip).map((e) => `- **${e.degree}** at ${org(e.institution, e.link)}${SEP}${loc(e.locationId)}${range(e)}`));
        break;
      case 'research':
        section(id, c.research.filter((r) => !r.wip).map((r) => `- **${r.title}** at ${org(r.institution, r.link)}${SEP}${loc(r.locationId)}${range(r)}`));
        break;
      case 'talks':
        section(id, c.talks.filter((t) => !t.wip).map((t) => `- **${t.title}**${SEP}${org(t.event, t.link)}${SEP}${loc(t.locationId)}${SEP}${t.date}`));
        break;
      case 'volunteering':
        section(id, c.volunteering.filter((v) => !v.wip).map((v) => `- **${v.title}** at ${org(v.organization, v.link)}${SEP}${loc(v.locationId)}${range(v)}`));
        break;
      case 'awards':
        section(id, c.awards.filter((a) => !a.wip).map((a) => `- **${a.title}**${SEP}${org(a.organization, a.link)}${SEP}${loc(a.locationId)}${range(a)}`));
        break;
    }
  }
  out.push(`## ${sectionTitle('connect')}`, '', `Email: [${c.connect.email}](mailto:${c.connect.email})`, '');
  for (const s of c.socials) out.push(`- [${s.label}](${s.link.startsWith('/') ? SITE_URL + s.link : s.link})`);
  out.push('');
  return out.join('\n');
}

/** Markdown twin of the homepage: /index.md (rewritten here). */
export async function GET(_request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  if (path.length === 0 || (path.length === 1 && path[0] === 'index')) return md(homepageMarkdown());
  return new Response('Not found', { status: 404 });
}
