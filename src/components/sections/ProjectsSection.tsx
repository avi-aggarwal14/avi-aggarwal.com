'use client';
import { motion, type Transition } from 'motion/react';
import { SECTION_CLASS, SECTION_VARIANTS } from '@/components/sections/Section';
import { CollapsibleList } from '@/components/entry/CollapsibleList';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectPlaceholderCard } from '@/components/projects/ProjectPlaceholderCard';
import { ProjectStatsTrigger } from '@/components/projects/ProjectStatsTrigger';
import { sectionTitle, visibleCount } from '@/lib/sections';
import type { Project } from '@/content/site-content';

export function ProjectsSection({ projects, transition }: { projects: Project[]; transition: Transition }) {
  return (
    <motion.section id="projects" className={SECTION_CLASS} variants={SECTION_VARIANTS} transition={transition}>
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{sectionTitle('projects')}</h3>
        <ProjectStatsTrigger />
      </div>
      <CollapsibleList
        items={projects}
        threshold={visibleCount('projects')}
        className="-mx-3"
        itemsClassName="grid grid-cols-1 gap-6 sm:grid-cols-2"
        keyExtractor={(project) => project.id}
        renderItem={(project) => <ProjectCard key={project.name} project={project} />}
        renderPlaceholder={() => <ProjectPlaceholderCard />}
      />
    </motion.section>
  );
}
