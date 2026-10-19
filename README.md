# aviaggarwal

Source for [avi-aggarwal.com](https://avi-aggarwal.com), the personal site of Avi Aggarwal: founder of [hypjam](https://hypjam.com), co-founder of [Ignura](https://ignura.com), and author of [dare-mcp-server](https://github.com/avi-aggarwal14/dare-mcp-server).

## Stack
Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Motion + motion-primitives · next-themes · MapLibre GL · MDX · Vercel.

## What's in it
- Work, projects, education, writing, talks, volunteering and awards, all driven by one typed content file: `src/content/site-content.ts`.
- Click any date for a timeline of that year, or any location for a map of everything that happened there.
- Project cards open into video and image previews.
- A ⌘K command bar, a custom cursor, and five themes. Three of them (Sunny, Rain and Night) are ambient, with looping video and sound generated with [dare-mcp-server](https://github.com/avi-aggarwal14/dare-mcp-server).
- Blog posts live in `content/blog/*.mdx`.

## Editing content
Change `src/content/site-content.ts` and the files in `public/`. Entries with `wip: true` stay hidden until you flip them.

## Develop
```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

## Credits
Design inspired by [jmetrikat.com](https://jmetrikat.com) by Jannis Metrikat; rebuilt from scratch with original content, artwork and media. Wordmark set in Bricolage Grotesque (SIL Open Font License).
