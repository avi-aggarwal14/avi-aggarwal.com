'use client';
import type { Transition } from 'motion/react';
import { Section } from '@/components/sections/Section';
import { CollapsibleList } from '@/components/entry/CollapsibleList';
import { EntryRow } from '@/components/entry/EntryRow';
import type { EntryRowData } from '@/lib/rows';
import { sectionTitle, visibleCount } from '@/lib/sections';
import type { SectionId } from '@/content/site-content';

type EntrySectionProps = { id: SectionId; items: EntryRowData[]; transition: Transition };

export function EntrySection({ id, items, transition }: EntrySectionProps) {
  return (
    <Section id={id} title={sectionTitle(id)} transition={transition}>
      <CollapsibleList
        items={items}
        threshold={visibleCount(id)}
        keyExtractor={(item) => item.id}
        itemsClassName="flex flex-col space-y-2"
        renderItem={(item) => <EntryRow row={item} />}
      />
    </Section>
  );
}
