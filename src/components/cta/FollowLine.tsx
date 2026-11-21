import { siteContent } from '@/content/site-content';
import { cn } from '@/lib/utils';

type FollowLineProps = {
  /** a content string with {x} and {instagram} once each */
  text: string;
  /** suffix of the PostHog position: "bio" tags the links follow-x-bio / follow-ig-bio */
  position: string;
  /** the bio / Connect link style by default */
  linkClassName?: string;
};

/**
 * Renders a sentence such as "Or follow me on {x} and {instagram}." with the two placeholders as external follow links
 * (the network names and URLs come from `follow`). Inline: the caller provides the paragraph.
 */
export function FollowLine({ text, position, linkClassName }: FollowLineProps) {
  const { follow } = siteContent;
  const parts = text.split(/(\{x\}|\{instagram\})/);
  return (
    <>
      {parts.map((part, i) => {
        const network = part === '{x}' ? 'x' : part === '{instagram}' ? 'instagram' : null;
        if (!network) return part ? <span key={i}>{part}</span> : null;
        const target = follow[network];
        return (
          <a
            key={i}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            data-ph-capture-attribute-cta={`follow-${network === 'x' ? 'x' : 'ig'}-${position}`}
            className={cn('underline dark:text-zinc-300', linkClassName)}
          >
            {target.name}
          </a>
        );
      })}
    </>
  );
}
