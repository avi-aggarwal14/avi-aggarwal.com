import { BookCallButton } from '@/components/cta/BookCallButton';
import { FollowButton } from '@/components/cta/FollowButton';
import { siteContent } from '@/content/site-content';

/**
 * Under every post, after the article: one line and the booking button above the footer's own hairline, then the
 * follow block (one line, "Follow on X" and "Follow on Instagram").
 */
export function BlogEndCta() {
  const { cta } = siteContent;
  return (
    <>
      <div data-cta-block className="mt-16 border-t border-zinc-300/30 pt-8 dark:border-zinc-600/30">
        <p className="text-zinc-600 dark:text-zinc-400">{cta.blogEnd}</p>
        <div className="mt-5 flex">
          <BookCallButton position="blog-end" magnetic />
        </div>
      </div>
      <div data-follow-block className="mt-10">
        <p className="text-zinc-600 dark:text-zinc-400">{cta.blogEndFollow}</p>
        {/* the same pair as the hero: on phones both share one row (each grows from its own width), the lg box from sm up */}
        <div className="mt-4 flex items-center gap-3">
          <FollowButton network="x" position="follow-x-blog-end" size="hero" magnetic wrapperClassName="flex-auto sm:flex-none" className="w-full justify-center sm:w-auto" />
          <FollowButton network="instagram" position="follow-ig-blog-end" size="hero" magnetic wrapperClassName="flex-auto sm:flex-none" className="w-full justify-center sm:w-auto" />
        </div>
      </div>
    </>
  );
}
