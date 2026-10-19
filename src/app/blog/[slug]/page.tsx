import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/blog/mdx-components';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { CopyUrlButton } from '@/components/blog/CopyUrlButton';
import { siteContent } from '@/content/site-content';
import { findPost, formatPostDate, originalLine, postDateTime, publishedPosts, readPostMetaSync, readPostSource, slugOf, stripFrontmatter, type PostFrontmatter } from '@/lib/blog';
import { blogPostingJsonLdHtml } from '@/lib/seo';
import { SITE_URL } from '@/lib/site-url';

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedPosts().map((post) => ({ slug: slugOf(post) }));
}

const PROSE =
  'prose prose-gray dark:prose-invert prose-h1:text-lg prose-h1:font-semibold prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-base prose-h2:font-semibold prose-h3:text-sm prose-h3:font-semibold prose-h4:text-sm prose-h4:font-semibold prose-h5:text-sm prose-h5:font-semibold prose-h6:text-sm prose-h6:font-semibold prose-strong:font-semibold max-w-3xl';
const MUTED = 'text-sm text-zinc-500 dark:text-zinc-400';

async function loadPost(slug: string) {
  const post = findPost(slug);
  if (!post) return null;
  const source = await readPostSource(slug);
  if (!source) return null;
  // compileMDX renders the body; the front matter is read as plain strings (same parser as the markdown twin and the sitemap)
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });
  const frontmatter = stripFrontmatter(source).frontmatter as PostFrontmatter;
  return { post, content, frontmatter };
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  const { site } = siteContent;
  const url = `${SITE_URL}${post.link}`;
  const date = readPostMetaSync(post)?.date;
  const image = { url: '/api/og', width: 1200, height: 630, alt: site.ogImageAlt };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      siteName: site.title,
      locale: site.locale,
      ...(date ? { publishedTime: postDateTime(date) } : {}),
      authors: [SITE_URL],
      images: [image],
    },
    twitter: { card: 'summary_large_image', site: site.twitterCreator, creator: site.twitterCreator, title: post.title, description: post.description, images: [image] },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const loaded = await loadPost(slug);
  if (!loaded) notFound();
  const { post, content, frontmatter } = loaded;
  const origin = originalLine(frontmatter);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogPostingJsonLdHtml(post, frontmatter.date) }} />
      <div className="pointer-events-none fixed top-0 left-0 z-10 h-12 w-full bg-gray-100 to-transparent backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] dark:bg-zinc-950" />
      <ReadingProgress />
      <CopyUrlButton />
      <article className={PROSE}>
        <h1 className="mb-1">{post.title}</h1>
        {frontmatter.date && (
          <p className={`mt-0 ${MUTED}`}>
            <time dateTime={frontmatter.date}>{formatPostDate(frontmatter.date)}</time>
          </p>
        )}
        {content}
        {origin && (
          <p className={`mt-12 ${MUTED}`}>
            {origin.prefix}
            <a href={origin.href} target="_blank" rel="noopener noreferrer" className="font-normal text-zinc-500 underline dark:text-zinc-400">
              {origin.text}
            </a>
          </p>
        )}
      </article>
    </>
  );
}
