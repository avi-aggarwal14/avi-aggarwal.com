import { BookCallButton } from '@/components/cta/BookCallButton';
import { siteContent } from '@/content/site-content';

/**
 * The row inserted at the middle of every post (src/lib/blog.ts picks the block boundary; the MDX files stay as
 * written): the between-section rows' hairline, line and compact pill, outside the prose styles.
 */
export function BlogMidCta() {
  const { cta } = siteContent;
  return (
    <div data-cta-mid className="not-prose my-10 flex items-center justify-between gap-4 border-t border-zinc-300/30 pt-4 dark:border-zinc-600/30">
      <p className="text-zinc-600 dark:text-zinc-400">{cta.blogMid}</p>
      <BookCallButton position="blog-mid" size="sm" magnetic />
    </div>
  );
}
