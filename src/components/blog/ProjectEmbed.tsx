import { ProjectCard } from '@/components/projects/ProjectCard';
import { siteContent } from '@/content/site-content';

/** The real homepage project card embedded inside an article (`not-prose` escape hatch). */
export function ProjectEmbed({ projectId }: { projectId: string }) {
  const project = siteContent.projects.find((p) => p.id === projectId);
  if (!project) return null;
  return (
    <div className="not-prose my-6">
      <ProjectCard project={project} />
    </div>
  );
}
