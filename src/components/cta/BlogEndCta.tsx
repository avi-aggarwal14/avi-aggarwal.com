import { BookCallButton } from '@/components/cta/BookCallButton';
import { siteContent } from '@/content/site-content';

/** Under every post, after the article: one line and the booking button, above the footer's own hairline. */
export function BlogEndCta() {
  const { cta } = siteContent;
  return (
    <div data-cta-block className="mt-16 border-t border-zinc-300/30 pt-8 dark:border-zinc-600/30">
      <p className="text-zinc-600 dark:text-zinc-400">{cta.blogEnd}</p>
      <div className="mt-5 flex">
        <BookCallButton position="blog-end" magnetic />
      </div>
    </div>
  );
}
