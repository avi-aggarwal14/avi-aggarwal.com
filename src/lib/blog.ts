import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { siteContent, type BlogPost } from '@/content/site-content';

/** Front matter of content/blog/<slug>.mdx */
export type PostFrontmatter = {
  title?: string;
  description?: string;
  /** ISO date, e.g. 2026-05-18 */
  date?: string;
  slug?: string;
  /** where the post first appeared */
  original?: string;
  source?: string;
  /** optional link text for `original` (e.g. "Watch the reel on Instagram"); without it the line reads "Originally posted on <source>" */
  originalLabel?: string;
};

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
/** Post dates are London calendar days. */
const TIME_ZONE = 'Europe/London';

export function slugOf(post: BlogPost): string {
  return post.link.replace(/^\/blog\//, '');
}

/** Published posts (wip excluded), in content order. */
export function publishedPosts(): BlogPost[] {
  return siteContent.writing.filter((p) => !p.wip);
}

export function findPost(slug: string): BlogPost | undefined {
  return publishedPosts().find((p) => slugOf(p) === slug);
}

export async function readPostSource(slug: string): Promise<string | null> {
  try {
    return await fsp.readFile(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8');
  } catch {
    return null;
  }
}

/** Minimal front-matter split for the page metadata, the markdown alternate and the sitemap (compileMDX renders the body). */
export function stripFrontmatter(source: string): { body: string; frontmatter: Record<string, string> } {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) return { body: source, frontmatter: {} };
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) frontmatter[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }
  return { body: source.slice(match[0].length), frontmatter };
}

/** Front matter read synchronously (metadata, JSON-LD and sitemap), or null when the file is missing. */
export function readPostMetaSync(post: BlogPost): PostFrontmatter | null {
  try {
    return stripFrontmatter(fs.readFileSync(path.join(BLOG_DIR, `${slugOf(post)}.mdx`), 'utf8')).frontmatter as PostFrontmatter;
  } catch {
    return null;
  }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-05-18" -> "18 May 2026" */
export function formatPostDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * "2026-10-19" -> "2026-10-19T12:00:00+01:00": noon on that London day with its UTC offset (+01:00 in summer time,
 * +00:00 in winter). Rich Results wants a full date-time with a zone, not a bare date.
 */
export function postDateTime(iso: string): string {
  const zone = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${iso}T12:00:00Z`))
    .find((part) => part.type === 'timeZoneName')?.value;
  const offset = !zone || zone === 'GMT' ? '+00:00' : zone.replace('GMT', '');
  return `${iso}T12:00:00${offset}`;
}

/** The closing line under a post: `originalLabel` as the whole link text, else "Originally posted on <source>". */
export function originalLine(frontmatter: PostFrontmatter): { href: string; prefix: string; text: string } | null {
  const href = frontmatter.original;
  if (!href) return null;
  if (frontmatter.originalLabel) return { href, prefix: '', text: frontmatter.originalLabel };
  return { href, prefix: 'Originally posted on ', text: frontmatter.source ?? new URL(href).hostname.replace(/^www\./, '') };
}

/**
 * Inserts `tag` (one JSX line, e.g. `<BlogMidCta />`) at the block boundary closest to the middle of the article body:
 * between two paragraphs or right before a heading, never right after a heading, never inside a code fence, never
 * before the first or after the last block. The front matter stays in place and the MDX files stay as written.
 */
export function withMidCta(source: string, tag: string): string {
  const match = /^---\n[\s\S]*?\n---\n?/.exec(source);
  const head = match ? match[0] : '';
  const body = source.slice(head.length);
  // blocks: runs of lines separated by blank lines; a fenced code block is one block whatever it contains
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence && line.trim() === '') {
      if (current.length) blocks.push(current.join('\n'));
      current = [];
    } else current.push(line);
  }
  if (current.length) blocks.push(current.join('\n'));
  if (blocks.length < 3) return source;
  const total = blocks.reduce((n, b) => n + b.length, 0);
  let best = -1;
  let bestDistance = Infinity;
  let seen = 0;
  for (let i = 0; i < blocks.length - 1; i++) {
    seen += blocks[i].length;
    if (/^#{1,6}\s/.test(blocks[i])) continue; // not between a heading and its first paragraph
    const distance = Math.abs(seen - total / 2);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  if (best === -1) return source;
  return `${head}${[...blocks.slice(0, best + 1), tag, ...blocks.slice(best + 1)].join('\n\n')}\n`;
}

/** "Building a Project Preview Component" -> "building-a-project-preview-component" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
