import Image from 'next/image';
import { createElement, type ReactNode } from 'react';
import { highlight } from 'sugar-high';
import { slugify } from '@/lib/blog';
import { ProjectEmbed } from '@/components/blog/ProjectEmbed';

const COVER_SIZES = '(max-width: 768px) calc(100vw - 4rem), (max-width: 1023px) 704px, 736px';

function textOf(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(textOf).join('');
  if (children && typeof children === 'object' && 'props' in children) return textOf((children as { props: { children?: ReactNode } }).props.children);
  return '';
}

const heading = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
  function Heading({ children }: { children?: ReactNode }) {
    return createElement(`h${level}`, { id: slugify(textOf(children)) }, children);
  };

function Code({ className, children }: { className?: string; children?: ReactNode }) {
  const source = textOf(children).replace(/\n$/, '');
  return <code className={className} dangerouslySetInnerHTML={{ __html: highlight(source) }} />;
}

function Img({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={1200}
      height={630}
      draggable={false}
      className="squircle-thumb opacity-85"
      style={{ aspectRatio: '1.9/1', objectFit: 'cover' }}
      sizes={COVER_SIZES}
    />
  );
}

/** Components handed to compileMDX: slugged headings, sugar-high code, next/image images, live embeds. */
export const mdxComponents = {
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
  code: Code,
  img: Img,
  ProjectEmbed,
};
