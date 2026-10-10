'use client';
import { MorphingDialog, MorphingDialogTrigger } from '@/components/motion-primitives/morphing-dialog';
import { ProjectThumbnail } from '@/components/projects/ProjectThumbnail';
import { ProjectPreviewDialog } from '@/components/projects/ProjectPreviewDialog';
import type { Project } from '@/content/site-content';

const PREVIEW_TRANSITION = { type: 'spring', bounce: 0, duration: 0.3 } as const;

export function hasPreviewMedia(project: Project) {
  return (project.videos?.length ?? 0) > 0 || (project.images?.length ?? 0) > 0;
}

/** Thumbnail wrapped in the preview-dialog trigger, or a plain link (or static art, with no link either) when there is nothing to preview. */
export function ProjectPreview({ project }: { project: Project }) {
  const thumbnail = <ProjectThumbnail project={project} />;
  if (!hasPreviewMedia(project)) {
    if (!project.link) return <div className="block">{thumbnail}</div>;
    return (
      <a href={project.link} target="_blank" rel="noopener noreferrer" className="block">
        {thumbnail}
      </a>
    );
  }
  return (
    <MorphingDialog transition={PREVIEW_TRANSITION}>
      <MorphingDialogTrigger tabIndex={0}>{thumbnail}</MorphingDialogTrigger>
      <ProjectPreviewDialog project={project} />
    </MorphingDialog>
  );
}
