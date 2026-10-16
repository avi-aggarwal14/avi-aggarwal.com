'use client';
import Image from 'next/image';
import { Tilt } from '@/components/motion-primitives/tilt';
import { CardContainer } from '@/components/entry/CardContainer';
import { AnimatedLink } from '@/components/entry/AnimatedLink';
import { ProjectPreview } from '@/components/projects/ProjectPreview';
import { getLogoImageClass } from '@/lib/logo-class';
import type { Project } from '@/content/site-content';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div id={project.id} className="space-y-2 rounded-2xl p-2">
      <Tilt rotationFactor={10} springOptions={{ bounce: 0.3, damping: 20 }} isReverse className="cursor-zoom-in">
        <CardContainer padding="sm">
          <ProjectPreview project={project} />
        </CardContainer>
      </Tilt>
      <div className="px-1">
        {project.link ? (
          <AnimatedLink href={project.link} target="_blank" className="font-base font-semibold text-zinc-900 dark:text-zinc-50">
            {project.name}
          </AnimatedLink>
        ) : (
          // no public site yet: the title is plain text (the thumbnail still opens the preview when there is media)
          <span className="font-base inline-block font-semibold text-zinc-900 dark:text-zinc-50">{project.name}</span>
        )}
        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        {project.links.length > 0 && (
          <div className="mt-2 flex items-center gap-3">
            {project.links.map((link) => (
            <AnimatedLink
              key={`${link.url}-${link.label}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              ariaLabel={`${project.name} ${link.label}`}
              className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <Image
                alt=""
                aria-hidden="true"
                draggable={false}
                loading="lazy"
                width={16}
                height={16}
                className={getLogoImageClass(link.logo, false, 'project-card')}
                src={link.logo}
              />
              {link.label}
            </AnimatedLink>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
